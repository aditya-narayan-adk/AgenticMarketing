from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
import uuid
import json
from datetime import datetime

app = FastAPI(title="ProtocolAI Onboarding API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store (replace with Supabase in production) ─────────────────
tenants_db: dict = {}


# ── Enums ──────────────────────────────────────────────────────────────────
class Industry(str, Enum):
    healthcare    = "healthcare"
    finance       = "finance"
    legal         = "legal"
    real_estate   = "real_estate"
    ecommerce     = "ecommerce"
    saas          = "saas"
    education     = "education"
    other         = "other"

class AgentModule(str, Enum):
    website  = "website"
    ads      = "ads"
    chatbot  = "chatbot"
    voice    = "voice"

class Tone(str, Enum):
    professional = "professional"
    friendly     = "friendly"
    authoritative= "authoritative"
    conversational = "conversational"


# ── Schemas ────────────────────────────────────────────────────────────────
class CompanyVitals(BaseModel):
    company_name: str
    industry: Industry
    website_url: Optional[str] = None
    description: str                      # what the company does
    target_audience: str
    brand_tone: Tone
    primary_color: Optional[str] = "#1A56DB"

class ContactInfo(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: str
    phone: Optional[str] = None

class ModuleSelection(BaseModel):
    modules: List[AgentModule]
    compliance_notes: Optional[str] = None   # e.g. HIPAA, GDPR flags

class OnboardingPayload(BaseModel):
    company: CompanyVitals
    contact: ContactInfo
    modules: ModuleSelection

class TenantResponse(BaseModel):
    tenant_id: str
    company_name: str
    modules: List[str]
    dashboard_url: str
    created_at: str
    status: str


# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"service": "ProtocolAI Onboarding API", "version": "0.1.0", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy", "tenants": len(tenants_db)}


@app.post("/onboarding/submit", response_model=TenantResponse)
def submit_onboarding(payload: OnboardingPayload):
    """
    Main onboarding endpoint.
    Validates company vitals, creates tenant record,
    and queues skill.md initialization (stub in prototype).
    """
    tenant_id = f"tenant_{uuid.uuid4().hex[:8]}"

    tenant = {
        "tenant_id": tenant_id,
        "company_name": payload.company.company_name,
        "industry": payload.company.industry,
        "description": payload.company.description,
        "target_audience": payload.company.target_audience,
        "brand_tone": payload.company.brand_tone,
        "primary_color": payload.company.primary_color,
        "contact_email": payload.contact.email,
        "contact_name": f"{payload.contact.first_name} {payload.contact.last_name}",
        "modules": [m.value for m in payload.modules.modules],
        "compliance_notes": payload.modules.compliance_notes,
        "created_at": datetime.utcnow().isoformat(),
        "status": "provisioning",
    }

    tenants_db[tenant_id] = tenant

    # TODO: Queue skill.md initialization job via Celery
    # celery_app.send_task("tasks.init_skills", args=[tenant_id, tenant])

    return TenantResponse(
        tenant_id=tenant_id,
        company_name=payload.company.company_name,
        modules=[m.value for m in payload.modules.modules],
        dashboard_url=f"/dashboard/{tenant_id}",
        created_at=tenant["created_at"],
        status="provisioning",
    )


@app.get("/onboarding/tenant/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: str):
    if tenant_id not in tenants_db:
        raise HTTPException(status_code=404, detail="Tenant not found")
    t = tenants_db[tenant_id]
    return TenantResponse(
        tenant_id=t["tenant_id"],
        company_name=t["company_name"],
        modules=t["modules"],
        dashboard_url=f"/dashboard/{t['tenant_id']}",
        created_at=t["created_at"],
        status=t["status"],
    )


@app.get("/onboarding/industries")
def get_industries():
    return [{"value": i.value, "label": i.value.replace("_", " ").title()} for i in Industry]


@app.get("/onboarding/modules")
def get_modules():
    descriptions = {
        "website":  "AI-generated landing pages deployed automatically",
        "ads":      "Campaign creatives — banners, social, print-ready PDFs",
        "chatbot":  "Audience chatbot trained on your protocol documents",
        "voice":    "ElevenLabs AI voice agent for outbound & inbound calls",
    }
    return [{"value": m.value, "label": m.value.title(), "description": descriptions[m.value]} for m in AgentModule]


# ── Dev entrypoint ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
