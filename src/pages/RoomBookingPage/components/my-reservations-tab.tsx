import { ReservationCard } from "./reservation-card";
import ky from "ky";
import { Suspense } from "react";
import { SuspenseQueries, Mutation } from "@suspensive/react-query";
import { useQueryClient, queryOptions } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Reservation, Room } from "../types/types";
import { ReservationList } from "./reservation-list";

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
            const isReservationsEmpty = reservations.length === 0;
            if (isReservationsEmpty) {
              return (
                <div className="text-muted-foreground py-20 text-center">
                  <p>예약 내역이 없습니다.</p>
                </div>
              );
            }

            return (
              <>
                <ReservationList
                  reservations={reservations}
                  renderItem={(reservation) => {
                    const room = rooms?.find((room) => room.id === reservation.roomId);

                    return (
                      <ReservationCard key={reservation.id}>
                        <ReservationCard.Header>
                          <ReservationCard.Title>{room?.name ?? ""}</ReservationCard.Title>
                          <ReservationCard.Info
                            date={reservation.date}
                            startTime={reservation.start}
                            endTime={reservation.end}
                            capacity={reservation.attendees}
                          />
                          <ReservationCard.Equipments equipments={room?.equipments ?? []} />
                        </ReservationCard.Header>

                        <Mutation
                          key={reservation.id}
                          mutationFn={() => cancelReservation(reservation.id)}
                          onSuccess={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["my-reservations"],
                            });

                            queryClient.invalidateQueries({
                              queryKey: ["reservations", reservation.date],
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
                            <ReservationCard.CancelButton
                              onCancel={() => mutation.mutate()}
                              disabled={mutation.isPending}
                            />
                          )}
                        </Mutation>
                      </ReservationCard>
                    );
                  }}
                />
              </>
            );
          }}
        </SuspenseQueries>
      </Suspense>
    </div>
  );
}
