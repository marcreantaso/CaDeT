import { useState } from "react";
import { Link } from "react-router-dom";
const steps = [
  [
    "Aim: choose a direction",
    "Choose status → field → specialization → role → outcome. Other preserves custom answers; Not sure yet supports exploration. Review baseline skills, weekly time and support preferences.",
    "/aim",
  ],
  [
    "Compress: define an outcome",
    "Save a measurable output and timeline. The learning plan creates four real pending tasks, displays relevant resource directories and explains how the plan was chosen.",
    "/learning-plan",
  ],
  [
    "Explore the Career Map",
    "Compare recorded skills, projects, experience, ACTOR progress, and intent with example career profiles across several fields. Explain each weighted contribution.",
    "/career-map",
  ],
  [
    "Simulate a possibility",
    "Select a skill or proof project. The simulated score changes in memory; real skill and project records stay unchanged.",
    "/career-map",
  ],
  [
    "Test: create an experiment",
    "Convert selected changes into a 14-day experiment and pending evidence tasks. This is a plan, not proof of completion.",
    "/records?kind=experiment",
  ],
  [
    "Own: record actual evidence",
    "Add a completed project with evidence and list its skills. Matching skill evidence updates. Record experiment ratings and reflection.",
    "/records?kind=project",
  ],
  [
    "Run, observe, repeat",
    "Complete tasks, inspect readiness history, and reconsider the next action. The current MVP still requires users to enter and assess their own evidence.",
    "/journey",
  ],
];
const requirements = [
  [
    "I. Summary",
    "Prototype partly aligned",
    "The supplied Ad Astra 6 concept note proposes AI mentorship, personalized learning paths, community integration and progress tracking. AIM now creates a rule-based plan with resources and tasks; live AI and a shared community service remain unimplemented.",
  ],
  [
    "II. Background of the problem",
    "Stated problem; validation needed",
    "The note identifies skills gaps, choice paralysis and isolated learning. Validate these with learner interviews and pilot results; the document does not provide measured evidence.",
  ],
  [
    "III. Proposed startup solution",
    "Local prototype implemented; services pending",
    "Categorized baseline → role and goal → modular action plan → resources → recorded evidence. Community preferences produce discovery guidance, not confirmed matches. SDG 4 and SDG 8 are intended alignments, not measured impact.",
  ],
  [
    "IV. Objectives",
    "Pilot measures needed",
    "The note aims for centralized upskilling, university/group partnerships and measurable practical competencies. The app records actions and evidence; partner agreements and independent skill validation still need a pilot.",
  ],
  [
    "V. Target market / beneficiaries",
    "Scope aligned",
    "Primary: Philippine undergraduate students, working students and recent graduates. Secondary: student organizations, builder communities and academic departments. Tertiary: employers and industry partners. Setup supports eight fields plus Other; organization and employer portals are not built.",
  ],
  [
    "VI. Value proposition",
    "Partially demonstrable",
    "Personalized rule-based plans and measurable local progress are demonstrable. AI curation, awarded digital credentials and hyper-local community integration are future service work. The plan-completion milestone is self-reported, not a certification.",
  ],
  [
    "VII. Business model",
    "Proposed in concept note",
    "Freemium B2B2C: free skill mapping, recommendations and community access; premium analytics, resume generation and challenges; institutional licensing and recruitment. Billing, entitlements and institutional administration are not implemented.",
  ],
  [
    "VIII. Market analysis",
    "Claims need sources",
    "The note describes Philippine tertiary learners and skills-based hiring, with LinkedIn Learning and generic LMS alternatives. Add dated market sources, competitor evidence and willingness-to-pay research before asserting market size or superiority.",
  ],
  [
    "IX. Operations plan",
    "Phase 1 prototype",
    "The note sequences development/prototyping, a closed university/community pilot, and public launch with campus roadshows and employer challenges. Current local PWA needs cloud authentication, synchronization, a real AI provider and partner data before those service claims can be demonstrated.",
  ],
  [
    "X. Financial requirement",
    "Proposed estimate supplied",
    "The note requests PHP 500,000–750,000: 40% development, 30% marketing/acquisition, 20% operations and 10% contingency. These are proposed estimates; obtain cost quotes and assumptions before presenting a validated budget.",
  ],
];
export function DeveloperPage() {
  const [step, setStep] = useState(0);
  const [technical, setTechnical] = useState(false);
  const [pitch, setPitch] = useState(false);
  return (
    <div className="space-y-5">
      <header className="page-heading">
        <p className="eyebrow">Developer Options · Hackathon</p>
        <h1>Explain CaDeT</h1>
        <p>
          Presenter tools available to signed-in users. These controls do not
          grant administrative access.
        </p>
      </header>
      <div className="flex flex-wrap gap-4">
        <label>
          <input
            type="checkbox"
            checked={pitch}
            onChange={(e) => setPitch(e.target.checked)}
          />{" "}
          Focus on pitch walkthrough
        </label>
        <label>
          <input
            type="checkbox"
            checked={technical}
            onChange={(e) => setTechnical(e.target.checked)}
          />{" "}
          Show technical explanation
        </label>
      </div>
      <section className="glass-card p-5" aria-label="Pitch walkthrough">
        <p className="eyebrow">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="text-xl mt-3">{steps[step][0]}</h2>
        <p className="my-4" aria-live="polite">
          {steps[step][1]}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn btn-secondary"
            disabled={!step}
            onClick={() => setStep((n) => n - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={step === steps.length - 1}
            onClick={() => setStep((n) => n + 1)}
          >
            Next
          </button>
          <Link className="btn btn-primary" to={steps[step][2]}>
            Open live feature
          </Link>
        </div>
      </section>
      {technical && (
        <section className="glass-card p-5 space-y-3">
          <h2 className="text-xl">How the system works</h2>
          <p>
            React displays the interface. Dexie reads and writes IndexedDB. Live
            queries refresh the view when relevant records change, including
            across tabs on the same origin. There is no cross-device sync.
          </p>
          <p>
            Alignment = skill match × 40% + project relevance × 25% + experience
            relevance × 15% + ACTOR progress × 10% + goal intent × 10%. These
            are MVP design weights, not validated predictions. Skill scores use
            self-reported confidence; keyword matching is approximate.
          </p>
          <p>
            What-If copies input data in memory. Starting a test writes the
            experiment, tasks, and ACTOR event in one transaction. Creating a
            plan can change the ACTOR component, but does not establish skill
            mastery.
          </p>
          <p>
            Local authentication verifies a salted PBKDF2-SHA-256 password hash
            with 600,000 iterations. Sessions stay in memory. IndexedDB career
            records are not encrypted: someone controlling the browser or device
            can access or modify them. Server authentication is needed before
            offering secure online accounts.
          </p>
          <p>
            ACTOR is the product workflow. CaDeT does not currently demonstrate
            peer-reviewed validation of ACTOR as a career framework or
            independent verification of user evidence.
          </p>
        </section>
      )}
      {!pitch && (
        <section className="glass-card p-5">
          <h2 className="text-xl">Ad Astra 6 concept-note alignment</h2>
          <p className="my-3">
            This audit uses the supplied Ad Astra 6 Concept Note PSCXI document.
            It distinguishes the working prototype from proposed AI, community,
            institutional and commercial services.
          </p>
          <div className="history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Required section</th>
                  <th>Status</th>
                  <th>Evidence / next work</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map(([title, status, detail]) => (
                  <tr key={title}>
                    <th>{title}</th>
                    <td>{status}</td>
                    <td>{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
