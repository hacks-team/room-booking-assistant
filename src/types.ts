export type Equipment = "tv" | "whiteboard" | "video" | "speaker";

export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipments: Equipment[];
}

export interface Reservation {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  attendees: number;
  equipments: Equipment[];
}
