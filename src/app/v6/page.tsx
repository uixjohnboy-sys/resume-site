import { permanentRedirect } from "next/navigation";

// /v6 was the preview of the homepage with the work index (2026-11-13 to 2026-11-15). JB signed it off and it is now "/".
// Kept as a redirect so any link already shared still lands on the homepage's work section.
export default function V6() {
  permanentRedirect("/#work");
}
