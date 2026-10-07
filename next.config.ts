import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows qualities listed here and defaults to [75]. The v3
    // portrait is an upscaled source, so the extra re-compression at 75 was
    // visibly softening his face; it asks for 90.
    qualities: [75, 90],
  },
  async rewrites() {
    return [
      // The Front Door Check, the page linked from cold outreach to martial
      // arts schools. It is a standalone static page in public/ rather than an
      // app route on purpose: its audience is a school owner, not an agency,
      // so it carries its own typography and palette instead of the neon
      // system in home.css, and serving it outside the root layout keeps the
      // two from fighting over fonts and globals. The rewrite gives it a clean
      // /schools address for the links that go out in email.
      { source: "/schools", destination: "/schools.html" },
    ];
  },
  async redirects() {
    return [
      // The v3 preview became the homepage on 2026-10-07. Only the bare page
      // path redirects: its images and audio still live under /v3/ in public.
      // Temporary on purpose, in case the old homepage ever comes back.
      { source: "/v3", destination: "/", permanent: false },
      // The Coach OS walkthrough booking page moved to the coachos
      // subdomain so the whole prospect journey (fit assessment ->
      // booking) lives under one brand. Old links in already-sent
      // emails and DMs keep working through this redirect; the query
      // string (?assessed=1) is carried over automatically.
      {
        source: "/coach-os-walkthrough",
        destination: "https://coachos.johnboydesign.com/book",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
