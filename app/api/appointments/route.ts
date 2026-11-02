import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAppointment,
  getAppointmentByBookingId,
  getDoctorProfile,
  updateWhatsAppNotification,
} from "@/lib/store";
import { formatDisplayDateTime, isValidBookingDate } from "@/lib/appointments";
import { sendDoctorBookingNotification, sendPatientBookingConfirmation } from "@/lib/whatsapp";

const bookingSchema = z.object({
  doctorId: z.string().min(1),
  fullName: z.string().trim().min(2),
  mobileNumber: z.string().trim().min(8),
  email: z.email(),
  age: z.coerce.number().int().min(18).max(100),
  gender: z.enum(["Male", "Female", "Other"]),
  reason: z.string().trim().optional().default(""),
  appointmentDate: z.string().refine(isValidBookingDate, "Please select a valid date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please select a valid appointment time."),
});

function toNotificationSummary(result: { sent: boolean; error?: string }) {
  return {
    status: result.sent ? "SENT" : "FAILED",
    message: result.sent ? "Meta accepted the WhatsApp notification request." : result.error,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ appointments: [] }, { status: 200 });
  }

  const appointment = getAppointmentByBookingId(bookingId);

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  return NextResponse.json({
    appointment,
    summary: {
      doctorName: appointment.doctorName,
      dateText: formatDisplayDateTime(appointment.appointmentDate, appointment.startTime),
      bookingId: appointment.bookingId,
      patientName: appointment.patientName,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.parse(body);

    if (parsed.doctorId !== getDoctorProfile().id) {
      return NextResponse.json({ error: "The selected doctor is unavailable." }, { status: 400 });
    }

    const appointment = createAppointment({
      doctorId: parsed.doctorId,
      fullName: parsed.fullName,
      mobileNumber: parsed.mobileNumber,
      email: parsed.email,
      age: parsed.age,
      gender: parsed.gender,
      reason: parsed.reason || null,
      appointmentDate: parsed.appointmentDate,
      startTime: parsed.startTime,
    });

    const [doctorResult, patientResult] = await Promise.all([
      sendDoctorBookingNotification(appointment),
      sendPatientBookingConfirmation(appointment),
    ]);
    updateWhatsAppNotification(
      appointment.bookingId,
      "DOCTOR",
      doctorResult.sent ? "SENT" : "FAILED",
      doctorResult.error ?? null,
    );
    const updatedAppointment = updateWhatsAppNotification(
      appointment.bookingId,
      "PATIENT",
      patientResult.sent ? "SENT" : "FAILED",
      patientResult.error ?? null,
    );

    return NextResponse.json(
      {
        success: true,
        appointment: updatedAppointment ?? appointment,
        bookingReference: appointment.bookingId,
        message: "Your appointment has been booked successfully.",
        notifications: [
          { channel: "WHATSAPP", recipient: "DOCTOR", ...toNotificationSummary(doctorResult) },
          { channel: "WHATSAPP", recipient: "PATIENT", ...toNotificationSummary(patientResult) },
        ],
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to book this appointment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
