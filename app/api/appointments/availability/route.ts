import { NextResponse } from "next/server";
import { getMonthlyAvailability, getAvailableSlots } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId") ?? "dr-sarah-chen";
  const monthKey = searchParams.get("month");
  const dateKey = searchParams.get("date");

  if (monthKey) {
    return NextResponse.json({
      doctorId,
      month: monthKey,
      availability: getMonthlyAvailability(doctorId, monthKey),
    });
  }

  if (!dateKey) {
    return NextResponse.json({ error: "A date is required." }, { status: 400 });
  }

  return NextResponse.json({
    doctorId,
    date: dateKey,
    slots: getAvailableSlots(dateKey, doctorId),
  });
}
