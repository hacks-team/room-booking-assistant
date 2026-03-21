import { DateField } from "@/components/date-field";
import { Controller } from "react-hook-form";
import { InputField } from "@/components/input-field";
import { SelectField } from "@/components/select-field";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tv, Presentation, Video, Volume2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Equipment, Room } from "../types/types";
import { BookingFormData } from "../hooks/useBookingForm";
import { Suspense } from "react";
import { SuspenseQuery } from "@suspensive/react-query";
import { meetingRoomsQueryOptions } from "../queries/queries";
import { format } from "date-fns";

export function ReservationForm() {
  const form = useFormContext<BookingFormData>();

  return (
    <>
      {/* // Controller를 안으로 숨기고 컴포넌트를 만들어서 인터페이스를 노출시키는 추상화도 좋을것 같다. */}
      {/* controller에 쌈싸먹기 위해서 좀 복잡해 보인다. */}
      {/* 화면에 훅폼없다. */}
      {/* controller는 훅으로도 가능하다 -> 안쓰면 응집이 가능하다.  */}
      {/* 추상화를 했을때 얻는 트레이드오프 전제를 해보고 이득이 있는지 */}
      <Controller
        name="date"
        control={form.control}
        render={({ field }) => (
          <DateField
            label="날짜"
            value={new Date(field.value)}
            onSelect={(date) => {
              field.onChange(format(date ?? new Date(), "yyyy-MM-dd"));
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
              }}
            />
            {form.formState.errors.attendees && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.attendees.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="start"
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
              }}
            />
            {form.formState.errors.start && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.start.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="end"
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
              }}
            />
            {form.formState.errors.end && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.end.message}</p>
            )}
          </div>
        )}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseQuery {...meetingRoomsQueryOptions()}>
          {({ data: rooms }) => (
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
                  }}
                  options={generateFloorOptions(rooms)}
                />
              )}
            />
          )}
        </SuspenseQuery>
      </Suspense>

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

// 순수함수다. 사이드 이펙트를 안준다.
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


// 추상화를 하고싶어. 복잡한게 뭘까? 에러메세지?