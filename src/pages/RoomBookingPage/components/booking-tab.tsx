import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { formatTOYYYYMMDD, timeToMinutes } from "../lib/lib";
import { ReservationStateList } from "./resevation-state-list";
import { ReservationFilter } from "./reservation-filter";
import { AvailableRoomsSection } from "./available-rooms-section";
import { FormProvider } from "react-hook-form";
import { Equipment } from "../types/types";

export function BookingTab() {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>

        <CardContent>
          <ReservationStateList />
        </CardContent>
      </Card>

      <FormProvider {...bookingForm}>
        <Card>
          <CardHeader>
            <CardTitle>예약 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationFilter setQueryStates={setQueryStates} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>예약 가능한 회의실</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailableRoomsSection />
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}

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
