import { BookingFormData } from "../hooks/useBookingForm";
import { Equipment, Reservation, Room } from "../types/types";
import { timeToMinutes } from "./lib";

const isCapacityMatch = (room: Room, formValues: BookingFormData) => {
  return room.capacity >= formValues.attendees;
};

const isEquipmentMatch = (room: Room, formValues: BookingFormData) => {
  return formValues.equipments?.every((equipment) => room.equipments.includes(equipment as Equipment));
};

const isFloorMatch = (room: Room, formValues: BookingFormData) => {
  return formValues.floor === "all" || room.floor === Number(formValues.floor);
};

const isReservationTimeMatch = (reservation: Reservation, formValues: BookingFormData) => {
  return (
    timeToMinutes(reservation.start ?? "") >= timeToMinutes(formValues.end) ||
    timeToMinutes(reservation.end ?? "") <= timeToMinutes(formValues.start)
  );
};

export const filterAvailableRooms = (
  rooms: Room[],
  reservations: Reservation[],
  formValues: BookingFormData,
): Room[] => {
  return rooms.filter((room) => {
    const reservationMatch = reservations.find((reservation) => reservation.roomId === room.id);
    if (reservationMatch) {
      const reservationTimeMatch = isReservationTimeMatch(reservationMatch, formValues);
      if (!reservationTimeMatch) {
        return false;
      }
    }

    return isFloorMatch(room, formValues) && isCapacityMatch(room, formValues) && isEquipmentMatch(room, formValues);
  });
};
