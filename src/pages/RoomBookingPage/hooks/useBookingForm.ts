import { useEffect } from "react";
import { Equipment } from "../types/types";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formatTOYYYYMMDD } from "../lib/lib";
import { validateTimeRange } from "../lib/validations";

const bookingSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
    start: z.string(),
    end: z.string(),
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
      const result = validateTimeRange(data.start, data.end);
      return result.valid;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
      path: ["endTime"],
    },
  );

export type BookingFormData = z.infer<typeof bookingSchema>;

export function useBookingForm() {
  const [{ date, start, end, attendees, equipments, floor }, setQueryStates] = useQueryStates({
    date: parseAsString,
    start: parseAsString,
    end: parseAsString,
    attendees: parseAsInteger,
    equipments: parseAsArrayOf(parseAsString).withDefault([] as Equipment[]),
    floor: parseAsString.withDefault("all"),
  });

  const bookingForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      date: date ?? formatTOYYYYMMDD(new Date()),
      start: start ?? "",
      end: end ?? "",
      attendees: attendees ?? 1,
      equipments: (equipments ?? []) as Equipment[],
      floor: floor ?? "all",
    },
  });

  useEffect(() => {
    const subscription = bookingForm.watch((values) => {
      const queryParams: Partial<{
        date: string | null;
        start: string | null;
        end: string | null;
        attendees: number | null;
        equipments: string[] | null;
        floor: string | null;
      }> = {};

      if (values.date) {
        queryParams.date = values.date;
      }

      if (values.start) {
        queryParams.start = values.start;
      }

      if (values.end) {
        queryParams.end = values.end;
      }

      if (values.attendees && values.attendees !== 1) {
        queryParams.attendees = values.attendees;
      }

      const filteredEquipments = values.equipments?.filter((v): v is NonNullable<typeof v> => v != null);
      queryParams.equipments = filteredEquipments && filteredEquipments.length > 0 ? filteredEquipments : null;

      queryParams.floor = values.floor && values.floor !== "all" ? values.floor : null;

      setQueryStates(queryParams);
    });

    return () => subscription.unsubscribe();
  }, [bookingForm, setQueryStates]);

  return bookingForm;
}
