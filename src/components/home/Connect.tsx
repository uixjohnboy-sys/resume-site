// The connect row on the homepage contact panel.
//
// Two of these have to behave a specific way, so they are deliberate:
//   - WhatsApp uses wa.me, which hands off to the installed WhatsApp app on
//     a phone and WhatsApp Web on desktop, with the message already started.
//   - Email uses mailto: with the address and subject prefilled, so the
//     visitor lands in a compose window instead of copying an address.
// Both carry a short prefilled opener; a visitor who only has to press send
// converts far better than one staring at an empty box.

const WHATSAPP = "639773659548";
const EMAIL = "uix.johnboy@gmail.com";
const OPENER = "Hi Johnboy, I found you through your portfolio.";

type Item = {
  label: string;
  href: string;
  external: boolean;
  icon: React.ReactNode;
};

const items: Item[] = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(OPENER)}`,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: `mailto:${EMAIL}?subject=${encodeURIComponent("Work with you")}&body=${encodeURIComponent(OPENER)}`,
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="m3 7 8.15 5.7a1.5 1.5 0 0 0 1.7 0L21 7" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.25h4v11.5H3V9.25Zm6.5 0h3.83v1.57h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.12v5.89h-4v-5.22c0-1.25-.02-2.85-1.74-2.85-1.74 0-2.01 1.36-2.01 2.76v5.31h-4V9.25Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/uix.johnboy/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/uix.johnboy",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    ),
  },
];

export default function Connect() {
  return (
    <div className="jb-connect">
      <div className="jb-connect-k">Connect with me</div>
      <div className="jb-connect-row">
        {items.map((i) => (
          <a
            key={i.label}
            className="jb-conn"
            href={i.href}
            {...(i.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <span className="jb-conn-i" aria-hidden="true">
              {i.icon}
            </span>
            {i.label}
          </a>
        ))}
      </div>
    </div>
  );
}
