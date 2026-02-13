import { Suspense, useState } from "react";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { timeToMinutes } from "../lib/lib";
import { SuspenseQueries } from "@suspensive/react-query";
import { RoomSelect } from "./room-select";
import { RoomList } from "./room-list";
import { Equipment, Reservation, Room } from "../types/types";
import { ReservationSubmitButton } from "./reservation-submit-button";
import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { BookingFormData } from "../hooks/useBookingForm";
import { validateBusinessHours, validateMinDuration, validateTimeRange } from "../lib/validations";

export function AvailableRoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useFormContext<BookingFormData>();
  const formValues = form.watch();
  const { date, startTime, endTime, attendees, equipments } = formValues;

  const queryClient = useQueryClient();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseQueries queries={[useMeetingRooms(), useReservations(date)]}>
          {([{ data: rooms }, { data: reservations }]) => {
            const availableRooms = filterAvailableRooms(rooms, reservations, formValues);
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
            queryKey: ["reservations", date],
          });

          queryClient.invalidateQueries({
            queryKey: ["meeting-rooms"],
          });

          setSelectedRoom(null);
          form.reset();
        }}
        onError={(error: Error) => {
          toast({
            title: "예약 실패",
            description: error.message || "예약 중 오류가 발생했습니다",
            duration: 5000,
          });
        }}
        validateReservation={validateReservation(formValues, selectedRoom)}
        postContent={{
          roomId: selectedRoom?.id ?? "",
          date,
          start: startTime,
          end: endTime,
          attendees,
          equipments,
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

  const timeRangeResult = validateTimeRange(formValues.startTime, formValues.endTime);
  if (!timeRangeResult.valid) {
    return timeRangeResult;
  }

  const startHoursResult = validateBusinessHours(formValues.startTime);
  if (!startHoursResult.valid) {
    return startHoursResult;
  }

  const endHoursResult = validateBusinessHours(formValues.endTime);
  if (!endHoursResult.valid) {
    return endHoursResult;
  }

  const minDurationResult = validateMinDuration(formValues.startTime, formValues.endTime);
  if (!minDurationResult.valid) {
    return minDurationResult;
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
