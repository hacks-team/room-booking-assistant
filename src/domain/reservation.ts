import { Equipment, Reservation, Room } from "../types";

export function isCapacityAvailable(room: Room, attendees: number) {
  return room.capacity >= attendees;
}

export function isEquipmentAvailable(room: Room, equipments: Equipment[]) {
  return room.equipments.some((equipment) => equipments.includes(equipment));
}

export function isFloorAvailable(room: Room, floor: string) {
  return floor !== "all" && Number.isFinite(parseInt(floor)) ? room.floor === parseInt(floor) : true;
}

export function isTimeAvailable(startTime: string, endTime: string, reservations: Reservation[]) {
  return reservations.length
    ? reservations.every((reservation) => {
        const [startTimeHour, startTimeMinute] = startTime?.split(":") ?? [];
        const [endTimeHour, endTimeMinute] = endTime?.split(":") ?? [];

        const [startHour, startMinute] = reservation.start.split(":");
        const [endHour, endMinute] = reservation.end.split(":");

        const reservationStartTime = parseInt(startHour) + parseInt(startMinute) * 60;
        return (
          parseInt(startTimeHour) + parseInt(startTimeMinute) * 60 < reservationStartTime &&
          reservationStartTime < parseInt(endTimeHour) + parseInt(endTimeMinute) * 60
        );
      })
    : true;
}
