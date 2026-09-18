import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CAREER_AREAS } from '../../data/careerAreas';
export function ProfileCard() {
 const {profile,updateProfile}=useAuth(); const [editing,setEditing]=useState(false); const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 if(!profile)return null;
 async function save(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault();if(busy)return;setBusy(true);setMessage('');const values=new FormData(e.currentTarget);
  const fullName=String(values.get('fullName')||'').trim();
  if(!fullName){setMessage('Enter your name.');setBusy(false);return;}
  try {await updateProfile({fullName,headline:String(values.get('headline')||'').trim(),currentRole:String(values.get('currentRole')||'').trim(),bio:String(values.get('bio')||'').trim(),preferredIndustries:values.getAll('areas').map(String)});setEditing(false);setMessage('Profile saved.');}catch{setMessage('Could not save your profile. Try again.');}finally{setBusy(false);}
 }
 return <section className="glass-card p-5 mb-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="eyebrow">Your profile</p><h2 className="text-xl">{profile.fullName}</h2><p>{profile.headline||'Your next chapter starts here'}</p><p>{profile.currentRole||'Current role not set'}</p></div><button className="btn btn-secondary" onClick={()=>setEditing(v=>!v)}>{editing?'Cancel':'Edit profile'}</button></div>{!editing&&<><p className="my-2">{profile.bio}</p><p className="text-sm">Interests: {profile.preferredIndustries.join(', ')||'Still exploring — use Help me start below'}</p></>}{editing&&<form onSubmit={save} className="space-y-3 mt-4"><label className="block">Name<input name="fullName" required maxLength={100} defaultValue={profile.fullName} className="input-dark w-full"/></label><label className="block">Headline<input name="headline" maxLength={150} defaultValue={profile.headline} className="input-dark w-full"/></label><label className="block">Current role<input name="currentRole" maxLength={100} defaultValue={profile.currentRole} className="input-dark w-full"/></label><label className="block">About you<textarea name="bio" maxLength={1000} defaultValue={profile.bio} className="input-dark w-full"/></label><fieldset><legend>Areas you want to explore</legend><div className="flex flex-wrap gap-4">{CAREER_AREAS.map(area=><label key={area}><input type="checkbox" name="areas" value={area} defaultChecked={profile?.preferredIndustries.includes(area)}/> {area}</label>)}</div></fieldset><button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Save profile'}</button></form>}{message&&<p role="status" className="mt-3">{message}</p>}</section>;
}
