import { NextRequest } from "next/server";

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = escapeIcsText(searchParams.get("title") || "Call with Johnboy Roxas");
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";
  const location = escapeIcsText(searchParams.get("location") || "");
  const description = escapeIcsText(searchParams.get("description") || "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//johnboydesign.com//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@johnboydesign.com`,
    `SUMMARY:${title}`,
    start ? `DTSTART:${start}` : null,
    end ? `DTEND:${end}` : null,
    location ? `LOCATION:${location}` : null,
    description ? `DESCRIPTION:${description}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const ics = lines.join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="appointment.ics"',
    },
  });
}
