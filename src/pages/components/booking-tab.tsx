import { DateField } from "@/components/date-field";
import { InputField } from "@/components/input-field";
import { SelectField } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SubCard, SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Reservation, Room } from "@/src/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Tv, Presentation, Video, Volume2, Building2, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { RoomSelect } from "./room-select";
import { ReservationCard } from "../ui/reservation-card";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function BookingTab() {
  // 회의실 목록
  const { data: rooms } = useSuspenseQuery<Room[]>({
    queryKey: ["get/rooms"],
    queryFn: () => fetch("/api/rooms").then((res) => res.json()),
  });

  // 예약 현황
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date") ?? formatDate(new Date());
  const selectedDate = parseDate(dateParam);
  const { data: reservations } = useSuspenseQuery<Reservation[]>({
    queryKey: ["get/reservations", dateParam],
    queryFn: () => fetch(`/api/reservations?date=${dateParam}`).then((res) => res.json()),
  });
  const handleDateChange = (date?: Date) => {
    if (date) {
      setSearchParams({ date: formatDate(date) });
    }
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField label="날짜 선택" value={selectedDate} onSelect={handleDateChange} />

          {[...new Set(reservations.map((r) => r.roomId))].map((roomId) => {
            const room = rooms.find((r) => r.id === roomId);
            const roomReservations = reservations.filter((r) => r.roomId === roomId);
            return (
              <SubCard key={roomId}>
                <SubCardHeader>{room?.name ?? roomId}</SubCardHeader>
                <SubCardContent>
                  {roomReservations.map((r) => (
                    <Badge key={r.id} variant="outline">
                      {r.start} - {r.end}
                    </Badge>
                  ))}
                </SubCardContent>
              </SubCard>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <DateField label="날짜" />
          <InputField label="참석 인원" placeholder="1" type="number" min={1} />
          <SelectField label="시작 시간" options={[]} />
          <SelectField label="종료 시간" options={[]} />
          <SelectField
            label="선호 층 (선택)"
            options={[
              { label: "전체", value: "all" },
              { label: "회의실 A", value: "room-1" },
              { label: "회의실 B", value: "room-2" },
              { label: "대회의실", value: "room-3" },
              { label: "소회의실", value: "room-4" },
            ]}
          />

          <div className="space-y-2">
            <Label>필요 장비</Label>
            <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">
              <ToggleGroupItem value="tv">
                <Tv className="h-4 w-4" />
                TV
              </ToggleGroupItem>
              <ToggleGroupItem value="whiteboard">
                <Presentation className="h-4 w-4" />
                화이트보드
              </ToggleGroupItem>
              <ToggleGroupItem value="video">
                <Video className="h-4 w-4" />
                화상회의
              </ToggleGroupItem>
              <ToggleGroupItem value="speaker">
                <Volume2 className="h-4 w-4" />
                스피커
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomSelect selected name="회의실 1" floor={1} capacity={4} equipments={["tv", "whiteboard"]} />
          <RoomSelect name="회의실 2" floor={1} capacity={4} equipments={["tv", "whiteboard"]} />
          <Button size="lg">예약하기</Button>
        </CardContent>
      </Card>
    </div>
  );
}
