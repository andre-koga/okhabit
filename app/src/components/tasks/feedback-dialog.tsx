import { useMemo, useState } from "react";
import {
  FormDialog,
  FormDialogActions,
  FormStack,
  FormTextareaField,
} from "@/components/forms";
import {
  getCachedUserId,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEEDBACK_LIMIT = 5000;

export default function FeedbackDialog({
  open,
  onOpenChange,
}: FeedbackDialogProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignedIn = Boolean(getCachedUserId());
  const canSubmit = isSupabaseConfigured && supabase && isSignedIn;

  const helperText = useMemo(() => {
    if (!isSupabaseConfigured || !supabase) {
      return "Cloud sync is not configured on this device.";
    }
    if (!isSignedIn) {
      return "Sign in to send feedback from inside the app.";
    }
    return "";
  }, [isSignedIn]);

  const resetForm = () => {
    setMessage("");
    setError(null);
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Please enter your feedback before submitting.");
      return;
    }
    if (!canSubmit || !supabase) {
      setError("You need cloud sync and a signed-in account to send feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: invokeError } = await supabase.functions.invoke(
      "submit-feedback",
      {
        body: { message: trimmedMessage },
      }
    );

    if (invokeError) {
      setError(invokeError.message || "Could not send feedback right now.");
      setSubmitting(false);
      return;
    }

    handleOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Send feedback"
      description="Tell us what you want improved, added, or fixed."
      contentClassName="w-80"
    >
      <FormStack className="space-y-2">
        <FormTextareaField
          id="feedback-message"
          label="Feedback"
          labelClassName="sr-only"
          autoFocus
          rows={6}
          maxLength={FEEDBACK_LIMIT}
          value={message}
          disabled={submitting || !canSubmit}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share your request or feedback..."
          message={helperText}
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </FormStack>
      <FormDialogActions
        onConfirm={() => void handleSubmit()}
        confirmLabel={submitting ? "Sending..." : "Send feedback"}
        confirmDisabled={submitting || !canSubmit || !message.trim()}
        secondaryAction={{
          label: "Cancel",
          onClick: () => handleOpenChange(false),
          disabled: submitting,
        }}
      />
    </FormDialog>
  );
}
