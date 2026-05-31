"use client";

import { useCallback, useState } from "react";

type Sample = { id: string; label: string; html: string };
type Palette = { field: string; accents: string; ink: string; mood: string };
type Brand = {
  id: string;
  name: string;
  expanded: string;
  canvasMode: string;
  palette: Palette;
  accent: string;
  typography: string;
  voice: string[];
  sections: { id: string; label: string; brief: string; template: string | null }[];
};
type Phase = "intake" | "brand" | "samples" | "review" | "confirming" | "done";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`);
  return r.json();
}

// A scaled, non-interactive live preview of a generated section.
function Preview({ html }: { html: string }) {
  return (
    <div style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: 14, border: "1px solid #23252b", background: "#fff" }}>
      <iframe
        srcDoc={html}
        title="preview"
        sandbox=""
        scrolling="no"
        style={{ width: 1280, height: 900, border: "none", transform: "scale(0.5)", transformOrigin: "top left", pointerEvents: "none" }}
      />
    </div>
  );
}

type Tier = "economy" | "standard" | "premium";

export default function Onboard() {
  const [phase, setPhase] = useState<Phase>("intake");
  const [business, setBusiness] = useState("");
  const [tier, setTier] = useState<Tier>("standard");
  const [brand, setBrand] = useState<Brand | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<{ usd: number; credits: number } | null>(null);

  const buildSamples = useCallback(async (b: Brand) => {
    setPhase("samples");
    try {
      const { samples, cost } = await postJSON<{ samples: Sample[]; cost?: { usd: number; credits: number } }>("/api/samples", { brand: b });
      setSamples(samples);
      if (cost) setCost(cost);
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("review");
    }
  }, []);

  const start = useCallback(async () => {
    if (!business.trim()) return;
    setError(null);
    setPhase("brand");
    try {
      const b = await postJSON<Brand>("/api/brand", { business, tier });
      setBrand(b);
      await buildSamples(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("intake");
    }
  }, [business, buildSamples]);

  const tweakBrand = useCallback(async () => {
    if (!brand) return;
    const note = window.prompt("How should the brand change? (e.g. 'darker and more technical', 'warmer, more playful')");
    if (!note) return;
    setError(null);
    setPhase("brand");
    try {
      const b = await postJSON<Brand>("/api/brand", { business, tweak: note });
      setBrand(b);
      await buildSamples(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("review");
    }
  }, [brand, business, buildSamples]);

  const regenerate = useCallback(async (id: string) => {
    if (!brand) return;
    setBusyId(id);
    try {
      const { samples: out } = await postJSON<{ samples: Sample[] }>("/api/samples", { brand, only: id });
      if (out[0]) setSamples((prev) => prev.map((s) => (s.id === id ? out[0] : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }, [brand]);

  const confirm = useCallback(async () => {
    if (!brand) return;
    setPhase("confirming");
    try {
      await postJSON("/api/projects", { brand, samples });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("review");
    }
  }, [brand, samples]);

  const working = phase === "brand" || phase === "samples";

  return (
    <main style={S.main}>
      <div style={S.wrap}>
        <header style={S.head}>
          <div style={S.logo}>Carle</div>
          <div style={S.tag}>Describe your product. Get a brand and a site that looks like it shipped.</div>
        </header>

        {(phase === "intake" || phase === "brand") && (
          <section style={S.card}>
            <label style={S.label}>What are you building?</label>
            <textarea
              style={S.textarea}
              placeholder="e.g. an AI agent that automates customer support for Shopify stores"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              disabled={working}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <span style={{ fontSize: 13, color: "#9a9ca6" }}>Model tier</span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                disabled={working}
                style={{ background: "#0b0c0f", color: "#e8e8ec", border: "1px solid #2a2c34", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              >
                <option value="economy">Economy — cheapest</option>
                <option value="standard">Standard — balanced</option>
                <option value="premium">Premium — best quality</option>
              </select>
            </div>
            <button style={{ ...S.primary, opacity: working || !business.trim() ? 0.5 : 1 }} onClick={start} disabled={working || !business.trim()}>
              {phase === "brand" ? "Designing your brand…" : "Create my brand →"}
            </button>
          </section>
        )}

        {brand && phase !== "intake" && phase !== "brand" && (
          <section style={S.brandBar}>
            <div>
              <div style={S.brandName}>{brand.name}</div>
              <div style={S.brandMode}>{brand.canvasMode} · {brand.palette.mood}</div>
            </div>
            <div style={S.swatches}>
              <span style={{ ...S.sw, background: brand.accent }} title="accent" />
              <span style={{ ...S.sw, background: brand.palette.field, backgroundImage: brand.palette.field }} title="field" />
              {brand.voice.slice(0, 4).map((v) => <span key={v} style={S.chip}>{v}</span>)}
            </div>
          </section>
        )}

        {phase === "samples" && (
          <div style={S.grid}>
            {(brand?.sections ?? []).map((s) => (
              <div key={s.id} style={S.tileWrap}>
                <div style={S.tileHead}><span>{s.label}</span><span style={S.spin}>building…</span></div>
                <div style={S.skeleton} />
              </div>
            ))}
          </div>
        )}

        {(phase === "review" || phase === "confirming") && (
          <>
            <div style={S.grid}>
              {samples.map((s) => (
                <div key={s.id} style={S.tileWrap}>
                  <div style={S.tileHead}>
                    <span>{s.label}</span>
                    <button style={S.mini} onClick={() => regenerate(s.id)} disabled={busyId === s.id}>
                      {busyId === s.id ? "…" : "↻ regenerate"}
                    </button>
                  </div>
                  <Preview html={s.html} />
                </div>
              ))}
            </div>
            {cost && (
              <div style={S.cost}>
                {samples.length} sections · est. ${cost.usd.toFixed(2)} API cost · {cost.credits} credits
              </div>
            )}
            <div style={S.actions}>
              <button style={S.ghost} onClick={tweakBrand} disabled={phase === "confirming"}>Tweak brand</button>
              <button style={S.primary} onClick={confirm} disabled={phase === "confirming" || !samples.length}>
                {phase === "confirming" ? "Saving…" : "Confirm & train my agent →"}
              </button>
            </div>
          </>
        )}

        {phase === "done" && (
          <section style={S.card}>
            <div style={S.brandName}>Your agent is ready.</div>
            <p style={S.tag}>It knows {brand?.name}&apos;s design system — {brand?.canvasMode}, its palette, voice, and these sample sections. Next: the vibecoding workspace.</p>
          </section>
        )}

        {error && <div style={S.error}>{error}</div>}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#0b0c0f", color: "#e8e8ec", fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif", padding: "48px 24px 80px" },
  wrap: { maxWidth: 1120, margin: "0 auto" },
  head: { marginBottom: 28 },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" },
  tag: { color: "#9a9ca6", fontSize: 16, marginTop: 6 },
  card: { background: "#121319", border: "1px solid #23252b", borderRadius: 18, padding: 24, maxWidth: 640 },
  label: { display: "block", fontSize: 14, color: "#9a9ca6", marginBottom: 10 },
  textarea: { width: "100%", minHeight: 96, background: "#0b0c0f", border: "1px solid #2a2c34", borderRadius: 12, color: "#e8e8ec", padding: 14, fontSize: 16, resize: "vertical", outline: "none" },
  primary: { marginTop: 14, background: "#635bff", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  ghost: { background: "transparent", color: "#cfd0d6", border: "1px solid #2a2c34", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  brandBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "#121319", border: "1px solid #23252b", borderRadius: 14, padding: "16px 20px", marginBottom: 20 },
  brandName: { fontSize: 18, fontWeight: 700 },
  brandMode: { fontSize: 13, color: "#9a9ca6", marginTop: 2 },
  swatches: { display: "flex", alignItems: "center", gap: 8 },
  sw: { width: 22, height: 22, borderRadius: 6, border: "1px solid rgba(255,255,255,.15)", display: "inline-block" },
  chip: { fontSize: 12, color: "#cfd0d6", background: "#1c1e25", border: "1px solid #2a2c34", borderRadius: 999, padding: "4px 10px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 18 },
  tileWrap: { background: "#121319", border: "1px solid #23252b", borderRadius: 16, padding: 12 },
  tileHead: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#cfd0d6", padding: "2px 4px 10px", fontWeight: 600 },
  mini: { background: "transparent", color: "#9a9ca6", border: "1px solid #2a2c34", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" },
  spin: { color: "#7e80f0", fontSize: 12 },
  skeleton: { height: 300, borderRadius: 14, background: "linear-gradient(110deg,#15161c,#1b1d24,#15161c)" },
  cost: { textAlign: "center", color: "#9a9ca6", fontSize: 13, marginTop: 24 },
  actions: { display: "flex", justifyContent: "center", gap: 12, marginTop: 16 },
  error: { marginTop: 18, color: "#ff8a8a", fontSize: 14 },
};
