"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookmarkIcon,
  Smile,
  Image as ImageIcon,
  Video,
  Save,
  X,
  Upload,
  Pencil,
  ArrowLeft,
} from "lucide-react";

interface JournalFormProps {
  userId: string;
  date: string;
  existingEntry: any | null;
  canEdit?: boolean;
  initialMode?: "view" | "edit";
}

const QUALITY_OPTIONS = [
  { value: 1, label: "😞 Bad", emoji: "😞" },
  { value: 2, label: "😕 Poor", emoji: "😕" },
  { value: 3, label: "😐 Okay", emoji: "😐" },
  { value: 4, label: "😊 Good", emoji: "😊" },
  { value: 5, label: "🤩 Great", emoji: "🤩" },
];

const COMMON_EMOJIS = [
  "😊",
  "😔",
  "😤",
  "🤗",
  "😴",
  "💪",
  "🎉",
  "📚",
  "💼",
  "🏃",
  "🎨",
  "🎮",
  "🍕",
  "☕",
  "🌟",
  "❤️",
  "🔥",
  "✨",
  "🌈",
  "⭐",
];

export default function JournalForm({
  userId,
  date,
  existingEntry,
  canEdit = true,
  initialMode = "edit",
}: JournalFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [textContent, setTextContent] = useState(
    existingEntry?.text_content || "",
  );
  const [dayQuality, setDayQuality] = useState<number | null>(
    existingEntry?.day_quality || null,
  );
  const [isBookmarked, setIsBookmarked] = useState(
    existingEntry?.is_bookmarked || false,
  );
  const [dayEmoji, setDayEmoji] = useState(existingEntry?.day_emoji || "");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    existingEntry?.photo_urls || [],
  );
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(
    existingEntry?.video_url || null,
  );
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const characterCount = textContent.length;
  const characterLimit = 500;
  const isViewMode = mode === "view";

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files].slice(0, 10)); // Max 10 photos
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string,
  ): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;
    return data.path;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload new photos
      const newPhotoUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const timestamp = Date.now();
        const path = `${userId}/${date}_${timestamp}_${i}.${file.name.split(".").pop()}`;
        const uploadedPath = await uploadFile(file, "journal-photos", path);
        newPhotoUrls.push(uploadedPath);
      }

      // Upload video if provided
      let videoUrl = existingVideoUrl;
      if (videoFile) {
        const timestamp = Date.now();
        const path = `${userId}/${date}_${timestamp}.${videoFile.name.split(".").pop()}`;
        videoUrl = await uploadFile(videoFile, "journal-videos", path);
      }

      // Combine existing and new photo URLs
      const allPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];

      // Save journal entry
      const payload = {
        user_id: userId,
        entry_date: date,
        text_content: textContent || null,
        day_quality: dayQuality,
        is_bookmarked: isBookmarked,
        day_emoji: dayEmoji || null,
        photo_urls: allPhotoUrls.length > 0 ? allPhotoUrls : null,
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("journal_entries").upsert(payload, {
        onConflict: "user_id,entry_date",
      });

      if (error) throw error;

      // Redirect back to home or show success
      alert("Journal entry saved successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save journal entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with back button and edit button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/journal")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Button>
        {canEdit && isViewMode && (
          <Button variant="default" size="sm" onClick={() => setMode("edit")}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Entry
          </Button>
        )}
        {!canEdit && isViewMode && (
          <span className="text-sm text-muted-foreground">
            Entries older than 7 days cannot be edited
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How was your day?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Day Quality */}
          <div className="space-y-2">
            <Label>Day Quality</Label>
            <div className="flex gap-2">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !isViewMode && setDayQuality(option.value)}
                  disabled={isViewMode}
                  className={`flex-1 p-3 border rounded-lg transition-all ${
                    dayQuality === option.value
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50"
                  } ${isViewMode ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs">{option.label.split(" ")[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-content">Your Thoughts</Label>
              {!isViewMode && (
                <span
                  className={`text-sm ${characterCount > characterLimit ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {characterCount}/{characterLimit}
                </span>
              )}
            </div>
            {isViewMode ? (
              <div className="p-3 border rounded-lg min-h-[100px] whitespace-pre-wrap">
                {textContent || (
                  <span className="text-muted-foreground">No notes</span>
                )}
              </div>
            ) : (
              <Textarea
                id="text-content"
                placeholder="Write about your day... What did you accomplish? How did you feel?"
                value={textContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setTextContent(e.target.value.slice(0, 500))
                }
                className="min-h-[150px] resize-none"
              />
            )}
          </div>

          {/* Day Emoji */}
          <div className="space-y-2">
            <Label>Day Emoji</Label>
            {isViewMode ? (
              <div className="text-4xl">
                {dayEmoji || (
                  <span className="text-muted-foreground text-base">
                    No emoji selected
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-16 h-16 text-3xl"
                  >
                    {dayEmoji || <Smile className="h-6 w-6" />}
                  </Button>
                  {dayEmoji && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDayEmoji("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {showEmojiPicker && (
                  <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setDayEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bookmark Toggle */}
          {!isViewMode && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isBookmarked ? "default" : "outline"}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="gap-2"
              >
                <BookmarkIcon
                  className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                />
                {isBookmarked ? "Bookmarked" : "Bookmark this day"}
              </Button>
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>
              Photos{" "}
              {isViewMode && existingPhotoUrls.length === 0 ? "" : "(optional)"}
            </Label>
            {isViewMode && existingPhotoUrls.length === 0 ? (
              <p className="text-muted-foreground text-sm">No photos</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingPhotoUrls.map((url) => (
                    <div key={url} className="relative">
                      <div className="w-20 h-20 border rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(url)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isViewMode &&
                    photoFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="w-20 h-20 border rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
                {!isViewMode &&
                  photoFiles.length + existingPhotoUrls.length < 10 && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload up to 10 photos (max 5MB each)
                      </p>
                    </>
                  )}
              </>
            )}
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>
              Video{" "}
              {isViewMode && !existingVideoUrl && !videoFile
                ? ""
                : "(optional)"}
            </Label>
            {isViewMode && !existingVideoUrl && !videoFile ? (
              <p className="text-muted-foreground text-sm">No video</p>
            ) : (
              <>
                {(existingVideoUrl || videoFile) && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Video className="h-5 w-5" />
                    <span className="text-sm flex-1">
                      {videoFile?.name || "Existing video"}
                    </span>
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setExistingVideoUrl(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {!isViewMode && !existingVideoUrl && !videoFile && (
                  <>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload one video (max 50MB)
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          {/* Save Button */}
          {!isViewMode && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !dayQuality}
                className="flex-1"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Journal Entry
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/journal")}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
