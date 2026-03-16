import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { postReservation } from "../apis/apis";
import { Room } from "../types/types";
import { BookingFormData } from "../hooks/useBookingForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateReservation } from "../lib/validations";

export function ReservationAction({
  selectedRoomId,
  formValues,
}: {
  selectedRoomId: string | null;
  formValues: BookingFormData;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: postReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", formValues.date] });
      queryClient.invalidateQueries({ queryKey: ["meeting-rooms"] });

      toast({
        title: "예약 완료",
        description: "예약이 성공적으로 완료되었습니다",
        duration: 1000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "예약 실패",
        description: error.message || "예약 중 오류가 발생했습니다",
        duration: 1000,
      });
    },
  });

  return (
    <Button size="lg" disabled={mutation.isPending} onClick={() => {
      const result = validateReservation(formValues, selectedRoomId);

      if (!result.valid) {
        toast({
          description: result.message,
          duration: 1000,
        });
        return;
      }

      mutation.mutate({
        roomId: selectedRoomId!,
        date: formValues.date,
        start: formValues.start,
        end: formValues.end,
        attendees: formValues.attendees,
        equipments: formValues.equipments,
      });
    }}>
      {mutation.isPending ? "예약 중..." : "예약하기"}
    </Button>
  );
}

