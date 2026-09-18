import { db } from './db';
import { CAREER_PATH_BY_ID } from '../data/careerPaths';
import type { CareerTask } from '../types/career';
export interface PlanStep { title: string; minutes: number; day: number; }
export function distributePlan(pathId: string, hours: number): PlanStep[] {
 const path=CAREER_PATH_BY_ID[pathId];
 if(!path || !Number.isFinite(hours) || hours<1 || hours>20 || !Number.isInteger(hours)) throw new Error('Choose a path and 1–20 whole hours.');
 const budget=hours*60; const learn=Math.floor(budget*.15), practice=Math.floor(budget*.35), proof=Math.floor(budget*.35);
 return [
 {title:`Explore ${path.title}: list three responsibilities and one question`,minutes:learn,day:0},
 {title:`Practice ${path.skills[0].name} with one small exercise`,minutes:practice,day:2},
 {title:`Make a first draft: ${path.proofProject}`,minutes:proof,day:4},
 {title:'Reflect: what did you enjoy, find difficult, and want to try next?',minutes:budget-learn-practice-proof,day:6},
 ];
}
export async function saveStarterPlan(userId:string,pathId:string,startDate:string,steps:PlanStep[]) {
 if(!userId||!CAREER_PATH_BY_ID[pathId])throw new Error('Choose a valid career path.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!Number.isFinite(Date.parse(startDate))||new Date(startDate).toISOString().slice(0,10)!==startDate)throw new Error('Choose a valid start date.');
 if(steps.length!==4||steps.some(s=>!s.title.trim()||s.title.length>500||!Number.isInteger(s.minutes)||s.minutes<1||s.minutes>1200||![0,2,4,6].includes(s.day)))throw new Error('Check the four task titles and time allocations.');
 const now=new Date().toISOString();const prefix=`starter:${userId}:${pathId}:${startDate}`;
 return db.transaction('rw',db.tasks,db.actor_events,async()=>{
 if(await db.tasks.get(`${prefix}:0`))throw new Error('A plan for this path and start date already exists. Open your tasks to review it.');
 const rows:CareerTask[]=steps.map((step,i)=>{const date=new Date(startDate+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+step.day);return {id:`${prefix}:${i}`,userId,title:step.title.trim(),reason:`Explore ${CAREER_PATH_BY_ID[pathId].title}. Planned time: ${step.minutes} minutes. This is an exploration exercise, not verified career evidence.`,priority:'medium',status:'pending',period:'one_time',dueDate:date.toISOString().slice(0,10),createdAt:now,updatedAt:now};});
 await db.tasks.bulkAdd(rows);
 await db.actor_events.add({id:crypto.randomUUID(),userId,stage:'aim',eventType:'task_created',title:`Exploration plan: ${CAREER_PATH_BY_ID[pathId].title}`,description:'Distributed four beginner tasks across one week.',metadata:{pathId,startDate,taskIds:rows.map(r=>r.id)},createdAt:now});
 return rows.length;
 });
}
