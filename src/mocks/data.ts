export const rooms = [
  { id: "room-1", name: "회의실 A", floor: 1, capacity: 4, equipments: ["tv", "whiteboard"] },
  {
    id: "room-2",
    name: "회의실 B",
    floor: 1,
    capacity: 8,
    equipments: ["tv", "whiteboard", "video"],
  },
  {
    id: "room-3",
    name: "대회의실",
    floor: 2,
    capacity: 20,
    equipments: ["tv", "whiteboard", "video", "speaker"],
  },
  { id: "room-4", name: "소회의실", floor: 2, capacity: 3, equipments: ["whiteboard"] },
  { id: "room-5", name: "미팅룸 C", floor: 3, capacity: 6, equipments: ["tv", "video"] },
  {
    id: "room-6",
    name: "세미나실",
    floor: 3,
    capacity: 15,
    equipments: ["tv", "whiteboard", "video", "speaker"],
  },
];

export const reservations: Reservation[] = [
  {
    id: "res-1",
    roomId: "room-1",
    date: new Date().toISOString().split("T")[0],
    start: "09:00",
    end: "10:00",
    attendees: 3,
    equipments: ["tv"],
    userId: "user-1",
  },
  {
    id: "res-2",
    roomId: "room-2",
    date: new Date().toISOString().split("T")[0],
    start: "14:00",
    end: "16:00",
    attendees: 6,
    equipments: ["tv", "whiteboard"],
    userId: "user-1",
  },
  {
    id: "res-3",
    roomId: "room-3",
    date: new Date().toISOString().split("T")[0],
    start: "10:00",
    end: "12:00",
    attendees: 15,
    equipments: ["tv", "video"],
    userId: "user-2",
  },
];

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

type Reservation = {
  id: string;
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipments: Equipment[];
  userId?: string;
};

type Equipment = "tv" | "whiteboard" | "video" | "speaker";

type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipments: Equipment[];
};
