import { useEffect } from "react";
import { Equipment } from "../types/types";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { timeToMinutes, formatTOYYYYMMDD } from "../lib/lib";

const bookingSchema = z
  .object({
    date: z.string().datetime(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.coerce
      .number({
        invalid_type_error: "숫자를 입력해주세요",
      })
      .min(1, "1명 이상이어야 합니다"),
    equipments: z.array(z.enum(["tv", "whiteboard", "video", "speaker"])).optional(),
    floor: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      return end > start;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
      path: ["endTime"],
    },
  );

export type BookingFormData = z.infer<typeof bookingSchema>;

export function useBookingForm() {
  const [{ date, startTime, endTime, attendees, equipments, floor }, setQueryStates] = useQueryStates({
    date: parseAsString,
    startTime: parseAsString,
    endTime: parseAsString,
    attendees: parseAsInteger,
    equipments: parseAsArrayOf(parseAsString).withDefault([] as Equipment[]),
    floor: parseAsString.withDefault("all"),
  });

  const bookingForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      date: date ?? formatTOYYYYMMDD(new Date()),
      startTime: startTime ?? "",
      endTime: endTime ?? "",
      attendees: attendees ?? 1,
      equipments: (equipments ?? []) as Equipment[],
      floor: floor ?? "all",
    },
  });

  useEffect(() => {
    const subscription = bookingForm.watch((values) => {
      const queryParams: Partial<{
        date: string | null;
        startTime: string | null;
        endTime: string | null;
        attendees: number | null;
        equipments: string[] | null;
        floor: string | null;
      }> = {};

      if (values.date) {
        queryParams.date = values.date;
      }

      if (values.startTime) {
        queryParams.startTime = values.startTime;
      }

      if (values.endTime) {
        queryParams.endTime = values.endTime;
      }

      if (values.attendees && values.attendees !== 1) {
        queryParams.attendees = values.attendees;
      }

      const filteredEquipments = values.equipments?.filter((v): v is NonNullable<typeof v> => v != null);
      if (filteredEquipments && filteredEquipments.length > 0) {
        queryParams.equipments = filteredEquipments;
      }

      if (values.floor && values.floor !== "all") {
        queryParams.floor = values.floor;
      }

      setQueryStates(queryParams);
    });

    return () => subscription.unsubscribe();
  }, [bookingForm, setQueryStates]);

  return bookingForm;
}
