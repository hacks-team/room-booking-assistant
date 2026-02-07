import { useToast } from "@/hooks/use-toast";
import type { DeleteReservationResponse, Reservation, Room } from "@/src/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";

import { ReservationCard } from "../ui/reservation-card";

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
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          name={getRoomName(reservation.roomId)}
          date={reservation.date}
          startTime={reservation.start}
          endTime={reservation.end}
          capacity={reservation.attendees}
          equipments={reservation.equipments}
          onCancel={() => cancelMutation.mutate(reservation.id)}
        />
      ))}
    </div>
  );
}
