import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Trash2, Users } from "lucide-react";
import { PropsWithChildren } from "react";

const ReservationCardRoot = ({ children }: PropsWithChildren) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">{children}</div>
      </CardContent>
    </Card>
  );
};

const ReservationCardHeader = ({ children }: PropsWithChildren) => {
  return <div className="space-y-2">{children}</div>;
};

const ReservationCardTitle = ({ children }: PropsWithChildren) => {
  return <h3 className="text-foreground text-lg font-semibold">{children}</h3>;
};

interface ReservationCardInfoProps {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

const ReservationCardInfo = ({ date, startTime, endTime, capacity }: ReservationCardInfoProps) => {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
      <span className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {date}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {startTime} - {endTime}
      </span>
      <span className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        {capacity}명
      </span>
    </div>
  );
};

interface ReservationCardEquipmentsProps {
  equipments: string[];
}

const ReservationCardEquipments = ({ equipments }: ReservationCardEquipmentsProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {equipments.map((equipment) => (
        <Badge key={equipment} variant="secondary" className="text-xs">
          {equipment}
        </Badge>
      ))}
    </div>
  );
};

interface ReservationCardCancelButtonProps {
  onCancel?: () => void;
  disabled?: boolean;
}

const ReservationCardCancelButton = ({ onCancel, disabled = false }: ReservationCardCancelButtonProps) => {
  return (
    <Button variant="destructive" size="sm" onClick={onCancel} disabled={disabled}>
      <Trash2 className="mr-1 h-4 w-4" />
      취소
    </Button>
  );
};

export const ReservationCard = Object.assign(ReservationCardRoot, {
  Header: ReservationCardHeader,
  Title: ReservationCardTitle,
  Info: ReservationCardInfo,
  Equipments: ReservationCardEquipments,
  CancelButton: ReservationCardCancelButton,
});
