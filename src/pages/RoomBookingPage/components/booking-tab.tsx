import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAsString, useQueryStates } from "nuqs";
import { ReservationStateList } from "./resevation-state-list";
import { AvailableRoomsSection } from "./available-rooms-section";
import { FormProvider } from "react-hook-form";
import { useBookingForm } from "../hooks/useBookingForm";
import { ReservationFilter } from "./reservation-filter";

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
            <ReservationFilter />
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
