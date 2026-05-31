"use client";

import { useCallback, useEffect, useState } from "react";

type Sample = { id: string; label: string; html: string };
type Brand = { id: string; name: string; artDirection: string; canvasMode: string; accent: string; palette: { mood: string; field: string }; voice: string[]; tier?: string };
type ProjectMeta = { id: string; name: string; createdAt: string };
type Project = { brand: Brand; samples: Sample[] };

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`(${r.status})`);
  return r.json();
}
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `(${r.status})`);
  return r.json();
}

function Preview({ html }: { html: string }) {
  return (
    <div style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: 14, border: "1px solid #23252b", background: "#fff" }}>
      <iframe srcDoc={html} title="preview" sandbox="" scrolling="no"
        style={{ width: 1280, height: 900, border: "none", transform: "scale(0.5)", transformOrigin: "top left", pointerEvents: "none" }} />
    </div>
  );
}

export default function Projects() {
  const [list, setList] = useState<ProjectMeta[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [addBrief, setAddBrief] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJSON<{ projects: ProjectMeta[] }>("/api/projects").then((d) => setList(d.projects)).catch(() => {});
  }, []);

  const open = useCallback(async (id: string) => {
    setError(null);
    try { setProject(await getJSON<Project>(`/api/projects?id=${encodeURIComponent(id)}`)); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }, []);

  const persist = useCallback(async (p: Project) => {
    await postJSON("/api/projects", { brand: p.brand, samples: p.samples }).catch(() => {});
  }, []);

  const addSection = useCallback(async () => {
    if (!project || !addBrief.trim()) return;
    setBusy("add");
    setError(null);
    try {
      const { samples } = await postJSON<{ samples: Sample[] }>("/api/samples", { brand: project.brand, addBrief });
      if (samples[0]) {
        const next = { ...project, samples: [...project.samples, samples[0]] };
        setProject(next);
        setAddBrief("");
        await persist(next);
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  }, [project, addBrief, persist]);

  const regenerate = useCallback(async (id: string) => {
    if (!project) return;
    setBusy(id);
    try {
      const { samples } = await postJSON<{ samples: Sample[] }>("/api/samples", { brand: project.brand, only: id });
      if (samples[0]) {
        const next = { ...project, samples: project.samples.map((s) => (s.id === id ? samples[0] : s)) };
        setProject(next);
        await persist(next);
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  }, [project, persist]);

  return (
    <main style={S.main}>
      <div style={S.wrap}>
        <header style={S.head}>
          <div style={S.logo}>Carle · Agents</div>
          {project && <button style={S.ghost} onClick={() => setProject(null)}>← All agents</button>}
        </header>

        {!project && (
          <>
            <div style={S.tag}>Your trained agents. Reopen one to keep building in its design language.</div>
            <div style={S.grid}>
              {list.map((p) => (
                <button key={p.id} style={S.card} onClick={() => open(p.id)}>
                  <div style={S.brandName}>{p.name}</div>
                  <div style={S.meta}>{new Date(p.createdAt).toLocaleDateString()}</div>
                </button>
              ))}
              {!list.length && <div style={S.tag}>No agents yet — create one in <a href="/onboard" style={{ color: "#7e80f0" }}>/onboard</a>.</div>}
            </div>
          </>
        )}

        {project && (
          <>
            <div style={S.brandBar}>
              <div>
                <div style={S.brandName}>{project.brand.name}</div>
                <div style={S.meta}>{project.brand.artDirection} · {project.brand.palette.mood}</div>
              </div>
              <div style={S.swatches}>
                <span style={{ ...S.sw, background: project.brand.accent }} />
                {project.brand.voice.slice(0, 4).map((v) => <span key={v} style={S.chip}>{v}</span>)}
              </div>
            </div>

            <div style={S.addRow}>
              <input style={S.input} placeholder="Add a section in this brand — e.g. 'an FAQ section' or 'a testimonials wall'"
                value={addBrief} onChange={(e) => setAddBrief(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSection()} disabled={busy === "add"} />
              <button style={{ ...S.primary, opacity: busy === "add" || !addBrief.trim() ? 0.5 : 1 }}
                onClick={addSection} disabled={busy === "add" || !addBrief.trim()}>
                {busy === "add" ? "Building…" : "Build section →"}
              </button>
            </div>

            <div style={S.grid}>
              {project.samples.map((s) => (
                <div key={s.id} style={S.tileWrap}>
                  <div style={S.tileHead}>
                    <span>{s.label}</span>
                    <button style={S.mini} onClick={() => regenerate(s.id)} disabled={busy === s.id}>{busy === s.id ? "…" : "↻"}</button>
                  </div>
                  <Preview html={s.html} />
                </div>
              ))}
            </div>
          </>
        )}

        {error && <div style={S.error}>{error}</div>}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#0b0c0f", color: "#e8e8ec", fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif", padding: "40px 24px 80px" },
  wrap: { maxWidth: 1120, margin: "0 auto" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  logo: { fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" },
  tag: { color: "#9a9ca6", fontSize: 15, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 18 },
  card: { textAlign: "left", background: "#121319", border: "1px solid #23252b", borderRadius: 16, padding: 20, cursor: "pointer", color: "#e8e8ec" },
  brandName: { fontSize: 18, fontWeight: 700 },
  meta: { fontSize: 13, color: "#9a9ca6", marginTop: 4 },
  brandBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "#121319", border: "1px solid #23252b", borderRadius: 14, padding: "16px 20px", marginBottom: 16 },
  swatches: { display: "flex", alignItems: "center", gap: 8 },
  sw: { width: 22, height: 22, borderRadius: 6, border: "1px solid rgba(255,255,255,.15)", display: "inline-block" },
  chip: { fontSize: 12, color: "#cfd0d6", background: "#1c1e25", border: "1px solid #2a2c34", borderRadius: 999, padding: "4px 10px" },
  addRow: { display: "flex", gap: 10, marginBottom: 22 },
  input: { flex: 1, background: "#0b0c0f", border: "1px solid #2a2c34", borderRadius: 10, color: "#e8e8ec", padding: "12px 14px", fontSize: 15, outline: "none" },
  primary: { background: "#635bff", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  ghost: { background: "transparent", color: "#cfd0d6", border: "1px solid #2a2c34", borderRadius: 10, padding: "8px 14px", fontSize: 14, cursor: "pointer" },
  tileWrap: { background: "#121319", border: "1px solid #23252b", borderRadius: 16, padding: 12 },
  tileHead: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#cfd0d6", padding: "2px 4px 10px", fontWeight: 600 },
  mini: { background: "transparent", color: "#9a9ca6", border: "1px solid #2a2c34", borderRadius: 8, padding: "3px 9px", fontSize: 12, cursor: "pointer" },
  error: { marginTop: 18, color: "#ff8a8a", fontSize: 14 },
};
