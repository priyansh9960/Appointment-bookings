"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { PatientForm, type BookingFormValues } from "@/components/booking/PatientForm";
import { DOCTOR, formatDateKey, formatMonthKey } from "@/lib/appointments";

const initialForm: BookingFormValues = {
  fullName: "",
  mobileNumber: "",
  email: "",
  age: "",
  gender: "",
  reason: "",
};

const subscribeToDate = () => () => {};
const getTodayDateKey = () => formatDateKey(new Date());
const getServerDateKey = () => "";

export default function HomePage() {
  const router = useRouter();
  const todayDateKey = useSyncExternalStore(subscribeToDate, getTodayDateKey, getServerDateKey);
  const [monthDate, setMonthDate] = useState<Date | null>(null);
  const [selectedDateOverride, setSelectedDate] = useState<string | null>(null);
  const selectedDate = selectedDateOverride ?? todayDateKey;
  const visibleMonthDate = useMemo(
    () => monthDate ?? (todayDateKey ? new Date(`${todayDateKey.slice(0, 7)}-01T00:00:00`) : null),
    [monthDate, todayDateKey],
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<Array<{ label: string; value: string }>>([]);
  const [monthAvailability, setMonthAvailability] = useState<Record<string, number>>({});
  const [form, setForm] = useState<BookingFormValues>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visibleMonthDate) {
      return;
    }

    const monthKey = formatMonthKey(visibleMonthDate);
    fetch(`/api/appointments/availability?doctorId=${DOCTOR.id}&month=${monthKey}`)
      .then((response) => response.json())
      .then((data) => setMonthAvailability(data.availability ?? {}))
      .catch(() => setMonthAvailability({}));
  }, [visibleMonthDate]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    fetch(`/api/appointments/availability?doctorId=${DOCTOR.id}&date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => {
        const nextSlots: Array<{ label: string; value: string }> = data.slots ?? [];
        setSlots(nextSlots);
        setSelectedTime((current) => {
          if (!nextSlots.length) {
            return "";
          }

          return nextSlots.some((slot: { label: string; value: string }) => slot.value === current) ? current : nextSlots[0].value;
        });
      })
      .catch(() => setSlots([]));
  }, [selectedDate]);

  if (!visibleMonthDate || !selectedDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm">
          Loading appointment planner…
        </div>
      </main>
    );
  }

  const handleFieldChange = (field: keyof BookingFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleMonthChange = (direction: number) => {
    setMonthDate((current) => {
      const base = current ?? visibleMonthDate ?? new Date();
      return new Date(base.getFullYear(), base.getMonth() + direction, 1);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          doctorId: DOCTOR.id,
          appointmentDate: selectedDate,
          startTime: selectedTime,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to confirm your appointment.");
      }

      router.push(`/confirmation?bookingId=${payload.bookingReference}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to confirm your appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between lg:p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-sky-100 ring-2 ring-sky-200">
                <img src={DOCTOR.profileImage} alt={DOCTOR.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Doctor profile</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">{DOCTOR.name}</h1>
                <p className="text-sm text-slate-600">
                  {DOCTOR.specialization} • {DOCTOR.qualification} • {DOCTOR.experience}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p className="font-semibold">Clinic</p>
              <p>{DOCTOR.clinicName}</p>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Select a date</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Choose your appointment</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>

            <BookingCalendar
              monthDate={visibleMonthDate}
              selectedDate={selectedDate}
              onSelectDate={(dateKey) => {
                setSelectedDate(dateKey);
                setMonthDate(new Date(`${dateKey}T00:00:00`));
              }}
              availability={monthAvailability}
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Available times</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedDate}</h3>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                  {slots.length} slots
                </span>
              </div>

              {slots.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium transition ${
                        selectedTime === slot.value
                          ? "border-sky-600 bg-sky-600 text-white shadow-md"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  No slots available for this date. Please select another day.
                </div>
              )}
            </div>
          </section>

          <section>
            <PatientForm
              values={form}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              doctorName={DOCTOR.name}
            />
            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
