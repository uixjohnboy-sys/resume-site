import { EXCLUDED, MAX_FIELD, PIPELINE_NAME, SEED_TAG } from "./config.ts";
import { publicCampaign, publicMedium, publicRef, publicSource, publicStage, roundQuarter } from "./public.ts";
import type { Booking, Provider } from "./types.ts";

// The live provider: GoHighLevel API v2, read only. Used only when GHL_LEADSOURCE_TOKEN and GHL_LEADSOURCE_LOCATION are
// both set (provider.ts); it never runs in the build or the tests.
//
// Calls (both need only the opportunities.readonly scope, SPEC 6.3):
//   GET /opportunities/pipelines?locationId=...                 the demo pipeline and its stage names
//   GET /opportunities/search?location_id=...&pipeline_id=...   the bookings, 100 a page
// Each opportunity is projected to {ref, source, medium, campaign, stage, bookedAt, seed} at once (mapOpportunity).
// The raw response (contact name, email, phone, notes) is never cached, logged or returned. The token is never logged
// or returned: errors carry only an HTTP status.

export const GHL_BASE = "https://services.leadconnectorhq.com";
export const GHL_VERSION = "2021-07-28";
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const TIMEOUT_MS = 8000;

/** The opportunity custom field ids, from GHL_LEADSOURCE_FIELDS. bookedAt is optional (createdAt is the fallback). */
export type FieldIds = { source: string; medium: string; campaign: string; ref: string; bookedAt?: string };

export class GhlError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`GoHighLevel request failed (${reason})`);
    this.name = "GhlError";
    this.reason = reason;
  }
}

const ID_RE = /^[A-Za-z0-9]{6,64}$/;

/** Parse GHL_LEADSOURCE_FIELDS ({"source":"id","medium":"id","campaign":"id","ref":"id","bookedAt":"id"}). */
export function parseFieldIds(raw: string | undefined): FieldIds | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const ok = (k: string) => typeof o[k] === "string" && ID_RE.test(o[k] as string);
    if (!ok("source") || !ok("medium") || !ok("campaign") || !ok("ref")) return null;
    if (o.bookedAt !== undefined && !ok("bookedAt")) return null;
    return { source: o.source as string, medium: o.medium as string, campaign: o.campaign as string, ref: o.ref as string, ...(o.bookedAt ? { bookedAt: o.bookedAt as string } : {}) };
  } catch {
    return null;
  }
}

type RawField = { id?: unknown; fieldValue?: unknown; fieldValueString?: unknown; fieldValueNumber?: unknown; fieldValueDate?: unknown; value?: unknown };
type RawOpp = {
  pipelineStageId?: unknown;
  status?: unknown;
  createdAt?: unknown;
  customFields?: unknown;
  contact?: { tags?: unknown } | null;
};

function fieldValue(opp: RawOpp, id: string | undefined): unknown {
  if (!id || !Array.isArray(opp.customFields)) return undefined;
  const f = (opp.customFields as RawField[]).find((x) => x && x.id === id);
  if (!f) return undefined;
  return f.fieldValueString ?? f.fieldValue ?? f.fieldValueNumber ?? f.fieldValueDate ?? f.value;
}

/** A time with a clock part (epoch ms, numeric string or ISO date-time), else null. Date-only values have no time. */
function timeOf(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 1e12) return v;
  if (typeof v !== "string" || v.length > MAX_FIELD) return null;
  if (/^\d{13}$/.test(v)) return Number(v);
  if (!/T\d{2}:\d{2}/.test(v)) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}

/** One opportunity to one projected booking, or null when the guard excluded it or it has no usable time. */
export function mapOpportunity(opp: RawOpp, stageNames: ReadonlyMap<string, string>, fields: FieldIds): Booking | null {
  if (!opp || typeof opp !== "object") return null;
  const rawSource = fieldValue(opp, fields.source);
  if (typeof rawSource === "string" && rawSource.trim() === EXCLUDED) return null;
  const bookedAt = timeOf(fieldValue(opp, fields.bookedAt)) ?? timeOf(opp.createdAt);
  if (bookedAt === null) return null;
  const tags = Array.isArray(opp.contact?.tags) ? (opp.contact!.tags as unknown[]) : [];
  const stageId = typeof opp.pipelineStageId === "string" ? opp.pipelineStageId : "";
  return {
    ref: publicRef(fieldValue(opp, fields.ref)),
    // A booking with no source recorded is counted as Unknown, never dropped.
    source: rawSource === undefined || rawSource === null || rawSource === "" ? "Unknown" : publicSource(rawSource),
    medium: (() => {
      const m = fieldValue(opp, fields.medium);
      return m === undefined || m === null || m === "" ? "none" : publicMedium(m);
    })(),
    campaign: publicCampaign(fieldValue(opp, fields.campaign)),
    stage: publicStage(stageNames.get(stageId), opp.status),
    bookedAt: roundQuarter(bookedAt),
    seed: tags.some((t) => t === SEED_TAG),
  };
}

type Pipeline = { id?: unknown; name?: unknown; stages?: { id?: unknown; name?: unknown }[] };

/** The demo pipeline (by id when given, else by name) and its stage names. */
export function pickPipeline(pipelines: unknown, pipelineId?: string): { id: string; stages: Map<string, string> } | null {
  if (!Array.isArray(pipelines)) return null;
  const p = (pipelines as Pipeline[]).find((x) => (pipelineId ? x?.id === pipelineId : x?.name === PIPELINE_NAME));
  if (!p || typeof p.id !== "string") return null;
  const stages = new Map<string, string>();
  for (const s of Array.isArray(p.stages) ? p.stages : []) {
    if (typeof s?.id === "string" && typeof s?.name === "string") stages.set(s.id, s.name);
  }
  return { id: p.id, stages };
}

export type GhlConfig = { token: string; location: string; pipelineId?: string; fields: FieldIds | null; fetchImpl?: typeof fetch };

export function ghlProvider(cfg: GhlConfig): Provider {
  const doFetch = cfg.fetchImpl ?? fetch;

  async function call(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
    const url = `${GHL_BASE}${path}?${new URLSearchParams(params)}`;
    let res: Response;
    try {
      res = await doFetch(url, {
        headers: { Authorization: `Bearer ${cfg.token}`, Version: GHL_VERSION, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new GhlError("network");
    }
    // S-m1: the shared daily API budget of the location, logged as a number only.
    const left = res.headers.get("x-ratelimit-daily-remaining");
    if (left && /^\d+$/.test(left)) console.info(`lead-source: GoHighLevel daily calls remaining ${left}`);
    if (!res.ok) throw new GhlError(`status ${res.status}`);
    try {
      return (await res.json()) as Record<string, unknown>;
    } catch {
      throw new GhlError("bad json");
    }
  }

  return {
    mode: "live",
    async list() {
      if (!cfg.fields) throw new GhlError("GHL_LEADSOURCE_FIELDS missing or invalid");
      const pipes = await call("/opportunities/pipelines", { locationId: cfg.location });
      const pipe = pickPipeline(pipes.pipelines, cfg.pipelineId);
      if (!pipe) throw new GhlError("demo pipeline not found");
      const out: Booking[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const r = await call("/opportunities/search", { location_id: cfg.location, pipeline_id: pipe.id, limit: String(PAGE_SIZE), page: String(page) });
        const opps = Array.isArray(r.opportunities) ? (r.opportunities as RawOpp[]) : [];
        for (const o of opps) {
          const b = mapOpportunity(o, pipe.stages, cfg.fields);
          if (b) out.push(b);
        }
        if (opps.length < PAGE_SIZE) break;
      }
      return out;
    },
  };
}
