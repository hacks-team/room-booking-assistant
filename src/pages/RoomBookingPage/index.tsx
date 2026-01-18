import { BookingTab } from "@/src/pages/components/booking-tab";
import { MyReservationsTab } from "@/src/pages/components/my-reservations-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

export function RoomBookingPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-foreground mb-8 text-3xl font-bold">회의실 예약</h1>
        <Tabs defaultValue="booking">
          <TabsList className="mb-6">
            <TabsTrigger value="booking">예약하기</TabsTrigger>
            <TabsTrigger value="my-reservations">내 예약</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <BookingTab />
          </TabsContent>

          <TabsContent value="my-reservations">
            <MyReservationsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}
