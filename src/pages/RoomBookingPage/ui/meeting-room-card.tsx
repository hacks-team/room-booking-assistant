import { Badge, type badgeVariants } from "@/components/ui/badge";
import { SubCardContent, SubCardHeader } from "@/components/ui/sub-card";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

function MeetingRoomList<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
}) {
  return <>{items.map(renderItem)}</>;
}

interface MeetingRoomCardRootProps extends ComponentProps<"div"> {
  selected?: boolean;
  onSelect?: () => void;
}

function MeetingRoomCardRoot({
  children,
  className,
  selected,
  onSelect,
  ...props
}: MeetingRoomCardRootProps) {
  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect();
            }
          }
          : undefined
      }
      className={cn(
        "bg-card rounded-lg border p-4 space-y-2",
        onSelect && "cursor-pointer hover:border-primary/50 hover:bg-accent/50",
        selected && "border-primary bg-primary/5 ring-2 ring-primary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function MeetingRoomCardName({ children }: { children: ReactNode }) {
  return <SubCardHeader>{children}</SubCardHeader>;
}

function MeetingRoomCardRow({ children }: { children: ReactNode }) {
  return <SubCardContent>{children}</SubCardContent>;
}

function MeetingRoomCardInfo({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1">
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

function MeetingRoomCardBadges({
  items,
  variant,
}: {
  items: string[];
  variant?: VariantProps<typeof badgeVariants>["variant"];
}) {
  return (
    <>
      {items.map((item) => (
        <Badge key={item} variant={variant} className="text-xs">
          {item}
        </Badge>
      ))}
    </>
  );
}

const MeetingRoomCard = Object.assign(MeetingRoomCardRoot, {
  Name: MeetingRoomCardName,
  Row: MeetingRoomCardRow,
  Info: MeetingRoomCardInfo,
  Badges: MeetingRoomCardBadges,
});

interface MeetingRoomComponent {
  <T>(props: { items: T[]; renderItem: (item: T) => ReactNode }): ReactNode;
  Card: typeof MeetingRoomCard;
}

const MeetingRoom: MeetingRoomComponent = Object.assign(MeetingRoomList, {
  Card: MeetingRoomCard,
});

export { MeetingRoom };
