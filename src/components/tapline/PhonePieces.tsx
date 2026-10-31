"use client";

import { IconCamera } from "@tabler/icons-react";
import { useState } from "react";
import { shrinkPhoto } from "./photo";

/** Photo picker that shrinks the image in the browser and keeps a preview. */
export function PhotoPick({ onPick, label }: { onPick: (url: string | undefined) => void; label: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  return (
    <div className="tl-photopick">
      <label className="tl-filebtn">
        <IconCamera size={16} aria-hidden="true" />
        {preview ? "Change photo" : label}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              setNote("Preparing the photo...");
              const url = await shrinkPhoto(f);
              setPreview(url);
              onPick(url);
              setNote(null);
            } catch (err) {
              setNote(err instanceof Error ? err.message : "We couldn't use that photo. Try another one.");
            }
          }}
        />
      </label>
      {note && (
        <span className="tl-note" role="status">
          {note}
        </span>
      )}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tl-job-photo" src={preview} alt="Your photo" />
      )}
    </div>
  );
}
