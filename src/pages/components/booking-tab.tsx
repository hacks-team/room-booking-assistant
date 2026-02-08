import { Tv, Presentation, Video, Volume2, Building2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ky from "ky";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { parseAsIsoDate, useQueryState } from "nuqs";
import { Mutation, SuspenseQueries } from "@suspensive/react-query";
import { ErrorBoundary } from '@suspensive/react'
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputField } from "@/components/input-field";
import { SubCard, SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { SelectField } from "@/components/select-field";
import { DateField } from "@/components/date-field";
import { RoomSelect } from "./room-select";
import { format } from "date-fns";
import { QueryClient, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "@/hooks/use-toast";

const BUSINESS_HOURS = {
  START: "09:00",
  END: "20:00",
  START_MINUTES: 540,
  END_MINUTES: 1140,
};

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
  equipments: Equipment[] | undefined;
};

type PostReservationDto = Omit<Reservation, "id">;

const getMeetingRooms = () => {
  return ky.get("/api/rooms").json<Room[]>();
};

const getReservations = (date: string) => {
  return ky.get(`/api/reservations?date=${date}`).json<Reservation[]>();
};

const postReservation = (reservation: PostReservationDto) => {
  return ky
    .post("/api/reservations", {
      json: reservation,
    })
    .json<{ ok: boolean; code: string; message: string }>();
};

const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const generateTimeOptions = (
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30,
): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break;

      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push({
        label: timeString,
        value: timeString,
      });
    }
  }

  return options;
};

const generateFloorOptions = (): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];
  options.push({ label: "전체", value: "all" });
  for (let i = 1; i <= 10; i++) {
    options.push({ label: `${i}층`, value: i.toString() });
  }
  return options;
};

const bookingSchema = z
  .object({
    date: z.string().datetime(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.coerce
      .number({
        invalid_type_error: "숫자를 입력해주세요",
      })
      .min(1, "1명 이상이어야 합니다"),
    equipments: z.array(z.enum(["tv", "whiteboard", "video", "speaker"])).optional(),
    floor: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      return end > start;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
      path: ["endTime"],
    },
  );

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingTab() {
  const [reservationStateDate, setReservationStateDate] = useQueryState("date", parseAsIsoDate.withDefault(new Date()));
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const useMeetingRooms = () => {
    return queryOptions({
      queryKey: ["meeting-rooms"],
      queryFn: () => getMeetingRooms(),
    });
  };

  const useReservations = (date: string) => {
    return queryOptions({
      queryKey: ["reservations", date],
      queryFn: () => getReservations(date),
    });
  };

  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
      attendees: 1,
      equipments: [],
      floor: "all",
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>

        <CardContent>
          <DateField
            label="날짜 선택"
            value={reservationStateDate}
            onSelect={(selectedDate) => setReservationStateDate(selectedDate ?? new Date())}
          />
          <ErrorBoundary fallback={({ error }) => <>{error.message}</>}>
            <Suspense fallback={<div>Loading...</div>}>
              <SuspenseQueries queries={[useMeetingRooms(), useReservations(format(reservationStateDate, "yyyy-MM-dd"))]}>
                {([{ data: rooms }, { data: reservations }]) => {
                  return (
                    <>
                      {rooms.map((room) => {
                        const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);

                        return (
                          <SubCard key={room.id}>
                            <SubCardHeader>{room.name}</SubCardHeader>
                            <SubCardContent>
                              {roomReservations.length > 0 ? (
                                roomReservations.map((reservation) => (
                                  <Badge
                                    key={reservation.id}
                                    variant="outline"
                                  >{`${reservation.start} - ${reservation.end}`}</Badge>
                                ))
                              ) : (
                                <p className="text-muted-foreground text-sm">예약 없음</p>
                              )}
                            </SubCardContent>
                          </SubCard>
                        );
                      })}
                    </>
                  );
                }}
              </SuspenseQueries>
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="date"
            control={form.control}
            render={({ field }) => (
              <DateField
                label="날짜"
                value={new Date(field.value)}
                onSelect={(date) => field.onChange(format(date ?? new Date(), "yyyy-MM-dd"))}
              />
            )}
          />

          <Controller
            name="attendees"
            control={form.control}
            render={({ field }) => (
              <div>
                <InputField label="참석 인원" type="number" min={1} value={field.value} onChange={field.onChange} />
                {form.formState.errors.attendees && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.attendees.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="startTime"
            control={form.control}
            render={({ field }) => (
              <div>
                <SelectField
                  label="시작 시간"
                  placeholder="선택"
                  options={generateTimeOptions(9, 20, 30)}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                {form.formState.errors.startTime && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.startTime.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="endTime"
            control={form.control}
            render={({ field }) => (
              <div>
                <SelectField
                  label="종료 시간"
                  placeholder="선택"
                  options={generateTimeOptions(9, 20, 30)}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                {form.formState.errors.endTime && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="floor"
            control={form.control}
            render={({ field }) => (
              <SelectField
                label="선호 층"
                placeholder="선택"
                value={field.value}
                onValueChange={field.onChange}
                options={generateFloorOptions()}
              />
            )}
          />

          <Controller
            name="equipments"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>필요 장비</Label>
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
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 가능한 회의실</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SuspenseQueries queries={[useMeetingRooms(), useReservations(format(reservationStateDate, "yyyy-MM-dd"))]}>
              {([{ data: rooms }, { data: reservations }]) => {
                const availableRooms = rooms.filter((room) => {
                  const capacityMatch = room.capacity >= form.watch("attendees");
                  const equipmentMatch = form
                    .watch("equipments")
                    ?.every((equipment) => room.equipments.includes(equipment as Equipment));
                  const selectedFloor = form.watch("floor");
                  const floorMatch = selectedFloor === "all" || room.floor === Number(selectedFloor);

                  const reservationMatch = reservations.find((reservation) => reservation.roomId === room.id);

                  if (reservationMatch) {
                    const reservationTimeMatch =
                      timeToMinutes(reservationMatch?.start ?? "") >= timeToMinutes(form.watch("endTime")) ||
                      timeToMinutes(reservationMatch?.end ?? "") <= timeToMinutes(form.watch("startTime"));
                    if (!reservationTimeMatch) {
                      return false;
                    }
                  }

                  return floorMatch && capacityMatch && equipmentMatch;
                });

                return (
                  <>
                    {availableRooms.map((room) => (
                      <RoomSelect
                        key={room.id}
                        name={room.name}
                        floor={room.floor}
                        capacity={room.capacity}
                        equipments={room.equipments}
                        onSelect={() => setSelectedRoom(room as Room)}
                        selected={selectedRoom?.id === room.id}
                      />
                    ))}
                  </>
                );
              }}
            </SuspenseQueries>
          </Suspense>

          <Mutation
            mutationFn={(data: PostReservationDto) => postReservation(data)}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["reservations", format(reservationStateDate, "yyyy-MM-dd")],
              });

              queryClient.invalidateQueries({
                queryKey: ["meeting-rooms"],
              });

              toast({
                title: "예약 완료",
                description: "회의실이 성공적으로 예약되었습니다",
                duration: 3000,
              });

              form.reset();
              setSelectedRoom(null);
            }}
            onError={(error: Error) => {
              toast({
                variant: "destructive",
                title: "예약 실패",
                description: error.message || "예약 중 오류가 발생했습니다",
                duration: 5000,
              });
            }}
          >
            {(mutation) => (
              <Button
                size="lg"
                disabled={!selectedRoom || mutation.isPending}
                onClick={() => {
                  const startTime = form.watch("startTime");
                  const endTime = form.watch("endTime");

                  const validateTime = (): { valid: boolean; message?: string } => {
                    if (!startTime || !endTime) {
                      return {
                        valid: false,
                        message: "시작 시간과 종료 시간을 모두 선택해주세요",
                      };
                    }

                    const start = timeToMinutes(startTime);
                    const end = timeToMinutes(endTime);

                    if (start < BUSINESS_HOURS.START_MINUTES || start > BUSINESS_HOURS.END_MINUTES) {
                      return {
                        valid: false,
                        message: `시작 시간은 ${BUSINESS_HOURS.START} ~ ${BUSINESS_HOURS.END} 사이여야 합니다`,
                      };
                    }

                    if (end < BUSINESS_HOURS.START_MINUTES || end > BUSINESS_HOURS.END_MINUTES) {
                      return {
                        valid: false,
                        message: `종료 시간은 ${BUSINESS_HOURS.START} ~ ${BUSINESS_HOURS.END} 사이여야 합니다`,
                      };
                    }

                    if (end <= start) {
                      return {
                        valid: false,
                        message: "종료 시간은 시작 시간보다 늦어야 합니다",
                      };
                    }

                    const duration = end - start;
                    if (duration < 30) {
                      return {
                        valid: false,
                        message: "최소 30분 이상 예약해야 합니다",
                      };
                    }

                    return { valid: true };
                  };

                  const timeValidation = validateTime();
                  if (!timeValidation.valid) {
                    toast({
                      description: timeValidation.message,
                      duration: 1000,
                    });
                    return;
                  }

                  if (!selectedRoom) {
                    toast({
                      description: "예약할 회의실을 선택해주세요",
                      duration: 1000,
                    });
                    return;
                  }

                  mutation.mutate({
                    roomId: selectedRoom.id,
                    date: format(reservationStateDate, "yyyy-MM-dd"),
                    start: form.watch("startTime"),
                    end: form.watch("endTime"),
                    attendees: form.watch("attendees"),
                    equipments: form.watch("equipments"),
                  });
                }}
              >
                {mutation.isPending ? "예약 중..." : "예약하기"}
              </Button>
            )}
          </Mutation>
        </CardContent>
      </Card>
    </div>
  );
}
