// The two-way sync diagram: GoHighLevel on one side, the custom app on
// the other, data packets travelling both directions between them. This is
// the whole positioning of the site drawn as one picture, so a
// non-technical owner gets it before reading a single paragraph.
// Pure JSX + CSS keyframes (see .jb-sync in home.css): no JS, packets are
// hidden entirely under prefers-reduced-motion.

export default function SyncDiagram() {
  return (
    <div className="jb-sync" role="img" aria-label="Diagram: GoHighLevel and a custom app exchanging data in both directions by webhook">
      <div className="jb-sync-node">
        <span className="jb-sync-k">CRM</span>
        <span className="jb-sync-n">GoHighLevel</span>
        <span className="jb-sync-d">pipelines · workflows · calendars</span>
      </div>

      <div className="jb-sync-wires" aria-hidden="true">
        <div className="jb-sync-wire">
          <span className="jb-sync-wlabel">webhook out →</span>
          <span className="jb-packet p1" />
          <span className="jb-packet p2" />
        </div>
        <div className="jb-sync-wire rev">
          <span className="jb-sync-wlabel">← webhook in</span>
          <span className="jb-packet p1" />
          <span className="jb-packet p2" />
        </div>
      </div>

      <div className="jb-sync-node app">
        <span className="jb-sync-k">Custom app</span>
        <span className="jb-sync-n">Next.js · Firebase · Stripe · AI</span>
        <span className="jb-sync-d">everything past the CRM&rsquo;s walls</span>
      </div>
    </div>
  );
}
