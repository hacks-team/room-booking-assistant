import { DateField } from "@/components/date-field";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { SuspenseQueries } from "@suspensive/react-query";
import { useMeetingRooms, useReservations } from "../queries/queries";
import { formatTOYYYYMMDD } from "../lib/lib";
import { RoomList } from "./room-list";
import { SubCard } from "@/components/ui/sub-card";
import { RoomCard } from "./room-card";

export function ReservationStateList({
    reservationStateDate,
}: {
    reservationStateDate: Date;
}) {
    return (
        <ErrorBoundary fallback={({ error }) => <>{error.message}</>}>
            <Suspense fallback={<div>Loading...</div>}>
                <SuspenseQueries queries={[useMeetingRooms(), useReservations(formatTOYYYYMMDD(reservationStateDate))]}>
                    {([{ data: rooms }, { data: reservations }]) => {
                        return (
                            <RoomList
                                rooms={rooms}
                                renderItem={(room) => {
                                    const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);
                                    return (
                                        <SubCard key={room.id}>
                                            <RoomCard room={room} roomReservations={roomReservations} />
                                        </SubCard>
                                    );
                                }}
                            />
                        );
                    }}
                </SuspenseQueries>
            </Suspense>
        </ErrorBoundary>
    );
}
