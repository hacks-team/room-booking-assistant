import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Presentation, Tv, Video, Volume2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface BookingFormEquipmentFieldProps {
  name: string;
  label: string;
}

export function BookingFormEquipmentField({ name, label }: BookingFormEquipmentFieldProps) {
  const { control } = useFormContext();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ToggleGroup
            type="multiple"
            variant="outline"
            spacing={2}
            size="sm"
            value={field.value as string[]}
            onValueChange={field.onChange}
          >
            <ToggleGroupItem value="tv">
              <Tv className="h-4 w-4" />
              TV
            </ToggleGroupItem>
            <ToggleGroupItem value="whiteboard">
              <Presentation className="h-4 w-4" />
              화이트보드
            </ToggleGroupItem>
            <ToggleGroupItem value="video">
              <Video className="h-4 w-4" />
              화상회의
            </ToggleGroupItem>
            <ToggleGroupItem value="speaker">
              <Volume2 className="h-4 w-4" />
              스피커
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      />
    </div>
  );
}
