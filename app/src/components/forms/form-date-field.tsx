/**
 * SRP: Renders a labeled date input field with dialog-first default styling.
 */
import type { ComponentProps } from "react";
import { FormField } from "@/components/forms/form-field";

export type FormDateFieldProps = Omit<ComponentProps<typeof FormField>, "type">;

export function FormDateField(props: FormDateFieldProps) {
  return <FormField type="date" {...props} />;
}
