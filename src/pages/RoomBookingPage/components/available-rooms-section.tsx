import { Suspense, useState } from "react";
import { meetingRoomsQueryOptions, reservationsQueryOptions } from "../queries/queries";
import { SuspenseQueries } from "@suspensive/react-query";
import { RoomSelect } from "./room-select";
import { ReservationAction } from "./reservation-action";
import { useFormContext } from "react-hook-form";
import { BookingFormData } from "../hooks/useBookingForm";
import { filterAvailableRooms } from "../lib/filters";
import { ErrorBoundary } from "@suspensive/react";

export function AvailableRoomsSection() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const form = useFormContext<BookingFormData>();
  const formValues = form.watch();

  return (
    <>
      <ErrorBoundary fallback={({ error }) => <div>{error.message}</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <SuspenseQueries queries={[meetingRoomsQueryOptions(), reservationsQueryOptions(formValues.date)]}>
            {([{ data: rooms }, { data: reservations }]) => {
              const availableRooms = filterAvailableRooms(rooms, reservations, formValues);
              const selectedRoomIdInAvailableRooms =
                availableRooms.find((room) => room.id === selectedRoomId)?.id ?? null;

              return (
                <>
                  {availableRooms.map((room) => (
                    <RoomSelect
                      key={room.id}
                      name={room.name}
                      floor={room.floor}
                      capacity={room.capacity}
                      equipments={room.equipments}
                      onSelect={() => setSelectedRoomId(room.id)}
                      selected={selectedRoomId === room.id}
                    />
                  ))}
                  {/* 여기 안에서 벨리데이션 하고, 액션을 처리한다.  */}
                  <ReservationAction
                    selectedRoomId={selectedRoomIdInAvailableRooms}
                    formValues={formValues}
                  />
                </>
              );
            }}
          </SuspenseQueries>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

// 토스트도 react에 의존적이다 ? 어렵다.