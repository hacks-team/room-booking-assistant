import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { DeleteReservationResponse, Reservation, Room } from "@/src/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Clock, Trash2, Users } from "lucide-react";

import { MeetingRoom } from "../ui/meeting-room-card";

export function MyReservationsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations } = useSuspenseQuery<Reservation[]>({
    queryKey: ["get/my-reservations"],
    queryFn: () => fetch("/api/my-reservations").then((res) => res.json()) as Promise<Reservation[]>,
  });

  const { data: rooms } = useSuspenseQuery<Room[]>({
    queryKey: ["get/rooms"],
    queryFn: () => fetch("/api/rooms").then((res) => res.json()) as Promise<Room[]>,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      const data: DeleteReservationResponse = await (res.json() as Promise<DeleteReservationResponse>);
      if (!data.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: async () => {
      toast({ title: "예약이 취소되었습니다" });
      await queryClient.invalidateQueries({ queryKey: ["get/my-reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["get/reservations"] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const getRoomName = (roomId: string) =>
    rooms.find((room) => room.id === roomId)?.name ?? roomId;

  if (reservations.length === 0) {
    return (
      <div className="text-muted-foreground py-20 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>예약 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MeetingRoom
        items={reservations}
        renderItem={(reservation) => (
          <MeetingRoom.Card key={reservation.id}>
            <MeetingRoom.Card.Name>
              {getRoomName(reservation.roomId)}
            </MeetingRoom.Card.Name>
            <MeetingRoom.Card.Row>
              <MeetingRoom.Card.Info icon={Calendar}>{reservation.date}</MeetingRoom.Card.Info>
              <MeetingRoom.Card.Info icon={Clock}>{reservation.start} - {reservation.end}</MeetingRoom.Card.Info>
              <MeetingRoom.Card.Info icon={Users}>{reservation.attendees}명</MeetingRoom.Card.Info>
            </MeetingRoom.Card.Row>
            <MeetingRoom.Card.Row>
              <MeetingRoom.Card.Badges items={reservation.equipments} variant="secondary" />
            </MeetingRoom.Card.Row>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelMutation.mutate(reservation.id)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              취소
            </Button>
          </MeetingRoom.Card>
        )}
      />
    </div>
  );
}
