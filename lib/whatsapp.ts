import type { AppointmentRecord } from "@/lib/store";
import { formatDisplayDate } from "@/lib/appointments";

type WhatsAppResult = {
  sent: boolean;
  error?: string;
};

type TemplateMessage = {
  to: string;
  templateName: string;
  parameters: string[];
};

function getMetaConfig() {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const languageCode = process.env.META_WHATSAPP_TEMPLATE_LANGUAGE;
  const apiVersion = process.env.META_GRAPH_API_VERSION;

  if (!accessToken || !phoneNumberId || !languageCode || !apiVersion) {
    return {
      error: "WhatsApp notification was not sent: configure the Meta WhatsApp credentials in the server environment.",
    };
  }

  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    return { error: "WhatsApp notification was not sent: META_GRAPH_API_VERSION must look like vXX.X." };
  }

  return { accessToken, phoneNumberId, languageCode, apiVersion };
}

// Meta expects digits only, including the country code. Numbers typed without "+" and
// with no country code (e.g. a 10-digit local number) get WHATSAPP_DEFAULT_COUNTRY_CODE.
function normalizeWhatsAppNumber(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  const defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE ?? "").replace(/\D/g, "");

  if (!rawNumber.trim().startsWith("+") && digits.length === 10 && defaultCountryCode) {
    return `${defaultCountryCode}${digits}`;
  }

  return digits;
}

async function sendTemplateMessage(message: TemplateMessage): Promise<WhatsAppResult> {
  const config = getMetaConfig();
  if ("error" in config) {
    return { sent: false, error: config.error };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to,
          type: "template",
          template: {
            name: message.templateName,
            language: { code: config.languageCode },
            // Meta's built-in hello_world template has no variables, so it must be sent without components.
            ...(message.templateName === "hello_world"
              ? {}
              : {
                  components: [
                    {
                      type: "body",
                      parameters: message.parameters.map((text) => ({ type: "text", text })),
                    },
                  ],
                }),
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const errorMessage =
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "object" &&
        payload.error !== null &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
          ? payload.error.message
          : `Meta WhatsApp API returned HTTP ${response.status}.`;

      return { sent: false, error: `WhatsApp notification failed: ${errorMessage}` };
    }

    return { sent: true };
  } catch {
    return { sent: false, error: "WhatsApp notification failed because Meta could not be reached." };
  }
}

export async function sendDoctorBookingNotification(
  appointment: AppointmentRecord,
): Promise<WhatsAppResult> {
  const doctorNumber = normalizeWhatsAppNumber(process.env.DOCTOR_WHATSAPP_TO ?? "");
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME;

  if (!doctorNumber || !templateName) {
    return {
      sent: false,
      error: "WhatsApp notification was not sent: configure DOCTOR_WHATSAPP_TO and META_WHATSAPP_TEMPLATE_NAME.",
    };
  }

  return sendTemplateMessage({
    to: doctorNumber,
    templateName,
    parameters: [
      appointment.patientName,
      formatDisplayDate(appointment.appointmentDate),
      appointment.startTime,
      appointment.phone,
      appointment.bookingId,
    ],
  });
}

export async function sendPatientBookingConfirmation(
  appointment: AppointmentRecord,
): Promise<WhatsAppResult> {
  const patientNumber = normalizeWhatsAppNumber(appointment.phone);
  const templateName = process.env.META_WHATSAPP_PATIENT_TEMPLATE_NAME;

  if (!templateName) {
    return {
      sent: false,
      error: "WhatsApp confirmation was not sent: configure META_WHATSAPP_PATIENT_TEMPLATE_NAME.",
    };
  }

  if (patientNumber.length < 11) {
    return {
      sent: false,
      error: "WhatsApp confirmation was not sent: the mobile number must include the country code (e.g. +91).",
    };
  }

  return sendTemplateMessage({
    to: patientNumber,
    templateName,
    parameters: [
      appointment.patientName,
      appointment.doctorName,
      formatDisplayDate(appointment.appointmentDate),
      appointment.startTime,
      appointment.bookingId,
    ],
  });
}
