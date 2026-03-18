import { queryOptions } from "@tanstack/react-query";
import { getMeetingRooms, getMyReservations, getReservations } from "../apis/apis";

export const meetingRoomsQueryOptions = () => {
  return queryOptions({
    queryKey: ["meeting-rooms"],
    queryFn: () => getMeetingRooms(),
  });
};

export const reservationsQueryOptions = (date: string) => {
  return queryOptions({
    queryKey: ["reservations", date],
    queryFn: () => getReservations(date),
  });
};

export const myReservationsQueryOptions = () => {
  return queryOptions({
    queryKey: ["my-reservations"],
    queryFn: () => getMyReservations(),
  });
};
