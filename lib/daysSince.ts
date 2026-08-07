const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const FIELD_NOTES_START_DATE = {
  year: 2003,
  monthIndex: 8,
  day: 15,
  isoDate: "2003-09-15",
  accessibleLabel: "15 September 2003",
  displayLabel: "15 · 09 · 2003",
} as const;

type CalendarDate = {
  year: number;
  monthIndex: number;
  day: number;
};

function toUtcTimestamp({ year, monthIndex, day }: CalendarDate) {
  return Date.UTC(year, monthIndex, day);
}

export function getDaysSinceFieldNotesStart(currentDate: Date) {
  const currentCalendarDate = {
    year: currentDate.getFullYear(),
    monthIndex: currentDate.getMonth(),
    day: currentDate.getDate(),
  };

  return Math.floor(
    (toUtcTimestamp(currentCalendarDate) -
      toUtcTimestamp(FIELD_NOTES_START_DATE)) /
      MILLISECONDS_PER_DAY,
  );
}
