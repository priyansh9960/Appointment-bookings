"use client";

import type { FormEvent } from "react";

export type BookingFormValues = {
  fullName: string;
  mobileNumber: string;
  email: string;
  age: string;
  gender: string;
  reason: string;
};

type Props = {
  values: BookingFormValues;
  onChange: (field: keyof BookingFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  selectedDate: string;
  selectedTime: string;
  doctorName: string;
};

export function PatientForm({ values, onChange, onSubmit, isSubmitting, selectedDate, selectedTime, doctorName }: Props) {
  const summary = selectedDate && selectedTime ? `${selectedDate} • ${selectedTime}` : "Select a date and time";

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Appointment summary</p>
        <p className="mt-2 font-medium text-slate-900">{doctorName}</p>
        <p className="mt-1">{summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Full name</span>
          <input
            type="text"
            value={values.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Enter your full name"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Mobile number</span>
          <input
            type="tel"
            value={values.mobileNumber}
            onChange={(event) => onChange("mobileNumber", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="+91 98765 43210"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Email address</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Age</span>
          <input
            type="number"
            value={values.age}
            min={18}
            max={100}
            onChange={(event) => onChange("age", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="28"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Gender</span>
          <select
            value={values.gender}
            onChange={(event) => onChange("gender", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Reason for appointment</span>
          <textarea
            value={values.reason}
            onChange={(event) => onChange("reason", event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Optional details for the doctor"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedDate || !selectedTime}
        className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? "Confirming..." : "Confirm appointment"}
      </button>
    </form>
  );
}
