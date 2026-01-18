import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Trash2, Users } from "lucide-react";

interface ReservationCardProps {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  equipments: string[];
  onCancel?: () => void;
}

export const ReservationCard = ({
  name,
  date,
  startTime,
  endTime,
  capacity,
  equipments,
  onCancel,
}: ReservationCardProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold">{name}</h3>
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
            <div className="flex flex-wrap gap-1">
              {equipments.map((equipment) => (
                <Badge key={equipment} variant="secondary" className="text-xs">
                  {equipment}
                </Badge>
              ))}
            </div>
          </div>

          <Button variant="destructive" size="sm" onClick={onCancel} disabled={false}>
            <Trash2 className="mr-1 h-4 w-4" />
            취소
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
