import { TimeUnit } from "@/models/general.model";

interface DetailedTimeInterval {
  value: number;
  unit: TimeUnit;
}

export const normalizedUnitToMinutes = ({ value, unit }: DetailedTimeInterval): number => {
  let unformattedNewValue: number;
  switch(unit) {
    case "minutes": return value;
    case "hours": unformattedNewValue = value * 60; break;
    case "days": unformattedNewValue = value * 24 * 60; break;
    case "weeks": unformattedNewValue = value * 7 * 24 * 60; break;
    case "months": unformattedNewValue = value * 30 * 24 * 60; break;
  }

  return Math.floor(unformattedNewValue);
}

export const minutesToNormalizedUnit = (
  timeMinutes: number, 
  integerValue = true
): DetailedTimeInterval => {

  const transformValue = (value: number) => {
    if (integerValue) return Math.floor(value);
    return value;
  }

  if (timeMinutes < 60) return { value: transformValue(timeMinutes), unit: "minutes" };

  const timeHours = timeMinutes / 60;
  if (timeHours < 24) return { value: transformValue(timeHours), unit: "hours" };

  const timeDays = timeHours / 24;
  return { value: transformValue(timeDays), unit: "days" };
}