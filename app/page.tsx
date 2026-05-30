"use client";

import { useCallback, useRef, useState } from "react";

// Strip a leading ```html fence and a trailing ``` if the model ever adds them,
// and pull out the inline error sentinel the server stream emits on failure.
const ERROR_RE = /<!-- carle-error: ([\s\S]*?) -->/;
function clean(raw: string): { html: string; error: string | null } {
  const err = raw.match(ERROR_RE);
  let html = raw.replace(ERROR_RE, "");
  html = html.replace(/^\s*```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "");
  return { html: html.trimStart(), error: err ? err[1] : null };
}

async function streamInto(
  res: Response,
  onChunk: (full: string) => void,
): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk(full);
  }
  return full;
}

type Phase = "idle" | "building" | "ready" | "training" | "trained";

export default function Carle() {
  const [prompt, setPrompt] = useState("");
  const [tweak, setTweak] = useState("");
  const [html, setHtml] = useState("");
  const [vibe, setVibe] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = phase === "building" || phase === "training";
  const iframeKey = useRef(0);

  const generate = useCallback(async () => {
    if (!prompt.trim() || busy) return;
    setError(null);
    setVibe("");
    setPhase("building");
    setHtml("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok && !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      await streamInto(res, (full) => {
        const { html, error } = clean(full);
        setHtml(html);
        if (error) setError(error);
      });
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("idle");
    }
  }, [prompt, busy]);

  const applyTweak = useCallback(async () => {
    if (!tweak.trim() || !html || busy) return;
    setError(null);
    setPhase("building");
    const prev = html;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: prev, tweak }),
      });
      if (!res.ok && !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setHtml("");
      await streamInto(res, (full) => {
        const { html, error } = clean(full);
        setHtml(html);
        if (error) setError(error);
      });
      setTweak("");
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setHtml(prev);
      setPhase("ready");
    }
  }, [tweak, html, busy]);

  const train = useCallback(async () => {
    if (!html || busy) return;
    setError(null);
    setVibe("");
    setPhase("training");
    try {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component: html }),
      });
      if (!res.ok && !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      await streamInto(res, (full) => setVibe(full));
      setPhase("trained");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("ready");
    }
  }, [html, busy]);

  if (html) iframeKey.current += 0; // srcDoc updates in place; key stays stable

  return (
    <div className="shell">
      <aside className="panel">
        <div className="brand">
          <h1>Carle</h1>
          <span className="tag">one component → an agent</span>
        </div>
        <p className="lede">
          Describe a component. Carle builds one — crafted, self-contained, no
          templates. Tweak it until it&apos;s yours, then train an agent on its
          design language to build the whole site.
        </p>

        <label className="field">
          The brief
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A pricing card for a small-batch coffee roaster — warm, tactile, confident."
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
            }}
          />
        </label>
        <button className="btn accent" onClick={generate} disabled={busy || !prompt.trim()}>
          {phase === "building" ? "Building…" : html ? "Rebuild" : "Build it"}
        </button>

        {html && (
          <>
            <div className="divider" />
            <label className="field">
              Tweak it
              <input
                className="text"
                value={tweak}
                onChange={(e) => setTweak(e.target.value)}
                placeholder="Make the accent deeper. Tighten the spacing."
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyTweak();
                }}
              />
            </label>
            <div className="row">
              <button className="btn ghost" onClick={applyTweak} disabled={busy || !tweak.trim()}>
                Apply tweak
              </button>
              <button className="btn" onClick={train} disabled={busy}>
                {phase === "training" ? "Training…" : "Lock & train agent"}
              </button>
            </div>
          </>
        )}

        {error && <div className="error">{error}</div>}

        {vibe && (
          <>
            <div className="divider" />
            <div className="status">
              <span className={"dot" + (phase === "training" ? " live" : "")} />
              {phase === "trained" ? "vibe.md — agent trained" : "extracting vibe.md…"}
            </div>
            <div className="vibe">{vibe}</div>
            <p className="lede">
              This is the agent&apos;s training. Next layer: deploy it to generate
              every page of the site in this exact language.
            </p>
          </>
        )}
      </aside>

      <main className="stage">
        {html ? (
          <iframe key={iframeKey.current} srcDoc={html} title="preview" sandbox="allow-scripts" />
        ) : (
          <div className="empty">
            <div className="mark">✦</div>
            <p className="lede">
              {phase === "building"
                ? "Composing your component…"
                : "Your component renders here, live as it streams."}
            </p>
          </div>
        )}
        {busy && phase === "building" && (
          <div className="status" style={{ position: "absolute", top: 16, left: 16 }}>
            <span className="dot live" /> streaming
          </div>
        )}
      </main>
    </div>
  );
}
