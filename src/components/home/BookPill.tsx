"use client";

// Floating "Book a call" pill. Hidden while the hero (which has its own
// CTAs) is on screen, then slides in once the visitor starts reading, so
// the ask is always one tap away without shouting over the opening.

import { useEffect, useState } from "react";

export default function BookPill() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a className={"jb-bookpill" + (show ? " show" : "")} href="/book">
      <span className="jb-dot" aria-hidden="true" />
      Book a call
    </a>
  );
}
