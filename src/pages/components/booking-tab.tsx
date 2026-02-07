import { DateField } from "@/components/date-field";
import { InputField } from "@/components/input-field";
import { SelectField } from "@/components/select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SubCard, SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import type { CreateReservationPayload, CreateReservationResponse, Equipment, Reservation, Room } from "@/src/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Tv, Presentation, Video, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { RoomSelect } from "./room-select";
import { ReservationCard } from "../ui/reservation-card";

const bookingSchema = z
  .object({
    date: z.string(),
    startTime: z.string().min(1, "시작 시간을 선택해주세요"),
    endTime: z.string().min(1, "종료 시간을 선택해주세요"),
    attendees: z.coerce.number().min(1, "참석 인원은 1명 이상이어야 합니다"),
    equipments: z.array(z.string()),
    floor: z.string(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "종료 시간은 시작 시간보다 늦어야 합니다",
    path: ["endTime"],
  });

type BookingFormValues = z.infer<typeof bookingSchema>;

const timeOptions = Array.from({ length: 19 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = i % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  return { label: value, value };
});

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

  // 선호 층 옵션
  const floorOptions = [
    { label: "전체", value: "all" },
    ...[...new Set(rooms.map((r) => r.floor))]
      .sort((a, b) => a - b)
      .map((floor) => ({ label: `${floor}층`, value: String(floor) })),
  ];

  // 폼 상태 관리
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: dateParam,
      startTime: "",
      endTime: "",
      attendees: 1,
      equipments: [],
      floor: "all",
    },
    mode: "onChange",
  });

  const { startTime, endTime, attendees, equipments, floor } = watch();

  // 조건 1: 수용 인원
  const 인원충족 = (room: Room) => room.capacity >= attendees;

  // 조건 2: 장비 포함
  const 장비포함 = (room: Room) =>
    equipments.every((eq) => room.equipments.includes(eq as Equipment));

  // 조건 3: 층 조건 (선택)
  const 층일치 = (room: Room) =>
    floor === "all" || room.floor === Number(floor);

  // 조건 4: 시간 충돌 없음
  const 시간가용 = (room: Room) => {
    if (!startTime || !endTime) return true;
    const roomReservations = reservations.filter((r) => r.roomId === room.id);
    return roomReservations.every((r) => endTime <= r.start || startTime >= r.end);
  };

  const availableRooms = rooms.filter(
    (room) => 인원충족(room) && 장비포함(room) && 층일치(room) && 시간가용(room)
  );

  // 회의실 선택 상태
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 선택된 회의실이 필터 결과에서 빠지면 선택 해제
  useEffect(() => {
    if (selectedRoomId && !availableRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(null);
    }
  }, [availableRooms, selectedRoomId]);

  // 예약 생성
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: CreateReservationPayload) => {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CreateReservationResponse;
      if (!data.ok) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: async () => {
      toast({ title: "예약이 완료되었습니다" });
      await queryClient.invalidateQueries({ queryKey: ["get/reservations"] });
      setSelectedRoomId(null);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!selectedRoomId) {
      toast({ title: "회의실을 선택해주세요" });
      return;
    }
    if (!startTime || !endTime) {
      toast({ title: "시작 시간과 종료 시간을 선택해주세요" });
      return;
    }
    if (endTime <= startTime) {
      toast({ title: "종료 시간은 시작 시간보다 늦어야 합니다" });
      return;
    }
    mutation.mutate({
      roomId: selectedRoomId,
      date: dateParam,
      start: startTime,
      end: endTime,
      attendees,
      equipments: equipments as Equipment[],
    });
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
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DateField
                label="날짜"
                value={parseDate(field.value)}
                onSelect={(date) => {
                  if (date) {
                    field.onChange(formatDate(date));
                  }
                }}
              />
            )}
          />

          <InputField
            label="참석 인원"
            placeholder="1"
            type="number"
            min={1}
            {...register("attendees")}
          />
          {errors.attendees && (
            <p className="text-sm text-red-500">{errors.attendees.message}</p>
          )}

          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <SelectField
                label="시작 시간"
                options={timeOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime.message}</p>
          )}

          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <SelectField
                label="종료 시간"
                options={timeOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime.message}</p>
          )}

          <Controller
            name="floor"
            control={control}
            render={({ field }) => (
              <SelectField
                label="선호 층 (선택)"
                options={floorOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />

          <div className="space-y-2">
            <Label>필요 장비</Label>
            <Controller
              name="equipments"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  spacing={2}
                  size="sm"
                  value={field.value}
                  onValueChange={field.onChange}
                >
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
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          {availableRooms.length > 0 ? (
            availableRooms.map((room) => (
              <RoomSelect
                key={room.id}
                name={room.name}
                floor={room.floor}
                capacity={room.capacity}
                equipments={room.equipments}
                selected={selectedRoomId === room.id}
                onSelect={() => setSelectedRoomId(room.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">조건에 맞는 회의실이 없습니다.</p>
          )}
          <Button size="lg" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "예약 중..." : "예약하기"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
