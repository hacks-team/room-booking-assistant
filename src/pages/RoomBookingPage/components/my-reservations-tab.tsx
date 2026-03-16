import { Mutation, SuspenseQueries } from "@suspensive/react-query";
import { Suspense } from "react";
import { useMyReservations } from "../queries/queries";
import { Room } from "../types/types";
import { useQueryClient } from "@tanstack/react-query";
import { ReservationCard } from "./reservation-card";
import { toast } from "@/hooks/use-toast";
import { deleteReservation } from "../apis/apis";

export function MyReservationsTab() {
  const queryClient = useQueryClient();

  const rooms = queryClient.getQueryData<Room[]>(["meeting-rooms"]);

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseQueries queries={[useMyReservations()]}>
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
                {reservations.map((reservation) => {
                  const room = rooms?.find((room) => room.id === reservation.roomId);

                  return (
                    <Mutation
                      key={reservation.id}
                      mutationFn={() => deleteReservation(reservation.id)}
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
                          duration: 1000,
                        });
                      }}
                      onError={(error: Error) => {
                        toast({
                          title: "예약 취소 실패",
                          description: error.message || "예약 취소 중 오류가 발생했습니다",
                          duration: 1000,
                        });
                      }}
                    >
                      {(mutation) => (
                        <ReservationCard
                          key={reservation.id}
                          title={room?.name ?? ""}
                          date={reservation.date}
                          startTime={reservation.start}
                          endTime={reservation.end}
                          capacity={reservation.attendees}
                          equipments={room?.equipments ?? []}
                          onCancel={() => mutation.mutate()}
                          disabled={mutation.isPending}
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
