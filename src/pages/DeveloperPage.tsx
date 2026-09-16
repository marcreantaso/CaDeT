import { useState } from 'react';
import { Link } from 'react-router-dom';
const steps = [
 ['Aim: choose a direction', 'A student records a career ambition, such as frontend development.', '/records?kind=goal'],
 ['Compress: define an outcome', 'Turn the ambition into a measurable target and identify skill gaps.', '/records?kind=target'],
 ['Explore the Career Map', 'Compare recorded skills, projects, experience, ACTOR progress, and intent with four career profiles. Explain each weighted contribution.', '/career-map'],
 ['Simulate a possibility', 'Select a skill or proof project. The simulated score changes in memory; real skill and project records stay unchanged.', '/career-map'],
 ['Test: create an experiment', 'Convert selected changes into a 14-day experiment and pending evidence tasks. This is a plan, not proof of completion.', '/records?kind=experiment'],
 ['Own: record actual evidence', 'Add a completed project with evidence and list its skills. Matching skill evidence updates. Record experiment ratings and reflection.', '/records?kind=project'],
 ['Run, observe, repeat', 'Complete tasks, inspect readiness history, and reconsider the next action. The current MVP still requires users to enter and assess their own evidence.', '/journey'],
];
const requirements = [
 ['I. Summary', 'Draft available', 'CaDeT helps learners compare career directions, explore skill changes, and turn those changes into practical experiments.'],
 ['II. Background of the problem', 'Research needed', 'Hypothesis: students struggle to connect learning activity with career direction. Add interviews, survey results, and sources before claiming demand.'],
 ['III. Proposed startup solution', 'MVP implemented', 'Career records, readiness, Career Map, What-If, and ACTOR experiment planning. Proposed SDG alignment: quality education (4) and decent work (8); impact has not been measured.'],
 ['IV. Objectives', 'Targets need agreement', 'Proposed pilot measures: time to create a useful plan, experiment completion, evidence recorded, and usability. Set sample size, baseline, and target values with the team.'],
 ['V. Target market / beneficiaries', 'Hypothesis', 'Computer Science students and early-career developers. Instructors or career offices are potential institutional buyers; buyer demand is unvalidated.'],
 ['VI. Value proposition', 'Demonstrable', 'Explainable alignment, temporary career simulations, and an experiment handoff in a local-first workspace. Competitive superiority has not been established.'],
 ['VII. Business model', 'Decision needed', 'Evaluate a free student tier and institutional subscriptions. Pricing, billing, and institutional administration are not implemented.'],
 ['VIII. Market analysis', 'Research needed', 'Collect sourced market size, interviews, alternatives, and willingness-to-pay evidence. No invented market figures are included.'],
 ['IX. Operations plan', 'Partly implemented', 'React PWA, IndexedDB storage, backups, GitHub review, and Vercel builds exist. Define pilot ownership, support, incident handling, and release responsibilities.'],
 ['X. Financial requirement', 'Budget needed', 'Estimate hosting, development time, pilot research, support, and contingency from quotes and team assumptions. Funding amount and allocations are not supplied.'],
];
export function DeveloperPage() {
 const [step, setStep] = useState(0);
 const [technical, setTechnical] = useState(false);
 const [pitch, setPitch] = useState(false);
 return <div className="space-y-5">
  <header className="page-heading"><p className="eyebrow">Developer Options · Hackathon</p><h1>Explain CaDeT</h1><p>Presenter tools available to signed-in users. These controls do not grant administrative access.</p></header>
  <div className="flex flex-wrap gap-4"><label><input type="checkbox" checked={pitch} onChange={e => setPitch(e.target.checked)} /> Focus on pitch walkthrough</label><label><input type="checkbox" checked={technical} onChange={e => setTechnical(e.target.checked)} /> Show technical explanation</label></div>
  <section className="glass-card p-5" aria-label="Pitch walkthrough"><p className="eyebrow">Step {step + 1} of {steps.length}</p><h2 className="text-xl mt-3">{steps[step][0]}</h2><p className="my-4" aria-live="polite">{steps[step][1]}</p><div className="flex flex-wrap gap-3"><button className="btn btn-secondary" disabled={!step} onClick={() => setStep(n => n-1)}>Previous</button><button className="btn btn-secondary" disabled={step === steps.length-1} onClick={() => setStep(n => n+1)}>Next</button><Link className="btn btn-primary" to={steps[step][2]}>Open live feature</Link></div></section>
  {technical && <section className="glass-card p-5 space-y-3"><h2 className="text-xl">How the system works</h2><p>React displays the interface. Dexie reads and writes IndexedDB. Live queries refresh the view when relevant records change, including across tabs on the same origin. There is no cross-device sync.</p><p>Alignment = skill match × 40% + project relevance × 25% + experience relevance × 15% + ACTOR progress × 10% + goal intent × 10%. These are MVP design weights, not validated predictions. Skill scores use self-reported confidence; keyword matching is approximate.</p><p>What-If copies input data in memory. Starting a test writes the experiment, tasks, and ACTOR event in one transaction. Creating a plan can change the ACTOR component, but does not establish skill mastery.</p><p>Local authentication verifies a salted PBKDF2-SHA-256 password hash with 600,000 iterations. Sessions stay in memory. IndexedDB career records are not encrypted: someone controlling the browser or device can access or modify them. Server authentication is needed before offering secure online accounts.</p><p>ACTOR is the product workflow. CaDeT does not currently demonstrate peer-reviewed validation of ACTOR as a career framework or independent verification of user evidence.</p></section>}
  {!pitch && <section className="glass-card p-5"><h2 className="text-xl">Concept-note audit from your images</h2><p className="my-3">The supplied template requests ten written sections. Software features alone cannot complete its research, business, and funding requirements.</p><div className="history-table-wrap"><table><thead><tr><th>Required section</th><th>Status</th><th>Evidence / next work</th></tr></thead><tbody>{requirements.map(([title,status,detail]) => <tr key={title}><th>{title}</th><td>{status}</td><td>{detail}</td></tr>)}</tbody></table></div></section>}
 </div>;
}
