import type { Room, Reservation, Equipment, AlternativeSlot } from "./types";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function hasTimeConflict(existingStart: string, existingEnd: string, newStart: string, newEnd: string): boolean {
  const existingStartMin = timeToMinutes(existingStart);
  const existingEndMin = timeToMinutes(existingEnd);
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);

  return newStartMin < existingEndMin && newEndMin > existingStartMin;
}

export function isRoomAvailable(
  room: Room,
  reservations: Reservation[],
  date: string,
  startTime: string,
  endTime: string,
  attendees: number,
  requiredEquipment: Equipment[],
  preferredFloor: number | null,
): boolean {
  // Check capacity
  if (room.capacity < attendees) return false;

  // Check equipment
  if (!requiredEquipment.every((eq) => room.equipment.includes(eq))) return false;

  // Check floor preference
  if (preferredFloor !== null && room.floor !== preferredFloor) return false;

  // Check time conflicts
  const roomReservations = reservations.filter((r) => r.roomId === room.id && r.date === date);
  const hasConflict = roomReservations.some((r) => hasTimeConflict(r.start, r.end, startTime, endTime));

  return !hasConflict;
}

export function findAlternativeTimeSlots(
  roomId: string,
  reservations: Reservation[],
  date: string,
  durationMinutes: number,
  maxSlots = 3,
): AlternativeSlot[] {
  const START_OF_DAY = 9 * 60; // 09:00
  const END_OF_DAY = 20 * 60; // 20:00

  const roomReservations = reservations
    .filter((r) => r.roomId === roomId && r.date === date)
    .map((r) => ({
      start: timeToMinutes(r.start),
      end: timeToMinutes(r.end),
    }))
    .sort((a, b) => a.start - b.start);

  const slots: AlternativeSlot[] = [];
  let currentTime = START_OF_DAY;

  // Find gaps between reservations
  for (const reservation of roomReservations) {
    if (currentTime + durationMinutes <= reservation.start) {
      slots.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + durationMinutes),
      });
      if (slots.length >= maxSlots) break;
    }
    currentTime = Math.max(currentTime, reservation.end);
  }

  // Check remaining time after last reservation
  if (slots.length < maxSlots && currentTime + durationMinutes <= END_OF_DAY) {
    slots.push({
      start: minutesToTime(currentTime),
      end: minutesToTime(currentTime + durationMinutes),
    });
  }

  return slots.slice(0, maxSlots);
}

export function findAlternativeRooms(
  rooms: Room[],
  reservations: Reservation[],
  excludeRoomId: string,
  date: string,
  startTime: string,
  endTime: string,
  attendees: number,
  requiredEquipment: Equipment[],
  preferredFloor: number | null,
  maxRooms = 3,
): Room[] {
  return rooms
    .filter((room) => room.id !== excludeRoomId)
    .filter((room) =>
      isRoomAvailable(room, reservations, date, startTime, endTime, attendees, requiredEquipment, preferredFloor),
    )
    .slice(0, maxRooms);
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  tv: "TV",
  whiteboard: "화이트보드",
  video: "화상회의",
  speaker: "스피커",
};

export const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}).filter((time) => {
  const minutes = timeToMinutes(time);
  return minutes >= 9 * 60 && minutes <= 20 * 60;
});
