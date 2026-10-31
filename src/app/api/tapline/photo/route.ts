import { getPhoto, validId } from "@/lib/tapline/store";

// Serves a sandbox photo as an image, so board polls never carry photo bytes.
export const runtime = "nodejs";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("sb");
  const ph = u.searchParams.get("ph") ?? "";
  if (!validId(id)) return new Response("Not found", { status: 404 });
  const data = await getPhoto(id, ph);
  if (!data) return new Response("Not found", { status: 404 });
  const bytes = Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
  return new Response(bytes, {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "private, max-age=3600, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'",
    },
  });
}
