export type Equipment = "tv" | "whiteboard" | "video" | "speaker";

export type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipments: Equipment[];
};

export type Reservation = {
  id: string;
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipments: Equipment[];
  userId?: string;
};

export type CreateReservationPayload = {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipments: Equipment[];
};

export type CreateReservationResponse =
  | { ok: true; reservation: Reservation }
  | { ok: false; code: string; message: string };

export type DeleteReservationResponse =
  | { ok: true }
  | { ok: false; code: string; message: string };
