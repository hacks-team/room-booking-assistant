import { Suspense, useState } from "react";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { SuspenseQueries } from "@suspensive/react-query";
import { RoomSelect } from "./room-select";
import { Room } from "../types/types";
import { ReservationAction } from "./reservation-action";
import { useFormContext } from "react-hook-form";
import { BookingFormData } from "../hooks/useBookingForm";
import { filterAvailableRooms } from "../lib/filters";
import { ErrorBoundary } from "@suspensive/react";

export function AvailableRoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useFormContext<BookingFormData>();
  const formValues = form.watch();

  return (
    <>
      <ErrorBoundary fallback={({ error }) => <div>{error.message}</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <SuspenseQueries queries={[useMeetingRooms(), useReservations(formValues.date)]}>
            {([{ data: rooms }, { data: reservations }]) => {
              const availableRooms = filterAvailableRooms(rooms, reservations, formValues);
              return (
                availableRooms.map((room) => (
                  <RoomSelect
                    key={room.id}
                    name={room.name}
                    floor={room.floor}
                    capacity={room.capacity}
                    equipments={room.equipments}
                    onSelect={() => setSelectedRoom(room as Room)}
                    selected={selectedRoom?.id === room.id}
                  />
                ))
              );
            }}
          </SuspenseQueries>
        </Suspense>
      </ErrorBoundary>

      <ReservationAction
        selectedRoom={selectedRoom}
        formValues={formValues}
      />
    </>
  );
}
