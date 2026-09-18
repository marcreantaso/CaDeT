import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
const slides = [
 ['Welcome to CaDeT', 'Build a career in any supported field. Start with what interests you; you do not need a fixed goal.'],
 ['Describe your starting point', 'Edit your profile and add skills, projects, or experience. Small real examples count.'],
 ['Explore and distribute', 'Use Help me start to try a field, preview a weekly plan, and save manageable tasks.'],
 ['Learn through ACTOR', 'Aim, Compress, Test, Own, Run. Record what happened, reflect, and choose the next step.'],
];
export function WelcomeTutorial() {
 const { profile, updateProfile } = useAuth();
 const [replay,setReplay] = useState(false);
 const [seconds,setSeconds] = useState(0);
 const [paused,setPaused] = useState(false);
 const [error,setError] = useState('');
 const open = replay || profile?.tutorialCompleted === false || (profile && profile.tutorialCompleted === undefined);
 useEffect(() => {
  if (!open || paused || seconds >= 20) return;
  const timer = window.setInterval(() => { if (document.visibilityState === 'visible') setSeconds(n => Math.min(20,n+1)); },1000);
  return () => clearInterval(timer);
 },[open,paused,seconds]);
 async function finish() { try { await updateProfile({tutorialCompleted:true}); setReplay(false); setError(''); } catch { setError('Could not save tutorial preference. Try again.'); } }
 if (!open) return <button className="btn btn-secondary" onClick={() => {setSeconds(0);setPaused(false);setReplay(true);}}>Replay 20-second tour</button>;
 const step = Math.min(3, Math.floor(seconds/5));
 return <section className="glass-card p-5 mb-5" aria-label="Welcome tutorial"><p className="eyebrow">20-second welcome · {step+1}/4</p><progress className="w-full" value={seconds} max={20} aria-label="Tutorial progress"/><h2 className="text-xl mt-3">{slides[step][0]}</h2><p className="my-3">{slides[step][1]}</p><div className="flex flex-wrap gap-2"><button className="btn btn-secondary" disabled={seconds>=20} onClick={() => setPaused(v=>!v)}>{paused?'Resume':'Pause'}</button><button className="btn btn-secondary" onClick={() => {setPaused(true);setSeconds(Math.max(0,(step-1)*5));}}>Back</button><button className="btn btn-secondary" onClick={() => {setPaused(true);setSeconds(Math.min(20,(step+1)*5));}}>Next</button><button className="btn btn-primary" onClick={finish}>{seconds>=20?'Start exploring':'Skip tour'}</button></div>{error&&<p role="alert">{error}</p>}</section>;
}
