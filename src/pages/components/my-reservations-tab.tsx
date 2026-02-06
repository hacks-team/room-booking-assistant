import { queryOptions } from "@tanstack/react-query";
import { ReservationCard } from "./reservation-card";
import ky from "ky";
import { Suspense } from "react";
import { SuspenseQueries, Mutation } from "@suspensive/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Reservation = {
  id: string;
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipments: string[];
};

type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipments: string[];
};

const getReservations = () => {
  return ky.get("/api/my-reservations").json<Reservation[]>();
};

const cancelReservation = (reservationId: string) => {
  return ky.delete(`/api/reservations/${reservationId}`).json<{ ok: boolean; code?: string; message?: string }>();
};

export function MyReservationsTab() {
  const queryClient = useQueryClient();

  const rooms = queryClient.getQueryData<Room[]>(["meeting-rooms"]);

  const useReservations = () => {
    return queryOptions({
      queryKey: ["my-reservations"],
      queryFn: () => getReservations(),
    });
  };

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseQueries queries={[useReservations()]}>
          {([{ data: reservations }]) => {
            if (reservations.length === 0) {
              return (
                <div className="text-muted-foreground py-20 text-center">
                  <p>예약 내역이 없습니다.</p>
                </div>
              );
            }

            return (
              <>
                {reservations.map((reservation) => {
                  const room = rooms?.find((room) => room.id === reservation.roomId);

                  return (
                    <Mutation
                      key={reservation.id}
                      mutationFn={() => cancelReservation(reservation.id)}
                      onSuccess={() => {
                        queryClient.invalidateQueries({
                          queryKey: ["my-reservations"],
                        });

                        queryClient.invalidateQueries({
                          queryKey: ["reservations", format(reservation.date, "yyyy-MM-dd")],
                        });

                        queryClient.invalidateQueries({
                          queryKey: ["meeting-rooms"],
                        });

                        toast({
                          title: "예약 취소 완료",
                          description: "예약이 성공적으로 취소되었습니다",
                          duration: 3000,
                        });
                      }}
                      onError={(error: Error) => {
                        toast({
                          variant: "destructive",
                          title: "예약 취소 실패",
                          description: error.message || "예약 취소 중 오류가 발생했습니다",
                          duration: 5000,
                        });
                      }}
                    >
                      {(mutation) => (
                        <ReservationCard
                          name={room?.name ?? ""}
                          date={reservation.date}
                          startTime={reservation.start}
                          endTime={reservation.end}
                          capacity={reservation.attendees}
                          equipments={room?.equipments ?? []}
                          onCancel={() => mutation.mutate()}
                          isCancelling={mutation.isPending}
                        />
                      )}
                    </Mutation>
                  );
                })}
              </>
            );
          }}
        </SuspenseQueries>
      </Suspense>
    </div>
  );
}
