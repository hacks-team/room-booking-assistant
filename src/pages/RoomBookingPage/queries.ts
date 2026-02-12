import type {
  CreateReservationPayload,
  CreateReservationResponse,
  DeleteReservationResponse,
  Reservation,
  Room,
} from "./types";

export const roomQueries = {
  list: () => ({
    queryKey: ["rooms"] as const,
    queryFn: () => fetch("/api/rooms").then((res) => res.json()) as Promise<Room[]>,
  }),
};

export const reservationQueries = {
  byDate: (date: string) => ({
    queryKey: ["reservations", date] as const,
    queryFn: () =>
      fetch(`/api/reservations?date=${date}`).then((res) => res.json()) as Promise<Reservation[]>,
  }),
  my: () => ({
    queryKey: ["reservations", "my"] as const,
    queryFn: () =>
      fetch("/api/my-reservations").then((res) => res.json()) as Promise<Reservation[]>,
  }),
};

export const reservationMutations = {
  create: () => ({
    mutationFn: async (payload: CreateReservationPayload) => {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: CreateReservationResponse = await (res.json() as Promise<CreateReservationResponse>);
      if (!data.ok) throw new Error(data.message);
      return data;
    },
  }),
  cancel: () => ({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      const data: DeleteReservationResponse = await (res.json() as Promise<DeleteReservationResponse>);
      if (!data.ok) throw new Error(data.message);
      return data;
    },
  }),
};
