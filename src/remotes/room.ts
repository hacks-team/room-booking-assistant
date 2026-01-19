import { queryOptions } from "@tanstack/react-query";
import ky from "ky";
import { Equipment, Reservation, Room } from "../types";

export const getRooms = async () => ky.get("/api/rooms").json<Room[]>();

export const getRoomsQuertOptions = () =>
  queryOptions({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

interface PostRoomReservationRequest {
  roomId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  attendees: number;
  equipment: Equipment[];
}

export const postRoomReservation = async (postRoomReservationRequest: PostRoomReservationRequest) =>
  ky
    .post("/api/reservations", {
      json: postRoomReservationRequest,
    })
    .json<{ ok: boolean; reservation: Reservation }>();
