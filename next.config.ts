import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
