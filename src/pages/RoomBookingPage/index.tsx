import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyReservationsTab } from "@/src/pages/RoomBookingPage/components/my-reservations-tab";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { AvailableRooms } from "./components/available-rooms";
import { BookingCondition, BookingFormValues, bookingSchema } from "./components/booking-condition";
import { formatDate } from "./components/form/date-field";
import { ReservationView } from "./components/reservation-view";
import { roomQueries } from "./queries";

export function RoomBookingPage() {
  // 회의실 목록
  const { data: rooms } = useSuspenseQuery(roomQueries.list());

  const [searchParams, setSearchParams] = useSearchParams();

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

  const formValues = methods.watch();
  const equipmentsKey = formValues.equipments.join(",");

  // 폼 값 → URL 검색 파라미터 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("date", formValues.date);
    if (formValues.startTime) params.set("startTime", formValues.startTime);
    if (formValues.endTime) params.set("endTime", formValues.endTime);
    if (formValues.attendees > 1) params.set("attendees", String(formValues.attendees));
    if (equipmentsKey) params.set("equipments", equipmentsKey);
    if (formValues.floor !== "all") params.set("floor", formValues.floor);
    setSearchParams(params, { replace: true });
  }, [formValues.date, formValues.startTime, formValues.endTime, formValues.attendees, equipmentsKey, formValues.floor, setSearchParams]);


  return (
    <>
      <Title>회의실 예약</Title>
      <Tabs defaultValue="booking">
        <TabsList className="mb-6">
          <TabsTrigger value="booking">예약하기</TabsTrigger>
          <TabsTrigger value="my-reservations">내 예약</TabsTrigger>
        </TabsList>

        <TabsContent value="booking">
          <Suspense fallback={<div>로딩 중...</div>}>
            <div className="space-y-6">
              <ReservationView title="예약 현황" rooms={rooms} />
              <BookingCondition title="예약 조건" rooms={rooms} methods={methods} />
              <AvailableRooms title="예약 가능한 회의실" rooms={rooms} formValues={formValues} />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="my-reservations">
          <MyReservationsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Title({ children }: PropsWithChildren) {
  return <h1 className="text-foreground mb-8 text-3xl font-bold">{children}</h1>;
}
