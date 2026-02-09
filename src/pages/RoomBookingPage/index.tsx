import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingTab } from "@/src/pages/RoomBookingPage/components/booking-tab";
import { MyReservationsTab } from "@/src/pages/RoomBookingPage/components/my-reservations-tab";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";
import { Room } from "./types";
import { ReservationView } from "./components/reservation-view";

export function RoomBookingPage() {
    // 회의실 목록
    const { data: rooms } = useSuspenseQuery<Room[]>({
      queryKey: ["get/rooms"],
      queryFn: () => fetch("/api/rooms").then((res) => res.json()),
    });

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
            <ReservationView rooms={rooms}/>
            <BookingTab rooms={rooms} />
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
