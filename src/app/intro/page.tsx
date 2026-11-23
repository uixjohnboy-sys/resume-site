import type { Metadata } from "next";
import Link from "next/link";
import { anton, host, plex } from "../fonts";
import IntroPlayer from "@/components/home/IntroPlayer";
import "../v4/v4.css";
import "../home-dark.css";
import "./intro.css";

// One shareable link for the intro video (VA4U, OnlineJobs, LinkedIn): the film, who it is, and two ways forward.
// Same black look as the homepage. The video file itself lives in public/intro/.

const TITLE = "Intro Video | John Boy Roxas, GoHighLevel Specialist";
const DESC =
  "A 1-minute intro from John Boy Roxas: GoHighLevel workflows, funnels, AI agents, integrations and custom apps for agencies and small businesses.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/intro" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/intro",
    siteName: "John Boy Roxas",
    type: "video.other",
    images: [{ url: "/intro/poster-v2.jpg", width: 1200, height: 675, alt: "John Boy Roxas, Systems and Automation" }],
    videos: [{ url: "/intro/john-boy-roxas-intro.mp4", type: "video/mp4", width: 1920, height: 1080 }],
  },
};

export default function IntroPage() {
  return (
    <div className={`v4 v4-dark ${anton.variable} ${host.variable} ${plex.variable}`}>
      <main className="ip-page">
        <header className="ip-head">
          <Link className="v4-mark" href="/">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </Link>
          <p className="v4-kicker">GoHighLevel specialist · HighLevel certified</p>
        </header>

        <div className="v4-film ip-film">
          <IntroPlayer src="/intro/john-boy-roxas-intro.mp4" poster="/intro/poster-v2.webp" length="1:21" />
        </div>

        <div className="ip-foot">
          <p>
            GoHighLevel workflows, funnels and booking, plus AI agents, integrations and custom apps when the CRM runs out.
            Part-time, on Australian hours or US mornings.
          </p>
          <div className="ip-ctas">
            <Link className="v4-btn v4-btn-dark" href="/book">
              Book a 15-min call
            </Link>
            <Link className="v4-btn v4-btn-line" href="/">
              See my work
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
