import { Room } from "./booking-tab";

export function RoomList({ rooms, renderItem }: { rooms: Room[], renderItem: (room: Room) => React.ReactNode }) {
    return <>{rooms.map((room) => renderItem(room))}</>;
}