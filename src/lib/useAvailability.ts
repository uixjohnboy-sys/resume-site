"use client";

import { useEffect, useState } from "react";

export function useAvailability() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => setAvailable(d.available))
      .catch(() => setAvailable(true));
  }, []);

  return available;
}
