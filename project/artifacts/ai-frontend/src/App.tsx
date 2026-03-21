import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const s = {
  page: { fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" } as React.CSSProperties,
  divider: { border: "none", borderTop: "1px solid #e8e8e8", margin: "48px 0" } as React.CSSProperties,
  sectionTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4 } as React.CSSProperties,
  sectionSub: { color: "#666", fontSize: 14, marginBottom: 20 } as React.CSSProperties,
  box: { background: "#f7f7f7", borderRadius: 8, padding: "14px 18px", marginBottom: 20, fontSize: 13 } as React.CSSProperties,
  label: { color: "#888", fontSize: 12, marginBottom: 4, display: "block" } as React.CSSProperties,
  code: { fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", lineHeight: 1.6 } as React.CSSProperties,
  input: { width: "100%", boxSizing: "border-box", padding: "9px 13px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", background: "#fff" } as React.CSSProperties,
  textarea: { width: "100%", boxSizing: "border-box", padding: "9px 13px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", resize: "vertical" as const },
  row: { display: "flex", gap: 10, marginBottom: 12 } as React.CSSProperties,
  col: { flex: 1 } as React.CSSProperties,
  btn: (disabled: boolean) => ({ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }) as React.CSSProperties,
  tag: { display: "inline-block", background: "#efefef", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontFamily: "monospace", marginRight: 6 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { textAlign: "left" as const, padding: "6px 10px", background: "#f2f2f2", fontWeight: 600, borderBottom: "1px solid #e0e0e0" },
  td: { padding: "6px 10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "top" as const },
};

function ParamTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Param</th>
          <th style={s.th}>Default</th>
          <th style={s.th}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([p, d, desc]) => (
          <tr key={p}>
            <td style={s.td}><span style={s.tag}>{p}</span></td>
            <td style={s.td}><code style={{ fontFamily: "monospace" }}>{d}</code></td>
            <td style={s.td}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Text section ─────────────────────────────────────────────────────────────

function TextSection() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function run() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${BASE}/ai?prompt=${encodeURIComponent(prompt)}`);
      setResult(await res.text());
    } catch {
      setResult("Error reaching the endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 style={s.sectionTitle}>Text Generation  <span style={{ ...s.tag, fontSize: 11, verticalAlign: "middle" }}>GET /ai</span></h2>
      <p style={s.sectionSub}>Returns plain text from the Pollinations AI model.</p>

      <div style={s.box}>
        <span style={s.label}>Endpoint</span>
        <code style={s.code}>{origin}/ai?prompt=<span style={{ color: "#aaa" }}>your prompt</span></code>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ParamTable rows={[
          ["prompt", "say something cool", "The text prompt to send to the AI"],
        ]} />
      </div>

      <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>Try it:</p>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter a prompt…"
        rows={3}
        style={{ ...s.textarea, marginBottom: 10 }}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(); }}
      />
      <button onClick={run} disabled={loading || !prompt.trim()} style={s.btn(loading || !prompt.trim())}>
        {loading ? "Thinking…" : "Generate Text"}
      </button>

      {result && (
        <div style={{ marginTop: 20, background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 18px", whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 14 }}>
          {result}
        </div>
      )}
    </section>
  );
}

// ── Image section ─────────────────────────────────────────────────────────────

function ImageSection() {
  const [prompt, setPrompt] = useState("");
  const [width, setWidth] = useState("512");
  const [height, setHeight] = useState("512");
  const [model, setModel] = useState("flux");
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(false);
    setImgSrc("");
    const url = `${BASE}/image?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&model=${model}`;
    setImgSrc(url);
  }

  const aspectRatio = Number(width) / Number(height) || 1;

  return (
    <section>
      <h2 style={s.sectionTitle}>Image Generation  <span style={{ ...s.tag, fontSize: 11, verticalAlign: "middle" }}>GET /image</span></h2>
      <p style={s.sectionSub}>Redirects to a Pollinations AI generated image URL.</p>

      <div style={s.box}>
        <span style={s.label}>Endpoint</span>
        <code style={s.code}>
          {origin}/image?prompt=<span style={{ color: "#aaa" }}>your prompt</span>&amp;width=512&amp;height=512&amp;model=flux
        </code>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ParamTable rows={[
          ["prompt", "a beautiful landscape", "Description of the image to generate"],
          ["model",  "flux",  "Image model (e.g. flux, turbo)"],
          ["width",  "512",   "Output width in pixels"],
          ["height", "512",   "Output height in pixels"],
        ]} />
      </div>

      <p style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>Try it:</p>
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe an image…"
        style={{ ...s.input, marginBottom: 10 }}
        onKeyDown={e => { if (e.key === "Enter") generate(); }}
      />

      <div style={s.row}>
        <div style={s.col}>
          <span style={s.label}>Width</span>
          <input value={width} onChange={e => setWidth(e.target.value)} style={s.input} type="number" min="64" max="1920" />
        </div>
        <div style={s.col}>
          <span style={s.label}>Height</span>
          <input value={height} onChange={e => setHeight(e.target.value)} style={s.input} type="number" min="64" max="1920" />
        </div>
        <div style={s.col}>
          <span style={s.label}>Model</span>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ ...s.input }}>
            <option value="flux">flux</option>
            <option value="turbo">turbo</option>
            <option value="flux-realism">flux-realism</option>
            <option value="flux-anime">flux-anime</option>
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading || !prompt.trim()} style={s.btn(loading || !prompt.trim())}>
        {loading ? "Generating…" : "Generate Image"}
      </button>

      {imgSrc && (
        <div style={{ marginTop: 20 }}>
          {/* Skeleton placeholder — same aspect ratio as the requested image */}
          {loading && !error && (
            <div style={{
              width: "100%",
              maxWidth: Number(width),
              aspectRatio: String(aspectRatio),
              borderRadius: 10,
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontSize: 13,
            }}>
              Generating image…
            </div>
          )}

          {error && (
            <div style={{ color: "#c00", fontSize: 13, marginBottom: 8 }}>
              Failed to load image. Try again.
            </div>
          )}

          {/* Image is rendered but hidden until fully loaded */}
          <img
            src={imgSrc}
            alt={prompt}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            style={{
              maxWidth: "100%",
              borderRadius: 10,
              border: "1px solid #e8e8e8",
              display: loading || error ? "none" : "block",
            }}
          />

          {!loading && !error && (
            <a href={imgSrc} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: "#888", marginTop: 8, display: "inline-block" }}>
              Open image URL ↗
            </a>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const downloadUrl = `${BASE}/download`;

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Pollinations API</h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Two simple endpoints for AI text and image generation, ready for Snap Lens Studio.
        </p>
      </div>

      <TextSection />
      <hr style={s.divider} />
      <ImageSection />

      <hr style={s.divider} />
      <div style={{ textAlign: "center" as const, paddingBottom: 16 }}>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
          Want to run this yourself or deploy it elsewhere?
        </p>
        <a
          href={downloadUrl}
          download="project.zip"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#111", color: "#fff", textDecoration: "none",
            borderRadius: 8, padding: "11px 26px", fontSize: 15, fontWeight: 600,
          }}
        >
          ⬇ Download Project as ZIP
        </a>
      </div>
    </div>
  );
}
