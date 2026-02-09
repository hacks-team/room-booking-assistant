import { DateField } from "@/components/date-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingRoom } from "../ui/meeting-room-card";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Reservation, Room } from "../types";
import dayjs from "dayjs";


type Props = {
    rooms : Room[]
}

export const ReservationView = ({rooms}:Props) => {
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

    return  <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField label="날짜 선택" value={date} onSelect={onSelect} />

          <MeetingRoom
            items={[...new Set(reservations.map((r) => r.roomId))]}
            renderItem={(roomId) => {
              const room = rooms.find((r) => r.id === roomId);
              const roomReservations = reservations.filter((r) => r.roomId === roomId);
              const startTime = roomReservations[0].start;
              const endTime = roomReservations[0].end;
              return (
                <MeetingRoom.Card key={roomId}>
                  <MeetingRoom.Card.Name>{room?.name ?? roomId}</MeetingRoom.Card.Name>
                  <MeetingRoom.Card.Row>
                    <MeetingRoom.Card.Badges items={[`${startTime} - ${endTime}`]} variant="outline" />
                  </MeetingRoom.Card.Row>
                </MeetingRoom.Card>
              );
            }}
          />
        </CardContent>
      </Card>
}