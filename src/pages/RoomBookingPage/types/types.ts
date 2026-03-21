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
  equipments: Equipment[] | undefined;
};

export type PostReservationDto = Omit<Reservation, "id">;
