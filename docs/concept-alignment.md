# Ad Astra 6 concept note and prototype alignment

Reviewed source: the user-supplied **Ad Astra 6_Concept Note_PSCXI_Template.docx**, three pages, Philippine Startup Challenge XI. The document's title page still contains TEAM NAME and STARTUP NAME placeholders; fill these before submission. This implementation does not modify the source document.

CaDeT can now demonstrate structured ambition capture and a saved learning-action loop. It is not yet the full AI-powered SaaS and community ecosystem proposed in the note. The prototype must be pitched with those limits stated explicitly.

## What is demonstrable

| Concept-note requirement | Current implementation | Remaining gap |
| --- | --- | --- |
| Target role and current skill baseline | Six-step AIM setup: status, experience, field, specialization, role, outcome, values, environment, skills, time and support preferences | Taxonomy and skill suggestions require validation with learners and domain experts |
| Personalized modular learning path | Four persisted learning tasks based on role/exploration, skill baseline, weekly capacity, format and milestone | Deterministic rules; not an AI provider, accredited curriculum or labor-market model |
| Relevant resources and challenges | Curated source directories selected by field/specialization, a practice task and the learner's observable milestone | No automated aggregation or live course ranking; external learning requires connectivity |
| Progress and gamification | Tasks, recorded project evidence, readiness history and a self-reported plan-completion milestone | No independent evidence verification or issued digital credentials |
| Local community integration and peer accountability | School/city and support preferences; personalized discovery guidance and public technology community directory | No verified partner directory, shared groups, automatic introductions, messaging or peer review service |
| Primary student and graduate users | Eight fields, dependent selections, Other and exploration paths; optional no-skill baseline | Scored Career Map remains example profiles across several fields and labels unsupported roles explicitly |
| AI mentorship | Existing server AI routes remain placeholders; the new plan clearly says rule-based | Implement and evaluate a real authenticated provider, structured output validation and failure handling |
| SaaS accounts and centralized records | Existing salted password hashing and separate local account profiles; IndexedDB records and backups | Device-local gate only, not cloud authentication; no recovery or cross-device sync |
| Free, premium and enterprise tiers | Core local prototype | Billing, paid entitlements, resume generation, organization portals and recruitment remain future scope |

## AIM design and data behavior

1. **Starting point:** student/professional status and experience bands, including Other.
2. **Direction:** field → specialization → role. Parent changes clear dependent selections. Custom answers retain `id: other` and separate text. Exploration remains explicit rather than assigning a random role.
3. **Outcome:** purpose, value, preferred environment, observable output, and 2/4/8/12-week horizon.
4. **Baseline:** up to eight optional skills, each with a category and self-assessed level. Ratings map to 25/50/75/100 confidence and zero evidence. Existing skills are preserved when AIM is revisited.
5. **Capacity and support:** weekly hours, learning format, campus/online/mentor/independent support, optional organization and city. No address or automatic data sharing.
6. **Review:** show the proposed actions before saving. Save goals, target, tasks, AIM plan, event, ACTOR initialization and onboarding completion in one IndexedDB transaction. A failure rolls back all writes.

Plans are versioned records in `aim_plans`; the most recently created plan is displayed. Repeated identical submissions do not create duplicate work. A revised plan creates new tasks and an active target while preserving old tasks and evidence. Generated AIM goals use stable per-account IDs. Later ACTOR stage progress is preserved. Reopening AIM reads the latest saved answers; unfinished form edits are not autosaved.

No project evidence, completed experiments, jobs, partners or membership claims are fabricated. Clarity fields reflect input completeness (role, field, skill baseline, experience) with evidence clarity at zero; they do not measure competence. New users move from AIM to COMPRESS to review/refine their target, not directly to TEST.

AIM plans join career backups. Original version-1 backups without `aim_plans` remain accepted. Password credentials and profile settings remain excluded. Imported plan task references stay linked to imported career records; all restored rows belong to the destination account. The existing importer rejects collisions with another local account's IDs.

## Pitch walkthrough

1. Create a local demo account. Explain that it is device-local and requires sign-in after refresh.
2. Pick **Working student → Business → Marketing & sales → Digital Marketer**. Alternatively demonstrate **Other** and **Not sure yet**.
3. Choose a portfolio outcome, a value, a work preference and an output such as “Write three campaign briefs and document reviewer feedback” over four weeks.
4. Add Communication as a beginner Soft skill, or continue without baseline skills. Choose five hours/week and a campus organization preference.
5. Review and save. Show the six categorized goals in ACTOR AIM and the four pending modules in My learning plan.
6. Complete an action. Show persisted task progress. Add a completed project with evidence through Records to demonstrate the separate evidence workflow.
7. Open relevant resource links and support guidance. State that CaDeT has not joined or contacted any group for the learner.
8. Open Developer Options for the document-alignment audit. Demonstrate the catalogue-based Career Map separately, without calling it a prediction for every industry.

## Document and launch work still needed

The document proposes a **PHP 500,000–750,000** seed requirement allocated 40% development, 30% marketing/acquisition, 20% operations, and 10% contingency. These are supplied estimates, not verified costs. Add quotations, assumptions and accountable owners.

Preserve the primary market in the note: Philippine undergraduates, working students and recent graduates. Organizations and departments are secondary users; employers and industry partners are tertiary. Do not silently narrow the concept to Computer Science students.

Before Phase 2, validate onboarding usability, taxonomy coverage, resource relevance, useful-plan creation time, task completion and recorded evidence with consenting pilot learners. Agree on targets and sample size with the team; no metrics or partnerships are assumed. Validate the need, market-size claims, pricing and competitive claims with sources. Before offering the described SaaS, finish cloud accounts/sync, real AI evaluation and the verified community service.

## Public resource sources

Curated links checked on 2026-09-18: [MDN learning](https://developer.mozilla.org/en-US/docs/Learn_web_development), [IBM SkillsBuild](https://skillsbuild.org/), [official TESDA Online Program information](https://sites.google.com/tesda.gov.ph/tesda-online-program/home), [OpenLearn catalogue](https://www.open.edu/openlearn/free-courses/full-catalogue), and [Google Developer Groups directory](https://gdg.community.dev/). Directory access does not establish partnership, membership, nearby availability or suitability for a particular learner.
