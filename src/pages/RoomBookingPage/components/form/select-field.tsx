import { SelectField } from "@/components/select-field";
import { Controller, useFormContext } from "react-hook-form";

import { FieldErrorMessage } from "./field-error";

interface BookingFormSelectFieldProps {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export function BookingFormSelectField({ name, label, options, placeholder }: BookingFormSelectFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <SelectField
            label={label}
            options={options}
            placeholder={placeholder}
            value={field.value as string}
            onValueChange={field.onChange}
          />
          <FieldErrorMessage error={fieldState.error} />
        </>
      )}
    />
  );
}
