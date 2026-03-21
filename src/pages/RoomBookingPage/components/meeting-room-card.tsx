import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Users } from "lucide-react";

interface MeetingRoomCardProps {
  name: string;
  floor: number;
  capacity: number;
  equipments: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const MeetingRoomCard = ({ name, floor, capacity, equipments, isSelected, onSelect }: MeetingRoomCardProps) => {
  return (
    <button
      className={cn(
        "relative rounded-lg border p-4 text-left transition-all",
        isSelected && "border-primary bg-primary/5 ring-primary ring-2",
      )}
      onClick={onSelect}
    >
      <h3 className="text-foreground font-semibold">{name}</h3>
      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
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
    </button>
  );
};

export { MeetingRoomCard };
