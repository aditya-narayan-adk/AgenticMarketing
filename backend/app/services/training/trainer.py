"""
M4: Training Service (Training RAG)
Owner: AI Dev
Dependencies: M1, Skill Templates

Reads skill.md templates for Curator and Reviewer,
fills placeholders with company-specific data from onboarding,
and stores the customized skills.

Three-step process per the PDF:
1. Read the skill.md for curator and reviewer to identify placeholders
2. Read specific inputs from the onboarding screen to fill placeholders
3. Overwrite demo templates with industry-specific instructions
"""

import os
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import Company, CompanyDocument, SkillConfig, DocumentType
from app.schemas.schemas import TrainingStatus

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "skills", "templates")


class TrainingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def train_company_skills(self, company_id: str) -> TrainingStatus:
        """
        Full training pipeline:
        1. Load skill templates
        2. Gather company documents
        3. Extract placeholder values
        4. Generate customized SKILL.md for Curator + Reviewer
        5. Store in DB
        """
        # Load company
        company = await self._get_company(company_id)
        
        # Gather company documents by type
        docs = await self._gather_documents(company_id)

        # Build replacement map from company data
        replacements = self._build_replacements(company, docs)

        # Process Curator template
        curator_md = self._fill_template("curator_template.md", replacements)
        await self._save_skill(company_id, "curator", curator_md)

        # Process Reviewer template
        reviewer_md = self._fill_template("reviewer_template.md", replacements)
        await self._save_skill(company_id, "reviewer", reviewer_md)

        return TrainingStatus(
            company_id=company_id,
            curator_ready=True,
            reviewer_ready=True,
            skill_versions={"curator": 1, "reviewer": 1},
        )

    def _fill_template(self, template_name: str, replacements: dict) -> str:
        """Read template file and replace all {{PLACEHOLDER}} tokens."""
        template_path = os.path.join(TEMPLATE_DIR, template_name)
        with open(template_path, "r") as f:
            content = f.read()

        for key, value in replacements.items():
            content = content.replace(f"{{{{{key}}}}}", value or "N/A")

        # Clear any remaining unfilled placeholders
        content = re.sub(r"\{\{[A-Z_]+\}\}", "[Not configured]", content)
        return content

    def _build_replacements(self, company, docs: dict) -> dict:
        """Map placeholder names to company-specific values."""
        slug = company.name.lower().replace(" ", "-").replace("'", "")

        return {
            "COMPANY_NAME": company.name,
            "COMPANY_SLUG": slug,
            "INDUSTRY": company.industry or "General",
            "USP_SUMMARY": self._concat_docs(docs.get(DocumentType.USP, [])),
            "MARKETING_GOALS": self._concat_docs(docs.get(DocumentType.MARKETING_GOAL, [])),
            "COMPLIANCE_NOTES": self._concat_docs(docs.get(DocumentType.COMPLIANCE, [])),
            "ETHICAL_GUIDELINES": self._concat_docs(docs.get(DocumentType.ETHICAL_GUIDELINE, [])),
            "QUALITY_STANDARDS": self._concat_docs(docs.get(DocumentType.POLICY, [])),
            "LESSONS_LEARNED": "[No lessons yet — this section is appended by the Reinforcement Learning module]",
        }

    def _concat_docs(self, docs: list) -> str:
        """Concatenate document contents for a given type."""
        if not docs:
            return "N/A"
        return "\n\n".join(
            f"### {d.title}\n{d.content or '[File uploaded — see path: ' + str(d.file_path) + ']'}"
            for d in docs
        )

    async def _get_company(self, company_id: str):
        result = await self.db.execute(
            select(Company).where(Company.id == company_id)
        )
        company = result.scalar_one_or_none()
        if not company:
            raise ValueError(f"Company {company_id} not found")
        return company

    async def _gather_documents(self, company_id: str) -> dict:
        """Group company documents by type."""
        result = await self.db.execute(
            select(CompanyDocument).where(CompanyDocument.company_id == company_id)
        )
        docs = result.scalars().all()
        grouped = {}
        for doc in docs:
            grouped.setdefault(doc.doc_type, []).append(doc)
        return grouped

    async def _save_skill(self, company_id: str, skill_type: str, content: str):
        """Save or update skill configuration."""
        result = await self.db.execute(
            select(SkillConfig).where(
                SkillConfig.company_id == company_id,
                SkillConfig.skill_type == skill_type,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.skill_md = content
            existing.version += 1
        else:
            skill = SkillConfig(
                company_id=company_id,
                skill_type=skill_type,
                skill_md=content,
            )
            self.db.add(skill)
