import { DateField } from "@/components/date-field";
import { Controller, useFormContext } from "react-hook-form";

import { FieldErrorMessage } from "./field-error";

interface BookingFormDateFieldProps {
  name: string;
  label: string;
}

export function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function BookingFormDateField({ name, label }: BookingFormDateFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <DateField
            label={label}
            value={parseDate(field.value as string)}
            onSelect={(date) => {
              if (date) field.onChange(formatDate(date));
            }}
          />
          <FieldErrorMessage error={fieldState.error} />
        </>
      )}
    />
  );
}
