export interface FeatureRelease {
  /** ISO date (YYYY-MM-DD) for sorting and display */
  date: string;
  title: string;
  bullets: string[];
  /** Shown below features in smaller type */
  fixes?: string[];
}

/** Newest first. Edit this list when you ship user-visible changes. */
export const FEATURE_RELEASES: FeatureRelease[] = [
  {
    date: "2026-04-24",
    title: "What’s New and Feedback!",
    bullets: [
      "Open What’s new from the More menu to see a running history of improvements.",
      "Send feedback and feature requests from More → Feedback / requests.",
    ],
    fixes: [
      "Dialogs are no longer covered by the on-screen keyboard on mobile.",
      "Edit button on groups and activities allows for archiving.",
      "Deleted memos now actually get deleted.",
      "App doesn't force account log off due to bad internet connection.",
      "Previous days' readonly journal activities are now properly rendered.",
      "Saves temporarily changes made to journal and quick task dialogs if accidentally click outside.",
    ],
  },
];
