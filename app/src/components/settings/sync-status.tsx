import { useState, useEffect, useRef } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { syncEngine } from "@/lib/sync";
import { useAuth } from "@/lib/use-auth";

export default function SyncStatus() {
  const FADE_OUT_DELAY_MS = 2200;
  const [syncState, setSyncState] = useState(syncEngine.getState());
  const {
    isSupabaseConfigured,
    isAuthed,
    authLoading,
    authError,
    signIn,
    signUp,
    signOut,
  } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const hideTimerRef = useRef<number | null>(null);
  const prevIsSyncingRef = useRef(syncState.isSyncing);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe(setSyncState);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearHideTimer();
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAuthed) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with auth state */
      setShowAuth(false);
    }
  }, [isAuthed]);

  useEffect(() => {
    const wasSyncing = prevIsSyncingRef.current;

    if (syncState.isSyncing) {
      clearHideTimer();
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with external sync engine */
      setIsVisible(true);
      prevIsSyncingRef.current = true;
      return;
    }

    const justFinished = wasSyncing && !syncState.isSyncing;
    const hasResult = Boolean(syncState.lastSyncAt || syncState.lastError);
    if (justFinished || (syncState.lastError && hasResult)) {
      setIsVisible(true);
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, FADE_OUT_DELAY_MS);
    }

    prevIsSyncingRef.current = syncState.isSyncing;
  }, [syncState.isSyncing, syncState.lastSyncAt, syncState.lastError]);

  const handleManualSync = async () => {
    setIsVisible(true);
    try {
      await syncEngine.sync();
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setEmail("");
      setPassword("");
      setShowAuth(false);
    } catch {
      // authError handled by useAuth
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setEmail("");
      setPassword("");
    } catch {
      // authError handled by useAuth
    }
  };

  if (!isSupabaseConfigured) {
    return null;
  }

  const canSync = isAuthed && isOnline;
  const lastSyncTime = syncState.lastSyncAt
    ? new Date(syncState.lastSyncAt).toLocaleTimeString()
    : "Never";

  return (
    <div
      className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-opacity duration-500 ${
        isVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Sync status pill */}
      <div className="rounded-full border border-border bg-background shadow-lg">
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={handleManualSync}
            disabled={syncState.isSyncing || !canSync}
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            title={
              !isOnline
                ? "Offline"
                : !isAuthed
                  ? "Not signed in"
                  : syncState.isSyncing
                    ? "Syncing..."
                    : "Click to sync now"
            }
          >
            {!isOnline ? (
              <CloudOff className="h-3.5 w-3.5" />
            ) : canSync ? (
              syncState.isSyncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : syncState.lastError ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Cloud className="h-3.5 w-3.5 text-green-500" />
              )
            ) : (
              <CloudOff className="h-3.5 w-3.5" />
            )}

            <span className="text-xs">
              {!isOnline
                ? "Offline"
                : syncState.isSyncing
                  ? "Syncing..."
                  : syncState.lastError
                    ? "Error"
                    : `${lastSyncTime}`}
            </span>
          </button>

          {/* Auth button */}
          {isAuthed ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(!showAuth)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Sign in to sync"
            >
              <LogIn className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Auth form popup */}
      {showAuth && !isAuthed && (
        <div className="absolute left-1/2 top-14 w-72 -translate-x-1/2 rounded-lg border border-border bg-background p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-semibold">Sign In to Sync</h3>
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            {authError && (
              <p
                className={`text-xs ${authError.includes("Check your email") ? "text-green-500" : "text-red-500"}`}
              >
                {authError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={authLoading}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {authLoading ? "..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={authLoading}
                className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                {authLoading ? "..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error details */}
      {syncState.lastError && (
        <div className="absolute left-1/2 top-14 w-72 -translate-x-1/2 rounded-lg border border-red-500/50 bg-background p-3 shadow-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="mb-1 text-xs font-semibold text-red-500">
                Sync Error
              </p>
              <p className="text-xs text-muted-foreground">
                {syncState.lastError}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
