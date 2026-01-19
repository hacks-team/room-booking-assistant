import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InputFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  onValueChange?: (value: string) => void;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, onValueChange, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input
        {...props}
        ref={ref}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </div>
  );
});
