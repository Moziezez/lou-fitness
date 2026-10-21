// Mirrors the check constraint on courses.format. Safe to import from Client
// Components.
export const COURSE_FORMATS = [
  { value: "online_course", label: "Online course" },
  { value: "live_coaching", label: "Live coaching" },
  { value: "live_online", label: "Live + Online" },
];

// Formats listed on /live-coaching.
export const ONLINE_CLASS_FORMATS = new Set(["online_course", "live_online"]);

export function courseFormatLabel(value) {
  return COURSE_FORMATS.find((format) => format.value === value)?.label ?? value;
}
