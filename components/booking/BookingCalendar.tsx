"use client";

import { addDays, formatDateKey, getEndOfMonth, getStartOfMonth, isPastDate } from "@/lib/appointments";

type Props = {
  monthDate: Date;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  availability: Record<string, number>;
};

export function BookingCalendar({ monthDate, selectedDate, onSelectDate, availability }: Props) {
  const monthStart = getStartOfMonth(monthDate);
  const monthEnd = getEndOfMonth(monthDate);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;

  const cells: Array<Date | null> = [];
  for (let index = 0; index < totalCells; index += 1) {
    const date = addDays(monthStart, index - startOffset);
    cells.push(date);
  }

  const todayKey = formatDateKey(new Date());

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Calendar</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onSelectDate(todayKey)}
          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
        >
          Today
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-14 rounded-2xl bg-slate-50" />;
          }

          const dateKey = formatDateKey(date);
          const isSelected = dateKey === selectedDate;
          const isDisabled = isPastDate(dateKey) || date.getMonth() !== monthDate.getMonth();
          const slotCount = availability[dateKey] ?? 0;
          const hasAvailability = slotCount > 0;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateKey)}
              className={`relative flex h-14 flex-col items-center justify-center rounded-2xl border text-sm font-medium transition ${
                isSelected
                  ? "border-sky-600 bg-sky-600 text-white shadow-md"
                  : isDisabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
              }`}
            >
              <span>{date.getDate()}</span>
              {!isDisabled && (
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${hasAvailability ? "bg-emerald-400" : "bg-slate-300"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
