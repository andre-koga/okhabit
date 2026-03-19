/**
 * SRP: Uploads and deletes journal videos in Supabase Storage (paths, auth, public URLs).
 */
import {
  supabase,
  isSupabaseConfigured,
  getCachedUserId,
} from "@/lib/supabase";
import {
  compressVideoForUpload,
  JournalVideoUploadError,
} from "@/lib/journal-video-compression";

export { JournalVideoUploadError };

const JOURNAL_VIDEO_BUCKET = "journal-videos";
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export async function uploadJournalVideo(
  file: File,
  entryDate: string
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new JournalVideoUploadError(
      "Cloud sync is not configured. Connect Supabase in Settings to upload videos."
    );
  }

  const userId = getCachedUserId();
  if (!userId) {
    throw new JournalVideoUploadError(
      "You need to be signed in to upload videos."
    );
  }

  const fileToUpload =
    file.size > MAX_VIDEO_BYTES
      ? await compressVideoForUpload(file, MAX_VIDEO_BYTES)
      : file;

  const safeName = fileToUpload.name.replace(/[^\w.-]/g, "_").toLowerCase();
  const timestamp = Date.now();
  const path = `${userId}/${entryDate}/${timestamp}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(JOURNAL_VIDEO_BUCKET)
    .upload(path, fileToUpload, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error || !data) {
    throw new JournalVideoUploadError(
      error?.message ?? "Failed to upload video."
    );
  }

  const { data: publicUrl } = supabase.storage
    .from(JOURNAL_VIDEO_BUCKET)
    .getPublicUrl(data.path);

  if (!publicUrl?.publicUrl) {
    throw new JournalVideoUploadError(
      "Could not generate public URL for uploaded video."
    );
  }

  return publicUrl.publicUrl;
}

export async function deleteJournalVideoByUrl(videoUrl: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const objectPath = getJournalVideoObjectPath(videoUrl);
  if (!objectPath) {
    return;
  }

  const userId = getCachedUserId();
  if (!userId) {
    throw new JournalVideoUploadError(
      "You need to be signed in to remove uploaded videos."
    );
  }

  // Safety: only allow deleting objects in this user's namespace.
  if (!objectPath.startsWith(`${userId}/`)) {
    return;
  }

  const { error } = await supabase.storage
    .from(JOURNAL_VIDEO_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new JournalVideoUploadError(
      error.message ?? "Failed to delete uploaded video."
    );
  }
}

function getJournalVideoObjectPath(videoUrl: string): string | null {
  if (!videoUrl.trim()) return null;

  try {
    const parsed = new URL(videoUrl);
    const expectedPrefix = `/storage/v1/object/public/${JOURNAL_VIDEO_BUCKET}/`;
    const pathname = parsed.pathname;
    if (!pathname.startsWith(expectedPrefix)) {
      return null;
    }

    const encodedPath = pathname.slice(expectedPrefix.length);
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}
