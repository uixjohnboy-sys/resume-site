// What the homepage says about John Boy: the clients strip, the About cards and their "Know more" pop-ups read from here.
// Facts only, in his confirmed words. The NDA client is only ever "Confidential client (NDA)": no country, no industry.

export const clients = [
  { name: "K Australia Design", note: "Lead GHL Automation Architect · Sep 2024 to Sep 2025" },
  { name: "Confidential client (NDA)", note: "GoHighLevel Specialist · Apr 2026 to present" },
  { name: "Chaos to Closing", note: "GoHighLevel Systems Builder · Mar 2026 to Sep 2026" },
  { name: "Wrldinvsn", note: "Lead Flow and Funnel Operations · Dec 2025 to Feb 2026" },
  { name: "Masterpiece Las Vegas", note: "US, through Virtualasting" },
  { name: "Virtualasting", note: "Automation and CRM Support · Feb 2021 to Jul 2024" },
];

// The 5 years, newest first (the "Know more" pop-up on the years card). Same roles and dates as the clients strip.
export const timeline = [
  { name: "Confidential client (NDA)", role: "GoHighLevel Specialist", when: "Apr 2026 to present" },
  { name: "Chaos to Closing", role: "GoHighLevel Systems Builder", when: "Mar 2026 to Sep 2026" },
  { name: "Wrldinvsn", role: "Lead Flow and Funnel Operations", when: "Dec 2025 to Feb 2026" },
  { name: "K Australia Design", role: "Lead GHL Automation Architect", when: "Sep 2024 to Sep 2025" },
  { name: "Virtualasting", role: "Automation and CRM Support", when: "Feb 2021 to Jul 2024", note: "Including Masterpiece Las Vegas, US" },
];

// JB's own story of the 5 years, one string per paragraph. Empty until he writes it; the pop-up shows only the timeline until then.
export const story: string[] = [];

// HighLevel certifications. Add the next one here when it is issued and the card and pop-up pick it up.
export const certs = [
  { img: "/badge-workflow-automation-expert.png", name: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", name: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", name: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", name: "Course and Community Expert" },
];
