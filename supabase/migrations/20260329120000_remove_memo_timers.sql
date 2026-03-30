-- Memo timers removed: drop memo_periods and daily_entries.current_memo_id (completion-only memos remain on one_time_tasks).

DROP TABLE IF EXISTS memo_periods;

ALTER TABLE daily_entries DROP COLUMN IF EXISTS current_memo_id;
