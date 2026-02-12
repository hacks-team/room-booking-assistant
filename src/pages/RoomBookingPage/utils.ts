export function generateTimeOptions(startHour: number, endHour: number, interval = 30) {
  const options = [];
  for (let m = startHour * 60; m <= endHour * 60; m += interval) {
    const value = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    options.push({ label: value, value });
  }
  return options;
}
