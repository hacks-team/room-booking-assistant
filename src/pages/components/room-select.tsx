import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, Users } from "lucide-react";

interface RoomSelectProps {
  selected?: boolean;
  onSelect?: () => void;
  name: string;
  floor: number;
  capacity: number;
  equipments: string[];
}

const RoomSelect = ({ selected, onSelect, name, floor, capacity, equipments }: RoomSelectProps) => {
  return (
    <Card
      className={cn(
        "gap-2 items-start",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-accent/50",
      )}
      onClick={onSelect}
    >
      <CardTitle className="px-6">{name}</CardTitle>
      <CardContent className="gap-y-0">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {floor}층
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {capacity}명
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {equipments.map((equipment) => (
            <Badge key={equipment} variant="outline" className="text-xs">
              {equipment}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { RoomSelect };
