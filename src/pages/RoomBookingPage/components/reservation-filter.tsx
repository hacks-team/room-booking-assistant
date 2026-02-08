import { DateField } from "@/components/date-field";
import { Controller, UseFormReturn } from "react-hook-form";
import { formatTOYYYYMMDD } from "../lib/lib";
import { InputField } from "@/components/input-field";
import { BookingFormData } from "./booking-tab";
import { SelectField } from "@/components/select-field";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tv, Presentation, Video, Volume2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function ReservationFilter() {
    const form = useFormContext<BookingFormData>();

    return (
        <>
            <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                    <DateField
                        label="날짜"
                        value={new Date(field.value)}
                        onSelect={(date) => field.onChange(formatTOYYYYMMDD(date ?? new Date()))}
                    />
                )}
            />

            <Controller
                name="attendees"
                control={form.control}
                render={({ field }) => (
                    <div>
                        <InputField label="참석 인원" type="number" min={1} value={field.value} onChange={field.onChange} />
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
                            options={generateTimeOptions(9, 20, 30)}
                            value={field.value}
                            onValueChange={field.onChange}
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
                            options={generateTimeOptions(9, 20, 30)}
                            value={field.value}
                            onValueChange={field.onChange}
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
                        onValueChange={field.onChange}
                        options={generateFloorOptions()}
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
                    </div>
                )}
            />
        </>
    )
}

const generateTimeOptions = (
    startHour: number,
    endHour: number,
    intervalMinutes: number = 30,
): Array<{ label: string; value: string }> => {
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

const generateFloorOptions = (): Array<{ label: string; value: string }> => {
    const options: Array<{ label: string; value: string }> = [];
    options.push({ label: "전체", value: "all" });
    for (let i = 1; i <= 10; i++) {
        options.push({ label: `${i}층`, value: i.toString() });
    }
    return options;
};