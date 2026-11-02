export const DOCTOR = {
  id: "dr-sarah-chen",
  name: "Dr. Sarah Chen",
  specialization: "Cardiology",
  qualification: "MD, FACC",
  experience: "12 years",
  clinicName: "CityCare Clinic",
  profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
  phone: "+91 98765 43210",
  email: "care@citycareclinic.in",
};

export type SlotItem = {
  label: string;
  value: string;
  startMinutes: number;
  endMinutes: number;
};

export const SLOT_START_HOUR = 10;
export const SLOT_END_HOUR = 21;
export const SLOT_DURATION_MINUTES = 15;

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isPastDate(dateKey: string): boolean {
  const todayKey = formatDateKey(new Date());
  return dateKey < todayKey;
}

export function formatTimeFromMinutes(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const time = new Date();
  time.setHours(hour, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(time);
}

export function buildDailySlots(dateKey: string): SlotItem[] {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(year, month - 1, day);
  const startMinutes = SLOT_START_HOUR * 60;
  const endMinutes = SLOT_END_HOUR * 60;
  const slots: SlotItem[] = [];

  for (let minutes = startMinutes; minutes < endMinutes; minutes += SLOT_DURATION_MINUTES) {
    const end = minutes + SLOT_DURATION_MINUTES;
    if (end > endMinutes) {
      break;
    }

    const startHour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const startMinute = String(minutes % 60).padStart(2, "0");
    const startTime = `${startHour}:${startMinute}`;
    const formatted = formatTimeFromMinutes(minutes);
    void base;

    slots.push({
      label: formatted,
      value: startTime,
      startMinutes: minutes,
      endMinutes: end,
    });
  }

  return slots;
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isValidBookingDate(dateKey: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(dateKey)) {
    return false;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDisplayDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(dateKey: string, startTime: string): string {
  return `${formatDisplayDate(dateKey)} • ${formatTimeFromMinutes(timeToMinutes(startTime))}`;
}
