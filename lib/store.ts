import { randomUUID } from "node:crypto";
import {
  buildDailySlots,
  DOCTOR,
  formatDateKey,
  formatDisplayDateTime,
} from "@/lib/appointments";

export type AppointmentStatus = "BOOKED" | "CANCELLED" | "COMPLETED";
export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS";
export type DeliveryStatus = "PENDING" | "SENT" | "FAILED";
export type NotificationRecipient = "DOCTOR" | "PATIENT";

export type NotificationRecord = {
  id: string;
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  deliveryStatus: DeliveryStatus;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type AppointmentRecord = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  clinicName: string;
  bookingId: string;
  patientName: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  reason: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
  notificationRecords: NotificationRecord[];
};

const bookedSlotMap = new Map<string, string>();
const appointments = new Map<string, AppointmentRecord>();

export function getDoctorProfile() {
  return DOCTOR;
}

export function getAvailableSlots(dateKey: string, doctorId: string) {
  const allSlots = buildDailySlots(dateKey);
  return allSlots.filter((slot) => {
    const key = `${doctorId}:${dateKey}:${slot.value}`;
    return !bookedSlotMap.has(key);
  });
}

export function getMonthlyAvailability(doctorId: string, monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const totals: Record<string, number> = {};

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day);
    const dateKey = formatDateKey(date);
    const slots = getAvailableSlots(dateKey, doctorId);
    totals[dateKey] = slots.length;
  }

  return totals;
}

export function createAppointment(input: {
  doctorId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  age: number;
  gender: string;
  reason: string | null;
  appointmentDate: string;
  startTime: string;
}) {
  const validSlots = getAvailableSlots(input.appointmentDate, input.doctorId);
  const selectedSlot = validSlots.find((slot) => slot.value === input.startTime);

  if (!selectedSlot) {
    throw new Error("The selected slot is no longer available.");
  }

  const endTimeMinutes = selectedSlot.endMinutes;
  const endHour = String(Math.floor(endTimeMinutes / 60)).padStart(2, "0");
  const endMinute = String(endTimeMinutes % 60).padStart(2, "0");
  const endTime = `${endHour}:${endMinute}`;

  const id = randomUUID();
  const bookingId = `DOC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const appointment: AppointmentRecord = {
    id,
    doctorId: input.doctorId,
    doctorName: DOCTOR.name,
    specialization: DOCTOR.specialization,
    clinicName: DOCTOR.clinicName,
    bookingId,
    patientName: input.fullName.trim(),
    phone: input.mobileNumber.trim(),
    email: input.email.trim(),
    age: input.age,
    gender: input.gender,
    reason: (input.reason ?? "").trim() || null,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    endTime,
    status: "BOOKED",
    createdAt: new Date().toISOString(),
    notificationRecords: [
      {
        id: randomUUID(),
        channel: "EMAIL",
        recipient: "PATIENT",
        deliveryStatus: "PENDING",
        sentAt: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        channel: "WHATSAPP",
        recipient: "DOCTOR",
        deliveryStatus: "PENDING",
        sentAt: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        channel: "WHATSAPP",
        recipient: "PATIENT",
        deliveryStatus: "PENDING",
        sentAt: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const slotKey = `${input.doctorId}:${input.appointmentDate}:${input.startTime}`;
  bookedSlotMap.set(slotKey, appointment.bookingId);
  appointments.set(appointment.bookingId, appointment);

  return appointment;
}

export function updateWhatsAppNotification(
  bookingId: string,
  recipient: NotificationRecipient,
  deliveryStatus: "SENT" | "FAILED",
  errorMessage: string | null = null,
) {
  const appointment = appointments.get(bookingId);
  if (!appointment) {
    return null;
  }

  const notification = appointment.notificationRecords.find(
    (record) => record.channel === "WHATSAPP" && record.recipient === recipient,
  );
  if (!notification) {
    return appointment;
  }

  notification.deliveryStatus = deliveryStatus;
  notification.sentAt = deliveryStatus === "SENT" ? new Date().toISOString() : null;
  notification.errorMessage = errorMessage;
  return appointment;
}

export function getAppointmentByBookingId(bookingId?: string | null) {
  if (!bookingId) {
    return null;
  }

  return appointments.get(bookingId) ?? null;
}

export function getAppointmentById(id?: string | null) {
  if (!id) {
    return null;
  }

  const result = Array.from(appointments.values()).find((appointment) => appointment.id === id);
  return result ?? null;
}

export function getDoctorAvailabilityMessage(dateKey: string, doctorId: string) {
  const slots = getAvailableSlots(dateKey, doctorId);
  return {
    date: dateKey,
    availableSlots: slots.length,
    label: `${slots.length} slots available`,
    nextAvailable: slots[0]?.label ?? null,
  };
}

export function getConfirmationSummary(appointment: AppointmentRecord) {
  return {
    doctorName: appointment.doctorName,
    dateText: formatDisplayDateTime(appointment.appointmentDate, appointment.startTime),
    bookingId: appointment.bookingId,
    patientName: appointment.patientName,
    status: appointment.status,
  };
}
