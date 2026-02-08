import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mutation } from "@suspensive/react-query";
import { postReservation, PostReservationDto } from "./booking-tab";

export function ReservationSubmitButton({
    onSuccess,
    onError,
    postContent,
    validateReservation,
}: {
    onSuccess: () => void;
    onError: (error: Error) => void;
    postContent: PostReservationDto;
    validateReservation: { valid: boolean; message?: string };
}) {
    return (
        <Mutation
            mutationFn={(data: PostReservationDto) => postReservation(data)}
            onSuccess={onSuccess}
            onError={onError}
        >
            {(mutation) => (
                <Button
                    size="lg"
                    disabled={mutation.isPending}
                    onClick={() => {
                        if (!validateReservation.valid) {
                            toast({
                                description: validateReservation.message,
                                duration: 1000,
                            });
                            return;
                        }

                        mutation.mutate(postContent);
                    }}
                >
                    {mutation.isPending ? "예약 중..." : "예약하기"}
                </Button>
            )}
        </Mutation>
    )
}