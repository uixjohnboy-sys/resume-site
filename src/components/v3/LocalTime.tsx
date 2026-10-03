"use client";

import { useEffect, useState } from "react";

// His local time, live, in the footer: a small sign that there is a real
// person in a real place behind the page. Tarlac is on Philippine Time
// (UTC+8, no daylight saving). Renders nothing until mounted, so the
// server and the first paint never disagree.
export default function LocalTime() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="v3-time" suppressHydrationWarning>
      Tarlac, PH <span>/</span> {now ?? "--:--"} PHT
    </span>
  );
}
