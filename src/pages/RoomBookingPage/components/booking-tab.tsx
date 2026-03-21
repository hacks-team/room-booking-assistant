import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationStateList } from "./resevation-state-list";
import { AvailableRoomsSection } from "./available-rooms-section";
import { FormProvider } from "react-hook-form";
import { useBookingForm } from "../hooks/useBookingForm";
import { ReservationForm } from "./reservation-form";

export function BookingTab() {
  const bookingForm = useBookingForm();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>예약 현황</CardTitle>
        </CardHeader>

        <CardContent>
          <ReservationStateList />
        </CardContent>
      </Card>

      <FormProvider {...bookingForm}>
        <Card>
          <CardHeader>
            <CardTitle>예약 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>예약 가능한 회의실</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailableRoomsSection />
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}
