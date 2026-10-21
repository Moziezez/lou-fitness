// Mirrors the check constraint on courses.format. Safe to import from Client
// Components.
export const COURSE_FORMATS = [
  { value: "online_course", label: "Online course" },
  { value: "live_coaching", label: "Live coaching" },
];

export function courseFormatLabel(value) {
  return COURSE_FORMATS.find((format) => format.value === value)?.label ?? value;
}
