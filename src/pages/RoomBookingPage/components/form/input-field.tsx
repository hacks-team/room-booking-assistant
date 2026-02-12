import { InputField } from "@/components/input-field";
import type { ComponentPropsWithoutRef } from "react";
import type { FieldError } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { FieldErrorMessage } from "./field-error";

interface BookingFormInputFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "name"> {
  name: string;
  label: string;
}

export function BookingFormInputField({ name, label, ...props }: BookingFormInputFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  return (
    <>
      <InputField label={label} {...props} {...register(name, { valueAsNumber: props.type === "number" })} />
      <FieldErrorMessage error={errors[name] as FieldError | undefined} />
    </>
  );
}
