import { useState } from "react";

const API = "http://localhost:8000";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#F7F6F2",
  surface: "#FFFFFF",
  ink:     "#111827",
  muted:   "#6B7280",
  border:  "#E5E3DC",
  accent:  "#0F3DDE",
  accentL: "#EEF2FF",
  success: "#059669",
  successL:"#ECFDF5",
  error:   "#DC2626",
};

const INDUSTRIES = [
  { value: "healthcare",   label: "Healthcare",     icon: "◎" },
  { value: "finance",      label: "Finance",        icon: "◈" },
  { value: "legal",        label: "Legal",          icon: "◇" },
  { value: "real_estate",  label: "Real Estate",    icon: "⬡" },
  { value: "ecommerce",    label: "E-Commerce",     icon: "✦" },
  { value: "saas",         label: "SaaS",           icon: "◉" },
  { value: "education",    label: "Education",      icon: "◆" },
  { value: "other",        label: "Other",          icon: "○" },
];

const TONES = [
  { value: "professional",    label: "Professional",     desc: "Polished, formal, trust-first" },
  { value: "friendly",        label: "Friendly",         desc: "Warm, approachable, human" },
  { value: "authoritative",   label: "Authoritative",    desc: "Expert, confident, bold" },
  { value: "conversational",  label: "Conversational",   desc: "Casual, direct, plain-speak" },
];

const MODULES = [
  { value: "website",  label: "Website Agent",  icon: "⬡", desc: "AI-generated landing pages, auto-deployed" },
  { value: "ads",      label: "Ads Agent",      icon: "✦", desc: "Banners, social creatives, PDF print assets" },
  { value: "chatbot",  label: "Chatbot Agent",  icon: "◈", desc: "Audience chatbot trained on your documents" },
  { value: "voice",    label: "Voice Agent",    icon: "◎", desc: "ElevenLabs AI calls — outbound & inbound" },
];

const STEPS = ["Company", "Contact", "Modules", "Review"];

// ── Tiny components ────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}{required && <span style={{ color: C.accent }}> *</span>}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", fontSize: 14,
          border: `1.5px solid ${focused ? C.accent : C.border}`,
          borderRadius: 8, outline: "none", background: C.surface,
          color: C.ink, fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}{required && <span style={{ color: C.accent }}> *</span>}</Label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", fontSize: 14, resize: "vertical",
          border: `1.5px solid ${focused ? C.accent : C.border}`,
          borderRadius: 8, outline: "none", background: C.surface,
          color: C.ink, fontFamily: "inherit", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

function SelectCard({ value, selected, onClick, children }) {
  return (
    <div
      onClick={() => onClick(value)}
      style={{
        border: `1.5px solid ${selected ? C.accent : C.border}`,
        borderRadius: 10, padding: "14px 16px", cursor: "pointer",
        background: selected ? C.accentL : C.surface,
        transition: "all 0.15s",
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", loading }) {
  const styles = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    ghost:   { background: "transparent", color: C.muted, border: `1.5px solid ${C.border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant], padding: "12px 28px", borderRadius: 8,
        fontSize: 14, fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

// ── Step views ─────────────────────────────────────────────────────────────
function StepCompany({ data, set }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Tell us about your company</div>
        <div style={{ fontSize: 14, color: C.muted }}>This initializes your AI agents with company-specific context.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Input label="Company Name" value={data.company_name} onChange={v => set("company_name", v)} placeholder="Acme Corp" required />
        <Input label="Website URL" value={data.website_url} onChange={v => set("website_url", v)} placeholder="https://acme.com" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Label>Industry <span style={{ color: C.accent }}>*</span></Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {INDUSTRIES.map(ind => (
            <SelectCard key={ind.value} value={ind.value} selected={data.industry === ind.value} onClick={v => set("industry", v)}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ind.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: data.industry === ind.value ? C.accent : C.ink }}>{ind.label}</div>
            </SelectCard>
          ))}
        </div>
      </div>

      <Textarea label="What does your company do?" value={data.description} onChange={v => set("description", v)}
        placeholder="Describe your product or service, what problems you solve, and who you help…" rows={3} required />

      <Textarea label="Target Audience" value={data.target_audience} onChange={v => set("target_audience", v)}
        placeholder="e.g. Adults aged 35–60 with Type 2 diabetes, located in the US, looking for clinical trial options…" rows={2} required />

      <div style={{ marginBottom: 20 }}>
        <Label>Brand Tone <span style={{ color: C.accent }}>*</span></Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {TONES.map(t => (
            <SelectCard key={t.value} value={t.value} selected={data.brand_tone === t.value} onClick={v => set("brand_tone", v)}>
              <div style={{ fontSize: 13, fontWeight: 600, color: data.brand_tone === t.value ? C.accent : C.ink, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
            </SelectCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepContact({ data, set }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Your contact details</div>
        <div style={{ fontSize: 14, color: C.muted }}>We'll use this to set up your account and send your dashboard link.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Input label="First Name" value={data.first_name} onChange={v => set("first_name", v)} placeholder="Jane" required />
        <Input label="Last Name" value={data.last_name} onChange={v => set("last_name", v)} placeholder="Smith" required />
      </div>
      <Input label="Work Email" type="email" value={data.email} onChange={v => set("email", v)} placeholder="jane@acme.com" required />
      <Input label="Your Role" value={data.role} onChange={v => set("role", v)} placeholder="e.g. Head of Marketing, CTO, Founder" required />
      <Input label="Phone (optional)" type="tel" value={data.phone} onChange={v => set("phone", v)} placeholder="+1 (555) 000-0000" />
    </div>
  );
}

function StepModules({ data, set }) {
  const toggle = (val) => {
    const curr = data.modules || [];
    set("modules", curr.includes(val) ? curr.filter(m => m !== val) : [...curr, val]);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Choose your AI agents</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select the modules you want active. You can add more later.</div>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {MODULES.map(m => {
          const selected = (data.modules || []).includes(m.value);
          return (
            <div
              key={m.value}
              onClick={() => toggle(m.value)}
              style={{
                border: `1.5px solid ${selected ? C.accent : C.border}`,
                borderRadius: 10, padding: "16px 20px", cursor: "pointer",
                background: selected ? C.accentL : C.surface,
                display: "flex", alignItems: "center", gap: 16,
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 26, width: 36, textAlign: "center" }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selected ? C.accent : C.ink, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{m.desc}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${selected ? C.accent : C.border}`,
                background: selected ? C.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          );
        })}
      </div>

      <Textarea label="Compliance notes (optional)" value={data.compliance_notes}
        onChange={v => set("compliance_notes", v)} rows={2}
        placeholder="e.g. HIPAA required, GDPR applies, no claims about outcomes…" />
    </div>
  );
}

function StepReview({ company, contact, modules }) {
  const Row = ({ label, value }) => value ? (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, color: C.muted, width: 140, flexShrink: 0, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.ink }}>{value}</div>
    </div>
  ) : null;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Review & submit</div>
        <div style={{ fontSize: 14, color: C.muted }}>Double-check everything before we provision your workspace.</div>
      </div>

      <div style={{ background: C.bg, borderRadius: 12, padding: 24, marginBottom: 8 }}>
        <Section title="Company">
          <Row label="Name" value={company.company_name} />
          <Row label="Industry" value={INDUSTRIES.find(i => i.value === company.industry)?.label} />
          <Row label="Website" value={company.website_url} />
          <Row label="Description" value={company.description} />
          <Row label="Target Audience" value={company.target_audience} />
          <Row label="Brand Tone" value={TONES.find(t => t.value === company.brand_tone)?.label} />
        </Section>
        <Section title="Contact">
          <Row label="Name" value={`${contact.first_name} ${contact.last_name}`} />
          <Row label="Email" value={contact.email} />
          <Row label="Role" value={contact.role} />
          <Row label="Phone" value={contact.phone} />
        </Section>
        <Section title="Modules">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {(modules.modules || []).map(m => (
              <span key={m} style={{ background: C.accentL, color: C.accent, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
                {MODULES.find(mod => mod.value === m)?.label}
              </span>
            ))}
          </div>
          {modules.compliance_notes && <Row label="Compliance" value={modules.compliance_notes} />}
        </Section>
      </div>
    </div>
  );
}

function SuccessScreen({ result }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 8 }}>You're all set, {result.company_name}!</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
        Your workspace is being provisioned. Your AI agents will be ready shortly.
      </div>
      <div style={{ background: C.bg, borderRadius: 12, padding: 20, display: "inline-block", marginBottom: 28, textAlign: "left", minWidth: 320 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>Your Details</div>
        {[
          ["Tenant ID", result.tenant_id],
          ["Status", result.status],
          ["Dashboard", result.dashboard_url],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, gap: 24 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
            <span style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {result.modules.map(m => (
          <span key={m} style={{ background: C.successL, color: C.success, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
            ✓ {m.charAt(0).toUpperCase() + m.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main app ───────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [company, setCompany] = useState({
    company_name: "", industry: "", website_url: "",
    description: "", target_audience: "", brand_tone: "", primary_color: "#0F3DDE",
  });
  const [contact, setContact] = useState({
    first_name: "", last_name: "", email: "", role: "", phone: "",
  });
  const [modules, setModules] = useState({ modules: [], compliance_notes: "" });

  const setC = (k, v) => setCompany(p => ({ ...p, [k]: v }));
  const setCo = (k, v) => setContact(p => ({ ...p, [k]: v }));
  const setM = (k, v) => setModules(p => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return company.company_name && company.industry && company.description && company.target_audience && company.brand_tone;
    if (step === 1) return contact.first_name && contact.last_name && contact.email && contact.role;
    if (step === 2) return (modules.modules || []).length > 0;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/onboarding/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, contact, modules }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Submission failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = result ? 100 : ((step) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { opacity: 0.85; }
        input::placeholder, textarea::placeholder { color: #9CA3AF; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "3px", color: C.accent, marginBottom: 4 }}>PROTOCOLAI</div>
        <div style={{ fontSize: 13, color: C.muted }}>Multi-Agent Platform — Company Onboarding</div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 620, margin: "0 auto", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: C.border }}>
          <div style={{ height: "100%", background: C.accent, width: `${progress}%`, transition: "width 0.4s ease" }} />
        </div>

        {/* Step indicator */}
        {!result && (
          <div style={{ padding: "20px 32px 0", display: "flex", gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: i < step ? C.accent : i === step ? C.accent : C.bg,
                    color: i <= step ? "#fff" : C.muted,
                    border: `2px solid ${i <= step ? C.accent : C.border}`,
                    flexShrink: 0,
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? C.ink : C.muted, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: C.border, margin: "0 10px" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          {result ? (
            <SuccessScreen result={result} />
          ) : (
            <>
              {step === 0 && <StepCompany data={company} set={setC} />}
              {step === 1 && <StepContact data={contact} set={setCo} />}
              {step === 2 && <StepModules data={modules} set={setM} />}
              {step === 3 && <StepReview company={company} contact={contact} modules={modules} />}

              {error && (
                <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: C.error, borderRadius: 8, padding: "12px 16px", fontSize: 13, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <Btn variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                  ← Back
                </Btn>
                {step < STEPS.length - 1 ? (
                  <Btn onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                    Continue →
                  </Btn>
                ) : (
                  <Btn onClick={submit} loading={loading} disabled={!canNext()}>
                    Launch My Workspace →
                  </Btn>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.muted }}>
        Your data is used only to configure your AI agents. Nothing is shared.
      </div>
    </div>
  );
}
