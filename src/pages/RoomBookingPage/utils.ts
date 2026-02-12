export function generateFloorOptions(floors: number[]) {
  return [
    { label: "전체", value: "all" },
    ...[...new Set(floors)].sort((a, b) => a - b).map((floor) => ({ label: `${floor}층`, value: String(floor) })),
  ];
}

export function generateTimeOptions(startHour: number, endHour: number, interval = 30) {
  const desc = startHour > endHour;
  const [min, max] = desc ? [endHour, startHour] : [startHour, endHour];
  const options = [];
  for (let m = min * 60; m <= max * 60; m += interval) {
    const value = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    options.push({ label: value, value });
  }
  return desc ? options.reverse() : options;
}
