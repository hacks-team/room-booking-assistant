import { Badge } from "@/components/ui/badge";
import { SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { Reservation, Room } from "./booking-tab";

export function RoomCard({ room, roomReservations }: { room: Room; roomReservations: Reservation[] }) {
  return (
    <>
      <SubCardHeader>{room.name}</SubCardHeader>
      <SubCardContent>
        {roomReservations.length > 0 ? (
          roomReservations.map((reservation) => (
            <Badge key={reservation.id} variant="outline">{`${reservation.start} - ${reservation.end}`}</Badge>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">예약 없음</p>
        )}
      </SubCardContent>
    </>
  );
}
