import { queryOptions } from "@tanstack/react-query";
import { Reservation } from "../types";
import ky from "ky";

export const getReservations = async (date: string) =>
  ky.get("/api/reservations", { searchParams: { date } }).json<Reservation[]>();

export const getReservationsQuertOptions = (date: string) =>
  queryOptions({
    queryKey: ["reservations", date],
    queryFn: () => getReservations(date),
  });

export const getMyReservations = async () => ky.get("/api/my-reservations").json<Reservation[]>();

export const getMyReservationsQuertOptions = () =>
  queryOptions({
    queryKey: ["my-reservations"],
    queryFn: getMyReservations,
  });
