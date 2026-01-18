import { ReservationCard } from "./reservation-card";

export function MyReservationsTab() {
  return (
    <div className="space-y-4">
      {/* 
      // 예약 내역이 없을 때 표시할 컴포넌트
      <div className="text-muted-foreground py-20 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>예약 내역이 없습니다.</p>
        <p className="mt-2 text-xs">예약 조회/취소 로직을 구현해보세요.</p>
      </div>
      */}
      <ReservationCard
        name="회의실 1"
        date="2026-01-18"
        startTime="10:00"
        endTime="11:00"
        capacity={4}
        equipments={["tv"]}
        onCancel={() => {}}
      />
      <ReservationCard
        name="회의실 2"
        date="2026-01-18"
        startTime="10:00"
        endTime="11:00"
        capacity={4}
        equipments={["tv", "whiteboard"]}
        onCancel={() => {}}
      />
    </div>
  );
}
