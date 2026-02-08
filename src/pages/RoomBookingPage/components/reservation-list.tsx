import { Reservation } from "../types/types";

export function ReservationList({
  reservations,
  renderItem,
}: {
  reservations: Reservation[];
  renderItem: (reservation: Reservation) => React.ReactNode;
}) {
  return <>{reservations.map((reservation) => renderItem(reservation))}</>;
}
