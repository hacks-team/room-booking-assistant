import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InputFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input {...props} ref={ref} />
    </div>
  );
});
