
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsIsoDate, useQueryState } from "nuqs";
import { SuspenseQueries } from "@suspensive/react-query";
import { DateField } from "@/components/date-field";
import { RoomSelect } from "./room-select";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { RoomList } from "./room-list";
import { ReservationSubmitButton } from "./reservation-submit-button";
import { Equipment, Room, Reservation } from "../types/types";
import { formatTOYYYYMMDD, timeToMinutes } from "../lib/lib";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { ReservationStateList } from "./resevation-state-list";
import { ReservationFilter } from "./reservation-filter";

const validateReservation = (
  formValues: BookingFormData,
  selectedRoom: Room | null,
): { valid: boolean; message?: string } => {
  if (!selectedRoom) {
    return {
      valid: false,
      message: "예약할 회의실을 선택해주세요",
    };
  }

  if (!formValues.startTime || !formValues.endTime) {
    return {
      valid: false,
      message: "시작 시간과 종료 시간을 모두 선택해주세요",
    };
  }

  const start = timeToMinutes(formValues.startTime);
  const end = timeToMinutes(formValues.endTime);

  if (start < BUSINESS_HOURS.START_MINUTES || start > BUSINESS_HOURS.END_MINUTES) {
    return {
      valid: false,
      message: `시작 시간은 ${BUSINESS_HOURS.START} ~ ${BUSINESS_HOURS.END} 사이여야 합니다`,
    };
  }

  if (end < BUSINESS_HOURS.START_MINUTES || end > BUSINESS_HOURS.END_MINUTES) {
    return {
      valid: false,
      message: `종료 시간은 ${BUSINESS_HOURS.START} ~ ${BUSINESS_HOURS.END} 사이여야 합니다`,
    };
  }

  if (end <= start) {
    return {
      valid: false,
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
    };
  }

  const duration = end - start;
  if (duration < 30) {
    return {
      valid: false,
      message: "최소 30분 이상 예약해야 합니다",
    };
  }

  return { valid: true };
};

export const BUSINESS_HOURS = {
  START: "09:00",
  END: "20:00",
  START_MINUTES: 9 * 60,
  END_MINUTES: 20 * 60,
};

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

const filterAvailableRooms = (rooms: Room[], reservations: Reservation[], formValues: BookingFormData): Room[] => {
  return rooms.filter((room) => {
    const capacityMatch = room.capacity >= formValues.attendees;
    const equipmentMatch = formValues.equipments?.every((equipment) =>
      room.equipments.includes(equipment as Equipment),
    );
    const selectedFloor = formValues.floor;
    const floorMatch = selectedFloor === "all" || room.floor === Number(formValues.floor);

    const reservationMatch = reservations.find((reservation) => reservation.roomId === room.id);

    if (reservationMatch) {
      const reservationTimeMatch =
        timeToMinutes(reservationMatch?.start ?? "") >= timeToMinutes(formValues.endTime) ||
        timeToMinutes(reservationMatch?.end ?? "") <= timeToMinutes(formValues.startTime);
      if (!reservationTimeMatch) {
        return false;
      }
    }

    return floorMatch && capacityMatch && equipmentMatch;
  });
};

export function BookingTab() {
  const [reservationStateDate, setReservationStateDate] = useQueryState("date", parseAsIsoDate.withDefault(new Date()));
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      date: formatTOYYYYMMDD(new Date()),
      startTime: "",
      endTime: "",
      attendees: 1,
      equipments: [],
      floor: "all",
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>

        <CardContent>
          <DateField
            label="날짜 선택"
            value={reservationStateDate}
            onSelect={(selectedDate) => setReservationStateDate(selectedDate ?? new Date())}
          />
          <ReservationStateList reservationStateDate={reservationStateDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationFilter form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SuspenseQueries queries={[useMeetingRooms(), useReservations(formatTOYYYYMMDD(reservationStateDate))]}>
              {([{ data: rooms }, { data: reservations }]) => {
                const availableRooms = filterAvailableRooms(rooms, reservations, form.watch());
                return (
                  <RoomList
                    rooms={availableRooms}
                    renderItem={(room) => (
                      <RoomSelect
                        key={room.id}
                        name={room.name}
                        floor={room.floor}
                        capacity={room.capacity}
                        equipments={room.equipments}
                        onSelect={() => setSelectedRoom(room as Room)}
                        selected={selectedRoom?.id === room.id}
                      />
                    )}
                  />
                );
              }}
            </SuspenseQueries>
          </Suspense>

          <ReservationSubmitButton
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["reservations", formatTOYYYYMMDD(reservationStateDate)],
              });

              queryClient.invalidateQueries({
                queryKey: ["meeting-rooms"],
              });

              setSelectedRoom(null);
              form.reset();
            }}
            onError={(error: Error) => {
              toast({
                variant: "destructive",
                title: "예약 실패",
                description: error.message || "예약 중 오류가 발생했습니다",
                duration: 5000,
              });
            }}
            validateReservation={validateReservation(form.watch(), selectedRoom)}
            postContent={{
              roomId: selectedRoom?.id ?? "",
              date: formatTOYYYYMMDD(reservationStateDate),
              start: form.watch("startTime"),
              end: form.watch("endTime"),
              attendees: form.watch("attendees"),
              equipments: form.watch("equipments"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
