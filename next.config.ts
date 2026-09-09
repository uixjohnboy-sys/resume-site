import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
