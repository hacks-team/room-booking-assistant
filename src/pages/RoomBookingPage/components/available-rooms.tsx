import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Equipment, Room } from "@/src/pages/RoomBookingPage/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { useState } from "react";

import type { BookingFormValues } from "./booking-condition";
import { reservationMutations, reservationQueries } from "../queries";
import { MeetingRoom } from "../ui/meeting-room-card";

type Props = {
  title: string
  rooms: Room[];
  formValues: BookingFormValues;
};

export function AvailableRooms({ title, rooms, formValues }: Props) {
  const { date, startTime, endTime, attendees, equipments, floor } = formValues;

  const { data: reservations } = useSuspenseQuery(reservationQueries.byDate(date));

  // 조건 1: 수용 인원
  const 인원충족 = (room: Room) => room.capacity >= attendees;

  // 조건 2: 장비 포함
  const 장비포함 = (room: Room) =>
    equipments.every((eq) => room.equipments.includes(eq as Equipment));

  // 조건 3: 층 조건 (선택)
  const 층일치 = (room: Room) =>
    floor === "all" || room.floor === Number(floor);

  // 조건 4: 시간 충돌 없음
  const 시간가용 = (room: Room) => {
    if (!startTime || !endTime) return true;
    const roomReservations = reservations.filter((r) => r.roomId === room.id);
    return roomReservations.every((r) => endTime <= r.start || startTime >= r.end);
  };

  // 예약 생성
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...reservationMutations.create(),
    onSuccess: async () => {
      toast({ title: "예약이 완료되었습니다" });
      await queryClient.invalidateQueries({ queryKey: reservationQueries.byDate(date).queryKey });
      setSelectedRoomId(null);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!selectedRoomId) {
      toast({ title: "회의실을 선택해주세요" });
      return;
    }
    if (!startTime || !endTime) {
      toast({ title: "시작 시간과 종료 시간을 선택해주세요" });
      return;
    }
    if (endTime <= startTime) {
      toast({ title: "종료 시간은 시작 시간보다 늦어야 합니다" });
      return;
    }
    mutation.mutate({
      roomId: selectedRoomId,
      date,
      start: startTime,
      end: endTime,
      attendees,
      equipments: equipments as Equipment[],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <MeetingRoom
          items={rooms}
          filter={[인원충족, 장비포함, 층일치, 시간가용]}
          fallback={<p className="text-sm text-muted-foreground">조건에 맞는 회의실이 없습니다.</p>}
          renderItem={(room) => (
            <MeetingRoom.Card
              key={room.id}
              selected={selectedRoomId === room.id}
              onSelect={() => setSelectedRoomId(room.id)}
            >
              <MeetingRoom.Card.Name>{room.name}</MeetingRoom.Card.Name>
              <MeetingRoom.Card.Row>
                <MeetingRoom.Card.Info icon={Building2}>{room.floor}층</MeetingRoom.Card.Info>
                <MeetingRoom.Card.Info icon={Users}>{room.capacity}명</MeetingRoom.Card.Info>
              </MeetingRoom.Card.Row>
              <MeetingRoom.Card.Row>
                <MeetingRoom.Card.Badges items={room.equipments} variant="outline" />
              </MeetingRoom.Card.Row>
            </MeetingRoom.Card>
          )}
        />
        <Button size="lg" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? "예약 중..." : "예약하기"}
        </Button>
      </CardContent>
    </Card>
  );
}
