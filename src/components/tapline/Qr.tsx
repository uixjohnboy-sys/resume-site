"use client";

import qrcode from "qrcode-generator";
import { useMemo } from "react";

// A QR code drawn as plain SVG rectangles, so a visitor can open the tenant,
// owner or tradie view on their own phone and watch the desktop board react.
export default function Qr({ value, size = 148, label }: { value: string; size?: number; label: string }) {
  const cells = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(value);
    q.make();
    const n = q.getModuleCount();
    const dark: [number, number][] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) dark.push([r, c]);
    return { n, dark };
  }, [value]);
  const pad = 2;
  const total = cells.n + pad * 2;
  return (
    <svg className="tl-qr" width={size} height={size} viewBox={`0 0 ${total} ${total}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={total} height={total} fill="#fff" />
      {cells.dark.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c + pad} y={r + pad} width="1" height="1" fill="#0f1b2d" />
      ))}
    </svg>
  );
}
