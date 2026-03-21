import ky from "ky";
import { PostReservationDto, Reservation, Room } from "../types/types";

export const getMeetingRooms = () => {
  return ky.get("/api/rooms").json<Room[]>();
};

export const getReservations = (date: string) => {
  return ky.get(`/api/reservations?date=${date}`).json<Reservation[]>();
};

export const postReservation = (reservation: PostReservationDto) => {
  return ky
    .post("/api/reservations", {
      json: reservation,
    })
    .json<{ ok: boolean; code: string; message: string }>();
};

export const getMyReservations = () => {
  return ky.get("/api/my-reservations").json<Reservation[]>();
};

export const deleteReservation = (reservationId: string) => {
  return ky.delete(`/api/reservations/${reservationId}`).json<{ ok: boolean; code?: string; message?: string }>();
};
