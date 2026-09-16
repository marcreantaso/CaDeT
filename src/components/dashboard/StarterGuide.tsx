import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCareerDigitalTwin } from '../../hooks/useCareerDigitalTwin';
import { CAREER_AREAS } from '../../data/careerAreas';
import { CAREER_PATHS } from '../../data/careerPaths';
import { calculateCareerAlignment } from '../../utils/careerAlignment';
import { distributePlan, saveStarterPlan, type PlanStep } from '../../lib/starterPlan';
export function StarterGuide() {
 const {user,profile}=useAuth();const {data,error,isLoading,retry}=useCareerDigitalTwin();
 const [area,setArea]=useState('');const [pathId,setPathId]=useState('');const [hours,setHours]=useState(3);
 const [date,setDate]=useState(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
 const [steps,setSteps]=useState<PlanStep[]|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const choices=useMemo(()=>{
 const candidates=CAREER_PATHS.filter(p=>area?p.area===area:profile?.preferredIndustries.includes(p.area));
 return candidates.map(path=>({path,score:data?calculateCareerAlignment(path,data).score:0})).sort((a,b)=>b.score-a.score).slice(0,3);
 },[area,profile?.preferredIndustries,data]);
 function preview(id=pathId){setMessage('');try{setPathId(id);setSteps(distributePlan(id,hours));}catch(e){setMessage((e as Error).message);}}
 async function save(){if(!user||!steps||busy)return;setBusy(true);try{const count=await saveStarterPlan(user.id,pathId,date,steps);setMessage(`${count} tasks saved. Open Records → Task to update their status.`);setSteps(null);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <section className="glass-card p-5 mb-5"><p className="eyebrow">Help me start</p><h2 className="text-xl mt-2">You do not need your whole career figured out</h2><p className="my-3">Pick something you are curious about. Try a small activity before committing to a direction.</p><label className="block">Which area sounds interesting?<select className="input-dark w-full mt-2" value={area} onChange={e=>{setArea(e.target.value);setSteps(null);setPathId('');}}><option value="">Use my profile interests</option>{CAREER_AREAS.map(a=><option key={a}>{a}</option>)}</select></label>
 {isLoading?<p role="status">Loading your starting point…</p>:error?<><p role="alert">{error}</p><button onClick={retry} className="btn btn-secondary">Retry</button></>:<>{!choices.length&&<p className="mt-3">No interests selected yet. Choose any area above to see examples. You can change it later.</p>}<div className="starter-choices">{choices.map(({path,score})=><article key={path.id} className="glass-card p-4"><h3>{path.title}</h3><p className="text-sm my-2">{area?`You selected ${area}.`:`Matches your profile interest in ${path.area}.`} {score>0?`Recorded alignment: ${score}%.`:'No alignment evidence yet; this is an exploration option.'}</p><p className="text-sm my-2">Try: {path.proofProject}</p><button className="btn btn-secondary" onClick={()=>preview(path.id)}>Preview my week</button></article>)}</div></>}
 <details className="mt-4"><summary>Still unsure? Start without choosing a career</summary><ol className="list-decimal pl-6 my-3"><li>Write down one activity you enjoyed recently.</li><li>Ask someone in a field you are curious about what a typical day looks like.</li><li>Record what you learned and which small activity you want to try.</li></ol><Link to="/records?kind=reflection" className="btn btn-secondary">Open reflections · use Quick add</Link></details>
 {steps&&<div className="mt-5 space-y-3"><h3>Distribute your week · editable preview</h3><p className="text-sm">15% explore · 35% practice · 35% first draft · 15% reflect. This is a starting allocation, not a completion guarantee. Saving creates tasks; it does not change your target or skill ratings.</p><div className="flex flex-wrap gap-3"><label>Hours this week<input className="input-dark w-full" type="number" min={1} max={20} value={hours} onChange={e=>{const n=Number(e.target.value);setHours(n);if(Number.isInteger(n)&&n>=1&&n<=20)setSteps(distributePlan(pathId,n));}}/></label><label>Start date<input type="date" className="input-dark w-full" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
 {steps.map((step,i)=><label key={i} className="block">Day {step.day+1} · {step.minutes} minutes<input className="input-dark w-full" maxLength={500} value={step.title} onChange={e=>setSteps(current=>current!.map((s,j)=>j===i?{...s,title:e.target.value}:s))}/></label>)}<p>Total planned: {steps.reduce((n,s)=>n+s.minutes,0)} minutes</p><button className="btn btn-primary" disabled={busy||hours<1||hours>20||!Number.isInteger(hours)} onClick={save}>{busy?'Saving…':'Save four tasks'}</button><button className="btn btn-secondary ml-2" disabled={busy} onClick={()=>setSteps(null)}>Cancel</button></div>}{message&&<p role="status" className="mt-3">{message}</p>}
 <Link to="/records?kind=task" className="btn btn-secondary mt-4">Review my tasks</Link>
 </section>;
}
