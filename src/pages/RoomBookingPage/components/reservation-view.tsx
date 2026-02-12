import { DateField } from "@/components/date-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";

import { Reservation, Room } from "../types";
import { MeetingRoom } from "../ui/meeting-room-card";


type Props = {
  rooms: Room[]
  title: string
}

export const ReservationView = ({ rooms, title }: Props) => {
  const [date, setDate] = useState<Date>(new Date())
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  // 예약 현황
  const { data: reservations } = useSuspenseQuery<Reservation[]>({
    queryKey: ["get/reservations", formattedDate],
    queryFn: () => fetch(`/api/reservations?date=${formattedDate}`).then((res) => res.json()),
  });

  const onSelect = (date?: Date) => {
    setDate(date)
  }
  const reservedRoomIds = new Set(reservations.map((r) => r.roomId));

  return <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <DateField label="날짜 선택" value={date} onSelect={onSelect} />

      <MeetingRoom
        items={rooms}
        filter={[(room) => reservedRoomIds.has(room.id)]}
        renderItem={(room) => {
          const roomReservations = reservations.filter((r) => r.roomId === room.id);
          return (
            <MeetingRoom.Card key={room.id}>
              <MeetingRoom.Card.Name>{room.name}</MeetingRoom.Card.Name>
              <MeetingRoom.Card.Row>
                <MeetingRoom.Card.Badges
                  items={roomReservations.map((r) => `${r.start} - ${r.end}`)}
                  variant="outline"
                />
              </MeetingRoom.Card.Row>
            </MeetingRoom.Card>
          );
        }}
      />
    </CardContent>
  </Card>
}