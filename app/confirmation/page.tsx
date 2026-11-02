"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type BookingResponse = {
  appointment?: {
    bookingId: string;
    patientName: string;
    doctorName: string;
    clinicName: string;
    email: string;
    phone: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    notificationRecords?: Array<{
      channel: string;
      recipient?: string;
      deliveryStatus: string;
      errorMessage?: string | null;
    }>;
  };
  error?: string;
};

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [appointment, setAppointment] = useState<BookingResponse["appointment"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    fetch(`/api/appointments?bookingId=${bookingId}`)
      .then((response) => response.json())
      .then((data: BookingResponse) => {
        if (data.error) {
          setError(data.error);
          return;
        }

        setAppointment(data.appointment ?? null);
      })
      .catch(() => setError("Unable to fetch the confirmation details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const missingBookingError = !bookingId ? "Missing booking reference." : null;
  const displayError = error ?? missingBookingError;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-slate-600 shadow-sm">
          Loading confirmation…
        </div>
      </main>
    );
  }

  if (displayError || !appointment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Booking error</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Unable to load this booking</h1>
          <p className="mt-3 text-slate-600">{displayError ?? "We could not find this appointment."}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Return to booking
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Appointment confirmed</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Thank you, {appointment.patientName}</h1>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-2 text-2xl">✅</div>
        </div>

        <div className="grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Booking reference</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{appointment.bookingId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
            <p className="mt-2 text-lg font-medium text-emerald-700">{appointment.status}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-slate-700">
          <p><span className="font-semibold text-slate-900">Doctor:</span> {appointment.doctorName}</p>
          <p><span className="font-semibold text-slate-900">Clinic:</span> {appointment.clinicName}</p>
          <p><span className="font-semibold text-slate-900">Date:</span> {appointment.appointmentDate}</p>
          <p><span className="font-semibold text-slate-900">Time:</span> {appointment.startTime} – {appointment.endTime}</p>
          <p><span className="font-semibold text-slate-900">Phone:</span> {appointment.phone}</p>
          <p><span className="font-semibold text-slate-900">Email:</span> {appointment.email}</p>
        </div>

        {appointment.notificationRecords?.filter((notification) => notification.channel === "WHATSAPP").map((notification) => (
          <div
            key={`whatsapp-${notification.recipient ?? "doctor"}`}
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              notification.deliveryStatus === "SENT"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-semibold">
              WhatsApp to {notification.recipient === "PATIENT" ? "you" : "doctor"}:{" "}
              {notification.deliveryStatus === "SENT" ? "Accepted by Meta" : "Not sent"}
            </p>
            {notification.deliveryStatus === "SENT" ? (
              <p className="mt-1">
                Meta accepted the request; this does not confirm delivery to the{" "}
                {notification.recipient === "PATIENT" ? "patient" : "doctor"}&apos;s device.
              </p>
            ) : null}
            {notification.deliveryStatus !== "SENT" && notification.errorMessage ? (
              <p className="mt-1">{notification.errorMessage}</p>
            ) : null}
          </div>
        ))}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => window.print()} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
            Print
          </button>
          <button type="button" onClick={() => router.push("/")} className="rounded-2xl bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700">
            Book another visit
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-100 px-4"><div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-slate-600 shadow-sm">Loading confirmation…</div></main>}>
      <ConfirmationContent />
    </Suspense>
  );
}
