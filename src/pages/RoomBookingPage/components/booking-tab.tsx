import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { CreateReservationPayload, CreateReservationResponse, Equipment, Reservation, Room } from "@/src/pages/RoomBookingPage/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { BookingForm } from "./form";
import { MeetingRoom } from "../ui/meeting-room-card";
import { formatDate } from "./form/date-field";
import { generateTimeOptions } from "../utils";

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


type Props = {
  rooms: Room[]
}

export function BookingTab({ rooms }: Props) {


  const [searchParams, setSearchParams] = useSearchParams();

  // 폼 상태 관리 (URL 검색 파라미터와 동기화)
  const methods = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: searchParams.get("date") ?? formatDate(new Date()),
      startTime: searchParams.get("startTime") ?? "",
      endTime: searchParams.get("endTime") ?? "",
      attendees: Number(searchParams.get("attendees")) || 1,
      equipments: searchParams.get("equipments")?.split(",").filter(Boolean) ?? [],
      floor: searchParams.get("floor") ?? "all",
    },
    mode: "onChange",
  });

  const { date, startTime, endTime, attendees, equipments, floor } = methods.watch();
  const equipmentsKey = equipments.join(",");

  // 폼 값 → URL 검색 파라미터 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("date", date);
    if (startTime) params.set("startTime", startTime);
    if (endTime) params.set("endTime", endTime);
    if (attendees > 1) params.set("attendees", String(attendees));
    if (equipmentsKey) params.set("equipments", equipmentsKey);
    if (floor !== "all") params.set("floor", floor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipmentsKey, floor, setSearchParams]);

  // 예약 현황
  const { data: reservations } = useSuspenseQuery<Reservation[]>({
    queryKey: ["get/reservations", date],
    queryFn: () => fetch(`/api/reservations?date=${date}`).then((res) => res.json()),
  });

  // 선호 층 옵션
  const floorOptions = [
    { label: "전체", value: "all" },
    ...[...new Set(rooms.map((r) => r.floor))]
      .sort((a, b) => a - b)
      .map((floor) => ({ label: `${floor}층`, value: String(floor) })),
  ];

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
      const data: CreateReservationResponse = await (res.json() as Promise<CreateReservationResponse>);
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
      date,
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
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm methods={methods}>
            <BookingForm.DateField name="date" label="날짜" />
            <BookingForm.InputField name="attendees" label="참석 인원" placeholder="1" type="number" min={1} />
            <BookingForm.SelectField name="startTime" label="시작 시간" options={generateTimeOptions(9, 20)} />
            <BookingForm.SelectField name="endTime" label="종료 시간" options={generateTimeOptions(20, 9)} />
            <BookingForm.SelectField name="floor" label="선호 층 (선택)" options={floorOptions} />
            <BookingForm.EquipmentField name="equipments" label="필요 장비" />
          </BookingForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          {availableRooms.length > 0 ? (
            <MeetingRoom
              items={availableRooms}
              renderItem={(room) => (
                <MeetingRoom.Card
                  key={room.id}
                  selected={selectedRoomId === room.id}
                  onSelect={() => setSelectedRoomId(room.id)}
                >
                  <MeetingRoom.Card.Name>{room.name}</MeetingRoom.Card.Name>
                  <MeetingRoom.Card.Row>
                    <MeetingRoom.Card.Info icon={Building2}>{room.floor}층</MeetingRoom.Card.Info>
                    <MeetingRoom.Card.Info icon={Users}>{room.capacity}명</MeetingRoom.Card.Info>
                  </MeetingRoom.Card.Row>
                  <MeetingRoom.Card.Row>
                    <MeetingRoom.Card.Badges items={room.equipments} variant="outline" />
                  </MeetingRoom.Card.Row>
                </MeetingRoom.Card>
              )}
            />
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
