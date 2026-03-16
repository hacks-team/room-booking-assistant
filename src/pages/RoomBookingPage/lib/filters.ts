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

const hasNoTimeConflict = (reservation: Reservation, formValues: BookingFormData) => {
  const reservationStart = timeToMinutes(reservation.start ?? "");
  const reservationEnd = timeToMinutes(reservation.end ?? "");
  const formStart = timeToMinutes(formValues.start);
  const formEnd = timeToMinutes(formValues.end);

  return reservationStart >= formEnd || reservationEnd <= formStart;
};

const hasNoConflictingReservations = (room: Room, reservations: Reservation[], formValues: BookingFormData) => {
  const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);
  
  return roomReservations.every((reservation) => hasNoTimeConflict(reservation, formValues));
};

export const filterAvailableRooms = (
  rooms: Room[],
  reservations: Reservation[],
  formValues: BookingFormData,
): Room[] => {
  return rooms.filter((room) => {
    const hasNoConflicts = hasNoConflictingReservations(room, reservations, formValues);
    const matchesFilters = isFloorMatch(room, formValues) && isCapacityMatch(room, formValues) && isEquipmentMatch(room, formValues);

    return hasNoConflicts && matchesFilters;
  });
};
