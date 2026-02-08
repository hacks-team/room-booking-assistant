import { format } from "date-fns";

export const formatTOYYYYMMDD = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
