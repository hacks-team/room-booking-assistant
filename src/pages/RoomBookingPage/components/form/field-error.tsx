import type { FieldError } from "react-hook-form";

interface FieldErrorMessageProps {
  error?: FieldError;
}

export function FieldErrorMessage({ error }: FieldErrorMessageProps) {
  if (!error) return null;
  return <p className="text-sm text-red-500">{error.message}</p>;
}
