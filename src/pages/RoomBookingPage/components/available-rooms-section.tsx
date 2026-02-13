import { Suspense, useCallback, useState } from "react";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { SuspenseQueries } from "@suspensive/react-query";
import { RoomSelect } from "./room-select";
import { RoomList } from "./room-list";
import { Room } from "../types/types";
import { ReservationSubmitButton } from "./reservation-submit-button";
import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { BookingFormData } from "../hooks/useBookingForm";
import { validateReservation } from "../lib/validations";
import { filterAvailableRooms } from "../lib/filters";

export function AvailableRoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useFormContext<BookingFormData>();
  const formValues = form.watch();
  const { date, start, end, attendees, equipments } = formValues;

  const queryClient = useQueryClient();

  const handleReservationSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reservations", date] });
    queryClient.invalidateQueries({ queryKey: ["meeting-rooms"] });
    setSelectedRoom(null);
    form.reset();
  }, [queryClient, date, form]);

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
        onSuccess={handleReservationSuccess}
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
          start,
          end,
          attendees,
          equipments,
        }}
      />
    </>
  );
}
