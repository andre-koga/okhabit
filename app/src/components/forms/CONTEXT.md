# components/forms

Shared form composition building blocks for dialog and floating input workflows.

## Purpose

This folder contains reusable form components that compose primitives from `components/ui`.
It standardizes common field and action patterns so feature dialogs do not duplicate styles.

## Scope

- Labeled dialog-first text fields and textareas
- Labeled select and date inputs
- Reusable dialog action row for confirm/cancel/delete flows

## Conventions

- Keep low-level primitives in `components/ui`.
- Keep feature-specific business logic in feature folders.
- Keep shared form look-and-feel centralized through local form style tokens.
