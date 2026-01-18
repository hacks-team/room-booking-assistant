import { ComponentPropsWithoutRef } from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SelectFieldProps extends ComponentPropsWithoutRef<typeof Select> {
  label: string;
  placeholder?: string;
  options: { label: string; value: string }[];
}

const SelectField = ({ label, options, placeholder = "선택", ...props }: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="start-time">{label}</Label>
      <Select {...props}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { SelectField };
