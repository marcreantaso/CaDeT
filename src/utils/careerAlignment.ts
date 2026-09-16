import type { ActorState } from "../types/actor";
import type {
  CareerAlignment,
  CareerPathDefinition,
  CareerSimulation,
  CareerTwinInput,
  SimulationChange,
} from "../types/career-path";
import type { Project } from "../types/career";
import type { Skill } from "../types/skills";

const FACTOR_WEIGHTS = {
  skills: 40,
  projects: 25,
  experience: 15,
  actor: 10,
  intent: 10,
} as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

function includesKeyword(text: string, keyword: string) {
  const haystack = ` ${normalize(text)} `;
  const needle = normalize(keyword);
  return needle.length > 1 && haystack.includes(` ${needle} `);
}

function skillMatches(skill: Skill, name: string, aliases: string[] = []) {
  const skillName = normalize(skill.skillName);
  return [name, ...aliases].some((candidate) => {
    const normalized = normalize(candidate);
    return skillName === normalized || skillName.includes(normalized) || normalized.includes(skillName);
  });
}

function keywordCoverage(texts: string[], keywords: string[]) {
  if (!texts.length || !keywords.length) return 0;
  const matched = keywords.filter((keyword) =>
    texts.some((text) => includesKeyword(text, keyword)),
  ).length;
  return Math.min(100, Math.round((matched / Math.min(3, keywords.length)) * 100));
}

function actorScore(actorState: ActorState | null) {
  if (!actorState) return 0;
  const stages = Object.values(actorState.stages);
  const progress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length;
  const completed = stages.filter((stage) => stage.status === "completed").length;
  return Math.min(100, Math.round(progress * 0.7 + (completed / stages.length) * 30));
}

function factor(
  key: keyof typeof FACTOR_WEIGHTS,
  label: string,
  score: number,
  explanation: string,
) {
  const weight = FACTOR_WEIGHTS[key];
  const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    key,
    label,
    score: roundedScore,
    weight,
    contribution: Math.round((roundedScore * weight) / 100),
    explanation,
  };
}

export function calculateCareerAlignment(
  path: CareerPathDefinition,
  input: CareerTwinInput,
): CareerAlignment {
  const skillRows = path.skills.map((requirement) => {
    const matched = input.skills.filter((skill) =>
      skillMatches(skill, requirement.name, requirement.aliases),
    );
    const best = matched.sort((a, b) => b.confidence - a.confidence)[0];
    const currentConfidence = best?.confidence ?? 0;
    return {
      name: requirement.name,
      currentConfidence,
      targetConfidence: requirement.targetConfidence,
      evidenceCount: best?.evidenceCount ?? 0,
      match: Math.min(100, Math.round((currentConfidence / requirement.targetConfidence) * 100)),
      weight: requirement.weight,
    };
  });
  const totalSkillWeight = path.skills.reduce((sum, skill) => sum + skill.weight, 0);
  const skillsScore = totalSkillWeight
    ? skillRows.reduce((sum, skill) => sum + skill.match * skill.weight, 0) / totalSkillWeight
    : 0;

  const completedProjects = input.projects.filter((project) => project.status === "completed");
  const projectTexts = completedProjects.map((project) =>
    [project.title, project.description, project.skills.join(" "), project.evidence].join(" "),
  );
  const projectCoverage = keywordCoverage(projectTexts, path.projectKeywords);
  const documentedProjects = completedProjects.filter((project) => project.evidence.trim()).length;
  const projectsScore = Math.min(100, projectCoverage * 0.75 + Math.min(25, documentedProjects * 12.5));

  const experienceTexts = input.experiences.map((experience) =>
    [experience.title, experience.organization, experience.description].join(" "),
  );
  const experienceScore = keywordCoverage(experienceTexts, path.experienceKeywords);

  const intentTexts = [
    ...input.targets.filter((target) => target.isActive).flatMap((target) => [target.originalGoal, target.compressedTarget]),
    ...input.goals.flatMap((goal) => [goal.title, goal.description]),
  ];
  const intentKeywords = [...path.aliases, ...path.interestKeywords, path.title];
  const intentScore = keywordCoverage(intentTexts, intentKeywords);
  const currentActorScore = actorScore(input.actorState);

  const factors = [
    factor("skills", "Skill match", skillsScore, `${skillRows.filter((skill) => skill.match >= 70).length} of ${skillRows.length} core skills are near the path target.`),
    factor("projects", "Project evidence", projectsScore, `${completedProjects.length} completed project${completedProjects.length === 1 ? "" : "s"}; ${documentedProjects} include${documentedProjects === 1 ? "s" : ""} evidence.`),
    factor("experience", "Experience relevance", experienceScore, experienceTexts.length ? "Role and experience descriptions were matched to this path." : "No work-experience records are available yet."),
    factor("actor", "ACTOR progress", currentActorScore, input.actorState ? `Cycle ${input.actorState.cycleCount}, currently in ${input.actorState.currentStage.toUpperCase()}.` : "No ACTOR state is available yet."),
    factor("intent", "Goal intent", intentScore, intentTexts.length ? "Active goals and targets were compared with this career path." : "No active career goal or target is available yet."),
  ];
  const score = factors.reduce((sum, item) => sum + item.contribution, 0);
  const strengths = skillRows
    .filter((skill) => skill.match >= 70)
    .sort((a, b) => b.match - a.match)
    .slice(0, 4)
    .map((skill) => `${skill.name} (${skill.currentConfidence}%)`);
  const gaps = skillRows
    .filter((skill) => skill.match < 70)
    .sort((a, b) => a.match - b.match)
    .slice(0, 5)
    .map((skill) => skill.name);
  const evidence = completedProjects
    .filter((project) => path.projectKeywords.some((keyword) => includesKeyword(projectTexts[completedProjects.indexOf(project)] ?? "", keyword)))
    .slice(0, 3)
    .map((project) => project.title);

  return {
    pathId: path.id,
    title: path.title,
    score,
    factors,
    skills: skillRows.map(({ weight: _weight, ...skill }) => skill),
    strengths,
    gaps,
    evidence,
  };
}

export function selectPrimaryPath(
  paths: CareerPathDefinition[],
  input: CareerTwinInput,
) {
  const activeTarget = input.targets.find((target) => target.isActive);
  const declared = activeTarget
    ? `${activeTarget.originalGoal} ${activeTarget.compressedTarget}`
    : input.goals.map((goal) => `${goal.title} ${goal.description}`).join(" ");
  const directMatch = paths.find((path) =>
    [path.title, ...path.aliases].some((alias) => includesKeyword(declared, alias)),
  );
  if (directMatch) return directMatch.id;
  return paths
    .map((path) => calculateCareerAlignment(path, input))
    .sort((a, b) => b.score - a.score)[0]?.pathId ?? paths[0]?.id;
}

function simulatedSkill(path: CareerPathDefinition, name: string, userId: string): Skill {
  const requirement = path.skills.find((skill) => skill.name === name)!;
  const now = new Date().toISOString();
  return {
    id: `simulation:${path.id}:${name}`,
    userId,
    skillName: name,
    category: "technical",
    level: "intermediate",
    confidence: requirement.targetConfidence,
    evidenceCount: 1,
    linkedProjects: [],
    linkedExperiments: [],
    lastPracticed: now,
    createdAt: now,
    updatedAt: now,
  };
}

export function simulateCareerAlignment(
  path: CareerPathDefinition,
  input: CareerTwinInput,
  changes: SimulationChange,
  userId = "simulation",
): CareerSimulation {
  const simulatedSkills = [...input.skills];
  for (const name of changes.skillNames) {
    const requirement = path.skills.find((skill) => skill.name === name);
    if (!requirement) continue;
    const index = simulatedSkills.findIndex((skill) => skillMatches(skill, requirement.name, requirement.aliases));
    if (index >= 0) {
      simulatedSkills[index] = {
        ...simulatedSkills[index],
        confidence: Math.max(simulatedSkills[index].confidence, requirement.targetConfidence),
        evidenceCount: Math.max(1, simulatedSkills[index].evidenceCount),
      };
    } else simulatedSkills.push(simulatedSkill(path, name, userId));
  }
  const simulatedProjects: Project[] = [...input.projects];
  if (changes.includeProofProject) {
    const now = new Date().toISOString();
    simulatedProjects.push({
      id: `simulation:${path.id}:project`,
      userId,
      title: path.proofProject,
      description: path.proofProject,
      skills: changes.skillNames,
      evidence: "Simulated portfolio evidence",
      status: "completed",
      startDate: now.slice(0, 10),
      endDate: now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    });
  }
  const baseline = calculateCareerAlignment(path, input);
  const simulated = calculateCareerAlignment(path, {
    ...input,
    skills: simulatedSkills,
    projects: simulatedProjects,
  });
  return {
    pathId: path.id,
    baseline,
    simulated,
    delta: simulated.score - baseline.score,
    changes,
  };
}
