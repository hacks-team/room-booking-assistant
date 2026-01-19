import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { withTypeGuard } from "@/src/fn";
import { Equipment } from "@/src/types";
import { Presentation, Tv, Video, Volume2 } from "lucide-react";

function isEquipments(value: any): value is Equipment[] {
  return (
    typeof value === "object" &&
    Array.isArray(value) &&
    value.every((equipment: Equipment) => ["tv", "whiteboard", "video", "speaker"].includes(equipment))
  );
}

interface EquipmentToggleGroupProps {
  values?: Equipment[];
  onValueChange?: (values: Equipment[]) => void;
}

export function EquipmentToggleGroup({ values, onValueChange }: EquipmentToggleGroupProps) {
  return (
    <div className="space-y-2">
      <Label>필요 장비</Label>
      <ToggleGroup
        type="multiple"
        variant="outline"
        spacing={2}
        size="sm"
        value={values ?? []}
        onValueChange={withTypeGuard(isEquipments, (selectedEquipments) => onValueChange?.(selectedEquipments))}
      >
        <ToggleGroupItem value="tv">
          <Tv className="h-4 w-4" />
          TV
        </ToggleGroupItem>
        <ToggleGroupItem value="whiteboard">
          <Presentation className="h-4 w-4" />
          화이트보드
        </ToggleGroupItem>
        <ToggleGroupItem value="video">
          <Video className="h-4 w-4" />
          화상회의
        </ToggleGroupItem>
        <ToggleGroupItem value="speaker">
          <Volume2 className="h-4 w-4" />
          스피커
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
