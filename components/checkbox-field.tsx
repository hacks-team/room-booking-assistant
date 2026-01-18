import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface CheckboxFieldProps {
  label: string;
  values: string[];
  options: { label: string; value: string }[];
}

const CheckboxField = ({ label, values, options }: CheckboxFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox value={option.value} checked={values.includes(option.value)} />
          <Label className="cursor-pointer font-normal">{option.label}</Label>
        </div>
      ))}
    </div>
  );
};

export { CheckboxField };
