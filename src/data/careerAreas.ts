import type { CareerPathDefinition } from '../types/career-path';
export const CAREER_AREAS = ['Technology', 'Business', 'Creative & media', 'Education', 'Community service', 'Hospitality', 'Sports & esports', 'Operations'] as const;
export type CareerArea = typeof CAREER_AREAS[number];
type Seed = [string, string, CareerArea, string[], string, string[]];
const seeds: Seed[] = [
 ['business-coordinator', 'Business Coordinator', 'Business', ['Communication','Planning','Spreadsheets','Customer Research'], 'Plan a small event budget and schedule, then ask a peer to review it.', ['operations-coordinator','marketing-assistant']],
 ['marketing-assistant', 'Marketing Assistant', 'Business', ['Audience Research','Copywriting','Communication','Analytics'], 'Draft a three-post campaign for a fictional business and collect feedback.', ['content-creator','business-coordinator']],
 ['content-creator', 'Content Creator', 'Creative & media', ['Storytelling','Writing','Video Editing','Audience Research'], 'Produce a short educational video and document peer feedback.', ['graphic-designer','marketing-assistant']],
 ['graphic-designer', 'Graphic Designer', 'Creative & media', ['Visual Design','Typography','Layout','Communication'], 'Create a poster from a brief and explain the design choices.', ['content-creator','frontend-developer']],
 ['learning-facilitator', 'Learning Facilitator', 'Education', ['Communication','Lesson Planning','Research','Feedback'], 'Prepare a ten-minute peer lesson and gather learner feedback.', ['community-coordinator','content-creator']],
 ['community-coordinator', 'Community Project Coordinator', 'Community service', ['Communication','Planning','Research','Teamwork'], 'Design a volunteer activity proposal with a partner organization in mind.', ['learning-facilitator','business-coordinator']],
 ['hospitality-assistant', 'Hospitality Assistant', 'Hospitality', ['Customer Service','Communication','Organization','Problem Solving'], 'Role-play three guest-service scenarios and record what you would improve.', ['business-coordinator','operations-coordinator']],
 ['esports-analyst', 'Sports & Esports Analyst', 'Sports & esports', ['Analysis','Communication','Teamwork','Video Review'], 'Review a public match, annotate three decisions, and present your findings.', ['content-creator','learning-facilitator']],
 ['operations-coordinator', 'Operations Coordinator', 'Operations', ['Planning','Organization','Spreadsheets','Problem Solving'], 'Map a small inventory workflow and test it with sample records.', ['business-coordinator','hospitality-assistant']],
];
export const ADDITIONAL_PATHS: CareerPathDefinition[] = seeds.map(([id,title,area,skills,proofProject,adjacentPathIds]) => ({
 id,title,area,summary:`Explore practical work in ${area.toLowerCase()} through a small, reviewable project.`,
 aliases:[title.toLowerCase()],
 skills:skills.map(name=>({name,weight:1,targetConfidence:60})),
 projectKeywords:skills.map(s=>s.toLowerCase()), experienceKeywords:[title.toLowerCase(),area.toLowerCase()],
 interestKeywords:[title.toLowerCase(),area.toLowerCase(),...skills.map(s=>s.toLowerCase())],
 adjacentPathIds,proofProject,
}));
