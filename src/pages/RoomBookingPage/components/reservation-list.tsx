import { Reservation } from "./booking-tab";

export function ReservationList({ reservations, renderItem }: { reservations: Reservation[], renderItem: (reservation: Reservation) => React.ReactNode }) {
    return <>{reservations.map((reservation) => renderItem(reservation))}</>;
}