import { format } from "date-fns";
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const useBookingSearchParams = () => {
  const [filters, updateFilters] = useQueryStates({
    date: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
    startTime: parseAsString,
    endTime: parseAsString,
    attendees: parseAsInteger.withDefault(1),
    equipments: parseAsArrayOf(parseAsStringEnum(["tv", "whiteboard", "video", "speaker"] as const)),
    floor: parseAsString.withDefault("all"),
  });

  return { filters, updateFilters };
};

export { useBookingSearchParams };
