"use client";

// The category page's centred cover-flow (JB approved the mockup 2026-11-28, PortfolioProjects/work-cards/category-mockup):
// card 1 is the kind of work itself, the next cards are its demos with a real screenshot. Below the flow, the open demo
// shows what was built and what each piece does for the client (when the demo has that detail), or its line and link.
import Image from "next/image";
import { useState } from "react";
import type { Proof } from "@/lib/work";

type Props = { n: string; title: string; art: string; demos: Proof[] };

const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

export default function DemoFlow({ n, title, art, demos }: Props) {
  // 0 = the category card; the first demo opens by default.
  const [cur, setCur] = useState(demos.length ? 1 : 0);
  const count = demos.length + 1;
  const open = demos[Math.max(cur, 1) - 1];
  const d = open?.detail;

  return (
    <>
      <section className="df-flow" aria-roledescription="carousel" aria-label={`Demos for ${title}`}>
        <div className="df-stage">
          {[null, ...demos].map((p, i) => {
            const o = i - cur;
            const a = Math.abs(o);
            const style = {
              transform: `translateX(calc(${o} * var(--df-step))) translateZ(${-a * 160}px) rotateY(${o === 0 ? 0 : o > 0 ? -28 : 28}deg)`,
              opacity: a > 1 ? 0 : a === 0 ? 1 : 0.55,
              zIndex: 10 - a,
            };
            const label = p ? `${p.name}, ${p.kind}` : `${n} ${title}`;
            return (
              <button
                key={p ? p.name : "cat"}
                type="button"
                className={`df-card${p ? "" : " df-cat"}${a ? " df-side" : ""}`}
                style={style}
                onClick={() => setCur(i)}
                aria-label={label}
                aria-current={a === 0 ? "true" : undefined}
                tabIndex={a > 1 ? -1 : 0}
                aria-hidden={a > 1 ? true : undefined}
              >
                {p ? (
                  <>
                    <span className="df-shot">
                      <span className="df-bar" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <Image src={p.card!} alt="" width={800} height={500} sizes="400px" />
                    </span>
                    <span className="df-body">
                      <span className="df-mono">{p.kind}</span>
                      <b>{p.name}</b>
                      <span className="df-line">{p.line}</span>
                    </span>
                  </>
                ) : (
                  <span className="df-shot df-art">
                    <Image src={art} alt="" width={1200} height={960} sizes="400px" priority />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
      <div className="df-ctrl">
        <button type="button" aria-label="Previous" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0}>
          ←
        </button>
        <div className="df-dots" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <i key={i} className={i === cur ? "on" : ""} />
          ))}
        </div>
        <button type="button" aria-label="Next" onClick={() => setCur((c) => Math.min(count - 1, c + 1))} disabled={cur === count - 1}>
          →
        </button>
      </div>

      {open && (
        <section className="df-open" aria-live="polite">
          <div className="df-head">
            <p className="df-mono">
              {open.kind} · {Math.max(cur, 1)} of {demos.length} in this kind of work{d ? ` · ${d.kicker}` : ""}
            </p>
            <h2>{open.name}</h2>
            <p>{d ? d.intro : open.line}</p>
            <div className="v4-ctas df-ctas">
              {open.href && (
                <a className="v4-btn v4-btn-dark" href={open.href} {...ext(open.href)}>
                  {open.cta ?? "Open"}
                </a>
              )}
              {d?.test && (
                <a className="v4-btn v4-btn-line" href={d.test.href} {...ext(d.test.href)}>
                  {d.test.label}
                </a>
              )}
            </div>
          </div>

          {d && (
            <>
              <figure className="df-hero">
                <span className="df-bar" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>{d.url}</span>
                </span>
                <Image src={d.hero.src} alt={d.hero.alt} width={d.hero.w} height={d.hero.h} sizes="(max-width: 1100px) 100vw, 1040px" />
              </figure>

              <dl className="df-facts">
                {d.facts.map(([v, k]) => (
                  <div key={k}>
                    <dd>{v}</dd>
                    <dt className="df-mono">{k}</dt>
                  </div>
                ))}
              </dl>

              <div className="df-built-h">
                <p className="df-mono">What I built, and what it does for the {d.audience ?? "business"}</p>
                <h3>Every piece, and why it&apos;s there</h3>
              </div>
              <ul className="df-grid">
                {d.pieces.map((pc) => (
                  <li key={pc.title}>
                    <div className="df-pic">
                      {pc.img && <Image src={pc.img} alt={`${pc.what}: screenshot`} width={800} height={500} sizes="(max-width: 620px) 100vw, 360px" />}
                      {pc.phone && (
                        <span className="df-phone">
                          <Image src={pc.phone} alt="The home page at phone width" width={390} height={844} sizes="120px" />
                        </span>
                      )}
                      {pc.mail && (
                        <span className="df-mail" role="img" aria-label={`Drawing of the email: ${pc.mail.subject}`}>
                          <b>{pc.mail.from}</b>
                          <span>{pc.mail.subject}</span>
                          <i style={{ width: "90%" }} />
                          <i style={{ width: "70%" }} />
                          <i style={{ width: "80%" }} />
                          {pc.mail.cta && <em>{pc.mail.cta}</em>}
                        </span>
                      )}
                      {pc.flow && (
                        <span className="df-wf" role="img" aria-label={`Workflow steps: ${pc.flow.join(", then ")}`}>
                          {pc.flow.map((s, i) => (
                            <span key={s}>
                              {i > 0 && <em aria-hidden="true">|</em>}
                              <span>{s}</span>
                            </span>
                          ))}
                        </span>
                      )}
                      {(pc.mail || pc.flow) && <span className="df-drawn">Drawing</span>}
                    </div>
                    <div className="df-txt">
                      <p className="df-mono">{pc.what}</p>
                      <h4>{pc.title}</h4>
                      <p>
                        <b>For the {d.audience ?? "business"}:</b> {pc.benefit}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {d.owner && (
                <div className="df-owner">
                  <div>
                    <p className="df-mono">For the business owner</p>
                    <h3>Flip to Owner view</h3>
                    <p>{d.owner.text}</p>
                    <a className="v4-btn v4-btn-line" href={d.owner.href} {...ext(d.owner.href)}>
                      See it on the live site
                    </a>
                  </div>
                  <Image src={d.owner.img} alt="" width={800} height={500} sizes="(max-width: 900px) 100vw, 500px" />
                </div>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
}
