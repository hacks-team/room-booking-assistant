import { queryOptions } from "@tanstack/react-query";
import { getMeetingRooms, getReservations } from "../apis/apis";

export const useMeetingRooms = () => {
  return queryOptions({
    queryKey: ["meeting-rooms"],
    queryFn: () => getMeetingRooms(),
  });
};

export const useReservations = (date: string) => {
  return queryOptions({
    queryKey: ["reservations", date],
    queryFn: () => getReservations(date),
  });
};
