"use client";

// Live Philippine-time clock for the topbar. An employer deciding whether
// to message often wonders "what time is it for him right now"; this
// answers it without them doing math. Renders a placeholder on the server
// and fills in after mount, so there is no hydration mismatch.

import { useEffect, useState } from "react";

export default function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{now ?? "--:--:-- --"}</span>;
}
