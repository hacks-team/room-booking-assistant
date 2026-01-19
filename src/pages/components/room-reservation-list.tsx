import { Badge } from "@/components/ui/badge";
import { SubCard, SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { getReservationsQuertOptions } from "@/src/remotes/reservation";
import { getRoomsQuertOptions } from "@/src/remotes/room";
import { SuspenseQueries } from "@suspensive/react-query";
import { Suspense } from "react";

interface RoomReservationListProps {
  date: string;
}

export function RoomReservationList({ date }: RoomReservationListProps) {
  return (
    <Suspense>
      <SuspenseQueries queries={[getRoomsQuertOptions(), getReservationsQuertOptions(date)]}>
        {([{ data: rooms }, { data: reservations }]) => {
          return (
            <>
              {rooms.map((room) => {
                const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);
                return (
                  <SubCard key={room.id}>
                    <SubCardHeader>{room.name}</SubCardHeader>
                    <SubCardContent>
                      {roomReservations.length > 0 ? (
                        roomReservations.map((reservation) => {
                          return (
                            <Badge key={reservation.id} variant="outline">
                              {reservation.start} - {reservation.end}
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">예약 없음</p>
                      )}
                    </SubCardContent>
                  </SubCard>
                );
              })}
            </>
          );
        }}
      </SuspenseQueries>
    </Suspense>
  );
}
