import { Suspense, useState } from "react";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { formatTOYYYYMMDD, timeToMinutes } from "../lib/lib";
import { SuspenseQueries } from "@suspensive/react-query";
import { RoomSelect } from "./room-select";
import { RoomList } from "./room-list";
import { Equipment, Reservation, Room } from "../types/types";
import { ReservationSubmitButton } from "./reservation-submit-button";
import { useQueryClient } from "@tanstack/react-query";
import { BookingFormData } from "./booking-tab";
import { useFormContext } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

export const BUSINESS_HOURS = {
  START: "09:00",
  END: "20:00",
  START_MINUTES: 9 * 60,
  END_MINUTES: 20 * 60,
};

export function AvailableRoomsSection({ setReservationStateDate }: { setReservationStateDate: (date: Date) => void }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useFormContext<BookingFormData>();

  const queryClient = useQueryClient();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseQueries queries={[useMeetingRooms(), useReservations(form.watch("date"))]}>
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
            queryKey: ["reservations", form.watch("date")],
          });

          queryClient.invalidateQueries({
            queryKey: ["meeting-rooms"],
          });

          setSelectedRoom(null);
          setReservationStateDate(new Date(form.watch("date")));
          form.reset();
        }}
        onError={(error: Error) => {
          toast({
            title: "예약 실패",
            description: error.message || "예약 중 오류가 발생했습니다",
            duration: 5000,
          });
        }}
        validateReservation={validateReservation(form.watch(), selectedRoom)}
        postContent={{
          roomId: selectedRoom?.id ?? "",
          date: form.watch("date"),
          start: form.watch("startTime"),
          end: form.watch("endTime"),
          attendees: form.watch("attendees"),
          equipments: form.watch("equipments"),
        }}
      />
    </>
  );
}

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
