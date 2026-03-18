import { DateField } from "@/components/date-field";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { SuspenseQueries } from "@suspensive/react-query";
import { meetingRoomsQueryOptions, reservationsQueryOptions } from "../queries/queries";
import { format } from "date-fns";
import { SubCard } from "@/components/ui/sub-card";
import { RoomCard } from "./room-card";
import { useState } from "react";

export function ReservationStateList() {
  const [reservationStateDate, setReservationStateDate] = useState(format(new Date(), "yyyy-MM-dd")); // 오늘날짜라는 요구사항이 보였다면 안궁금했을듯?

  // 예약 현황은 어디갔지?

  // Room, reservation 변수들을 일정하게 만들어보자
  return (
    <>
      <DateField
        label="날짜 선택"
        value={new Date(reservationStateDate)}
        onSelect={(selectedDate) => setReservationStateDate(format(selectedDate ?? new Date(), "yyyy-MM-dd"))}
      />
      {/* // 터짐의 범위..를 생각해봐야한다.
      // 로딩로딩로딩 ->워터폴, 레이아웃 쉬프트 -> 
      // RoomCard 내부에서 인텊페이스로는 잘 안보인다. 데이터의 통로가 됨. 예측할 수 가 없다. 
      //  */}
      <ErrorBoundary fallback={({ error }) => <>{error.message}</>}>
        <Suspense fallback={<div>Loading...</div>}>
          <SuspenseQueries queries={[meetingRoomsQueryOptions(), reservationsQueryOptions(reservationStateDate)]}>
            {([{ data: rooms }, { data: reservations }]) => {
              return (
                rooms.map((room) => {
                  const roomReservations = reservations.filter((reservation) => reservation.roomId === room.id);
                  return (
                    <SubCard key={room.id}>
                      <RoomCard room={room} roomReservations={roomReservations} />
                    </SubCard>
                  );
                })
              );
            }}
          </SuspenseQueries>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
