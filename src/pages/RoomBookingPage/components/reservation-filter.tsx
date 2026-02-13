import { DateField } from "@/components/date-field";
import { Controller, UseFormReturn } from "react-hook-form";
import { formatTOYYYYMMDD } from "../lib/lib";
import { InputField } from "@/components/input-field";
import { SelectField } from "@/components/select-field";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tv, Presentation, Video, Volume2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Equipment, Room } from "../types/types";
import { BookingFormData } from "../hooks/useBookingForm";

export function ReservationFilter() {
  const form = useFormContext<BookingFormData>();

  const queryClient = useQueryClient();

  const rooms = queryClient.getQueryData<Room[]>(["meeting-rooms"]);

  return (
    <>
      <Controller
        name="date"
        control={form.control}
        render={({ field }) => (
          <DateField
            label="날짜"
            value={new Date(field.value)}
            onSelect={(date) => {
              field.onChange(formatTOYYYYMMDD(date ?? new Date()));
              ({ date: formatTOYYYYMMDD(date ?? new Date()) });
            }}
          />
        )}
      />

      <Controller
        name="attendees"
        control={form.control}
        render={({ field }) => (
          <div>
            <InputField
              label="참석 인원"
              type="number"
              min={1}
              value={field.value}
              onChange={(e) => {
                field.onChange(Number(e.target.value));
                ({ attendees: Number(e.target.value) });
              }}
            />
            {form.formState.errors.attendees && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.attendees.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="startTime"
        control={form.control}
        render={({ field }) => (
          <div>
            <SelectField
              label="시작 시간"
              placeholder="선택"
              options={generateTimeOptions({ startHour: 9, endHour: 20, intervalMinutes: 30 })}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                ({ startTime: value });
              }}
            />
            {form.formState.errors.startTime && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.startTime.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="endTime"
        control={form.control}
        render={({ field }) => (
          <div>
            <SelectField
              label="종료 시간"
              placeholder="선택"
              options={generateTimeOptions({ startHour: 9, endHour: 20, intervalMinutes: 30 })}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                ({ endTime: value });
              }}
            />
            {form.formState.errors.endTime && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.endTime.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="floor"
        control={form.control}
        render={({ field }) => (
          <SelectField
            label="선호 층"
            placeholder="선택"
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              ({ floor: value });
            }}
            options={generateFloorOptions(rooms ?? [])}
          />
        )}
      />

      <Controller
        name="equipments"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>필요 장비</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              size="sm"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value as Equipment[]);
                ({ equipments: value as Equipment[] });
              }}
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
          </div>
        )}
      />
    </>
  );
}

const generateTimeOptions = ({
  startHour,
  endHour,
  intervalMinutes,
}: {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break;

      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push({
        label: timeString,
        value: timeString,
      });
    }
  }

  return options;
};

const generateFloorOptions = (rooms: Room[]): Array<{ label: string; value: string }> => {
  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b);

  return [
    { label: "전체", value: "all" },
    ...floors.map((floor) => ({
      label: `${floor}층`,
      value: floor.toString(),
    })),
  ];
};
