import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateFieldProps {
  label?: string;
  value?: Date;
  onSelect?: (date?: Date) => void;
}

const DateField = ({ label, value, onSelect }: DateFieldProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedDate;

  const handleDateChange = (date?: Date) => {
    if (isControlled) {
      onSelect?.(date ? date : undefined);
    } else {
      setSelectedDate(date);
    }
  };
  return (
    <>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between font-normal">
            {currentValue ? currentValue.toLocaleDateString() : "날짜 선택"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar mode="single" captionLayout="dropdown" selected={currentValue} onSelect={handleDateChange} />
        </PopoverContent>
      </Popover>
    </>
  );
};

export { DateField };
