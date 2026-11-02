import { NextResponse } from "next/server";
import { getAppointmentById } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const appointment = getAppointmentById(id);

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}
