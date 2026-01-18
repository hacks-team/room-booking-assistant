import { http, HttpResponse } from "msw";
import { delay, reservations, rooms } from "./data";

const isValidReservationRequest = (body: Partial<Reservation> & { start?: string; end?: string; attendees?: number }) =>
  body.roomId && body.date && body.start && body.end && body.attendees;

export const handlers = [
  http.get("/api/rooms", async () => {
    await delay();
    return HttpResponse.json(rooms);
  }),

  http.get("/api/reservations", async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    await delay();

    if (!date) {
      return HttpResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const filteredReservations = reservations.filter((reservation) => reservation.date === date);
    return HttpResponse.json(filteredReservations);
  }),

  http.post("/api/reservations", async ({ request }) => {
    await delay();

    try {
      const body = (await request.json()) as Partial<Reservation>;

      if (!isValidReservationRequest(body)) {
        return HttpResponse.json(
          { ok: false, code: "INVALID", message: "필수 항목이 누락되었습니다." },
          { status: 400 },
        );
      }

      const conflictingReservations = reservations.filter(
        (reservation) =>
          reservation.roomId === body.roomId &&
          reservation.date === body.date &&
          hasTimeConflict(reservation.start, reservation.end, body.start!, body.end!),
      );

      if (conflictingReservations.length > 0) {
        return HttpResponse.json(
          { ok: false, code: "CONFLICT", message: "해당 시간에 이미 예약이 있습니다." },
          { status: 409 },
        );
      }

      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        roomId: body.roomId!,
        date: body.date!,
        start: body.start!,
        end: body.end!,
        attendees: body.attendees!,
        equipments: body.equipments || [],
        userId: "user-1",
      };

      reservations.push(newReservation);

      return HttpResponse.json({ ok: true, reservation: newReservation });
    } catch {
      return HttpResponse.json({ ok: false, code: "INVALID", message: "잘못된 요청입니다." }, { status: 400 });
    }
  }),

  http.delete("/api/reservations/:id", async ({ params }) => {
    await delay();

    const id = params.id as string | undefined;

    if (!id) {
      return HttpResponse.json({ ok: false, code: "INVALID", message: "잘못된 요청입니다." }, { status: 400 });
    }

    const index = reservations.findIndex((reservation) => reservation.id === id);

    if (index === -1) {
      return HttpResponse.json({ ok: false, code: "NOT_FOUND", message: "예약을 찾을 수 없습니다." }, { status: 404 });
    }

    reservations.splice(index, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/my-reservations", async () => {
    await delay();
    const myReservations = reservations.filter((reservation) => reservation.userId === "user-1");
    return HttpResponse.json(myReservations);
  }),
];

function hasTimeConflict(existingStart: string, existingEnd: string, newStart: string, newEnd: string): boolean {
  const existingStartMin = timeToMinutes(existingStart);
  const existingEndMin = timeToMinutes(existingEnd);
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);

  return newStartMin < existingEndMin && newEndMin > existingStartMin;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

type Equipment = "tv" | "whiteboard" | "video" | "speaker";

type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipments: Equipment[];
};

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
