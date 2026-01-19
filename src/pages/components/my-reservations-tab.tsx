import { SuspenseQueries, SuspenseQuery } from "@suspensive/react-query";
import { ReservationCard } from "./reservation-card";
import { getMyReservationsQuertOptions } from "@/src/remotes/reservation";
import { getRoomsQuertOptions } from "@/src/remotes/room";
import { Calendar } from "lucide-react";

export function MyReservationsTab() {
  return (
    <div className="space-y-4">
      <SuspenseQueries queries={[getMyReservationsQuertOptions(), getRoomsQuertOptions()]}>
        {([{ data: reservations }, { data: rooms }]) => {
          if (!reservations || !rooms)
            return (
              <div className="text-muted-foreground py-20 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>예약 내역이 없습니다.</p>
                <p className="mt-2 text-xs">예약 조회/취소 로직을 구현해보세요.</p>
              </div>
            );
          const roomMap = new Map(rooms.map((room) => [room.id, room]));
          return (
            <>
              {reservations.map((reservation) => {
                const room = roomMap.get(reservation.roomId);
                return (
                  <ReservationCard
                    key={reservation.id}
                    name={room?.name ?? ""}
                    date={reservation.date}
                    startTime={reservation.start}
                    endTime={reservation.end}
                    capacity={room?.capacity ?? 0}
                    equipments={room?.equipments ?? []}
                    onCancel={() => {}}
                  />
                );
              })}
            </>
          );
        }}
      </SuspenseQueries>
    </div>
  );
}
