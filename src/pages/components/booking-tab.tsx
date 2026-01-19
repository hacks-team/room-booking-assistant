import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuspenseQueries, SuspenseQuery } from "@suspensive/react-query";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/input-field";
import { SelectField } from "@/components/select-field";
import { DateField } from "@/components/date-field";
import { RoomSelect } from "./room-select";
import { getRoomsQuertOptions, postRoomReservation } from "@/src/remotes/room";
import { getReservationsQuertOptions } from "@/src/remotes/reservation";
import { format } from "date-fns";
import { useBookingSearchParams } from "../RoomBookingPage/hooks/use-booking-search-params";
import { useState, useTransition } from "react";
import { TIME_SELECT_OPTIONS } from "@/src/constant";
import { groupBy } from "es-toolkit";
import { Room } from "@/src/types";
import { isCapacityAvailable, isEquipmentAvailable, isFloorAvailable, isTimeAvailable } from "@/src/domain/reservation";
import { RoomReservationList } from "./room-reservation-list";
import { EquipmentToggleGroup } from "./equipment-toggle-group";

export function BookingTab() {
  const { filters, updateFilters } = useBookingSearchParams();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField
            value={new Date(filters.date)}
            onSelect={(date) => updateFilters({ date: format(date ?? new Date(), "yyyy-MM-dd") })}
            label="날짜 선택"
          />
          <RoomReservationList date={filters.date} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 여긴 그냥 폼으로 하는게 나을듯 */}
          <DateField
            label="날짜"
            value={new Date(filters.date)}
            onSelect={(date) => updateFilters({ date: format(date ?? new Date(), "yyyy-MM-dd") })}
          />
          <InputField
            label="참석 인원"
            placeholder="1"
            type="number"
            min={1}
            value={filters.attendees}
            onValueChange={(value) => updateFilters({ attendees: parseInt(value) })}
          />
          <SelectField
            label="시작 시간"
            options={TIME_SELECT_OPTIONS}
            value={filters.startTime ?? undefined}
            onValueChange={(value) => updateFilters({ startTime: value })}
          />
          <SelectField
            label="종료 시간"
            options={TIME_SELECT_OPTIONS}
            value={filters.endTime ?? undefined}
            onValueChange={(value) => updateFilters({ endTime: value })}
          />
          <SuspenseQuery {...getRoomsQuertOptions()}>
            {({ data: rooms }) => (
              <SelectField
                label="선호 층 (선택)"
                options={[
                  { label: "전체", value: "all" },
                  ...Object.keys(groupBy(rooms, (room) => room.floor)).map((floor) => ({
                    label: `${floor}층`,
                    value: floor,
                  })),
                ]}
                value={filters.floor ?? undefined}
                onValueChange={(value) => updateFilters({ floor: value })}
              />
            )}
          </SuspenseQuery>
          <EquipmentToggleGroup
            values={filters.equipments ?? []}
            onValueChange={(values) => updateFilters({ equipments: values })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          <SuspenseQueries queries={[getRoomsQuertOptions(), getReservationsQuertOptions(filters.date)]}>
            {([{ data: rooms }, { data: reservations }]) => {
              const reservationMap = new Map(
                Object.entries(groupBy(reservations, (reservation) => reservation.roomId)),
              );
              const availableRooms = rooms
                .filter((room) => isCapacityAvailable(room, filters.attendees))
                .filter((room) => isEquipmentAvailable(room, filters.equipments ?? []))
                .filter((room) => isFloorAvailable(room, filters.floor ?? "all"))
                .filter((room) =>
                  isTimeAvailable(filters.startTime ?? "", filters.endTime ?? "", reservationMap.get(room.id) ?? []),
                );

              return (
                <>
                  {availableRooms.map((room) => {
                    return (
                      <RoomSelect
                        selected={selectedRoom?.id === room.id}
                        name={room.name}
                        floor={room.floor}
                        capacity={room.capacity}
                        equipments={room.equipments}
                        onSelect={() => setSelectedRoom(room)}
                      />
                    );
                  })}
                </>
              );
            }}
          </SuspenseQueries>
          <Button
            size="lg"
            disabled={isPending}
            onClick={() => {
              if (!selectedRoom) return;
              startTransition(() => {
                if (selectedRoom) {
                  postRoomReservation({
                    roomId: selectedRoom.id,
                    date: filters.date,
                    start: filters.startTime ?? "",
                    end: filters.endTime ?? "",
                    attendees: filters.attendees,
                    equipment: filters.equipments ?? [],
                  });
                }
              });
            }}
          >
            예약하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
