import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "@/src/pages/RoomBookingPage/types";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { BookingForm } from "./form";
import { generateFloorOptions, generateTimeOptions } from "../utils";

export const bookingSchema = z
  .object({
    date: z.string(),
    startTime: z.string().min(1, "시작 시간을 선택해주세요"),
    endTime: z.string().min(1, "종료 시간을 선택해주세요"),
    attendees: z.coerce.number().min(1, "참석 인원은 1명 이상이어야 합니다"),
    equipments: z.array(z.string()),
    floor: z.string(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "종료 시간은 시작 시간보다 늦어야 합니다",
    path: ["endTime"],
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;

type Props = {
  title: string
  rooms: Room[];
  methods: UseFormReturn<BookingFormValues>;
};

export function BookingCondition({ title, rooms, methods }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BookingForm methods={methods}>
          <BookingForm.DateField name="date" label="날짜" />
          <BookingForm.InputField name="attendees" label="참석 인원" placeholder="1" type="number" min={1} />
          <BookingForm.SelectField name="startTime" label="시작 시간" options={generateTimeOptions(9, 20)} />
          <BookingForm.SelectField name="endTime" label="종료 시간" options={generateTimeOptions(20, 9)} />
          <BookingForm.SelectField name="floor" label="선호 층 (선택)" options={generateFloorOptions(rooms.map((room) => room.floor))} />
          <BookingForm.EquipmentField name="equipments" label="필요 장비" />
        </BookingForm>
      </CardContent>
    </Card>
  );
}
