import { DateField } from "@/components/date-field";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { SuspenseQueries } from "@suspensive/react-query";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { formatTOYYYYMMDD } from "../lib/lib";
import { SubCard } from "@/components/ui/sub-card";
import { RoomCard } from "./room-card";
import { useState } from "react";

export function ReservationStateList() {
  const [reservationStateDate, setReservationStateDate] = useState(formatTOYYYYMMDD(new Date()));

  return (
    <>
      <DateField
        label="날짜 선택"
        value={new Date(reservationStateDate)}
        onSelect={(selectedDate) => setReservationStateDate(formatTOYYYYMMDD(selectedDate ?? new Date()))}
      />
      <ErrorBoundary fallback={({ error }) => <>{error.message}</>}>
        <Suspense fallback={<div>Loading...</div>}>
          <SuspenseQueries queries={[useMeetingRooms(), useReservations(reservationStateDate)]}>
            {([{ data: rooms }, { data: reservations }]) => {
              return (
                rooms.map((room) => {
                  const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);
                  return (
                    <SubCard key={room.id}>
                      <RoomCard room={room} roomReservations={roomReservations} />
                    </SubCard>
                  );
                })
              );
            }}
          </SuspenseQueries>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
