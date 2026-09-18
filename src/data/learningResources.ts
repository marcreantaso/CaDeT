import type { AimInput } from "../types/aim";
export interface LearningResource {
  id: string;
  title: string;
  url: string;
  description: string;
  fields: string[];
  specialization?: string;
}
// Curated public directories checked 2026-09-18. These are not CaDeT partners.
export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: "mdn",
    title: "MDN Learn Web Development",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    description: "Written tutorials and practical web-development challenges.",
    fields: ["technology"],
    specialization: "software",
  },
  {
    id: "skillsbuild",
    title: "IBM SkillsBuild",
    url: "https://skillsbuild.org/",
    description:
      "Browse technology and workplace-skills learning. Check the learner track and registration requirements.",
    fields: ["technology", "business"],
  },
  {
    id: "tesda",
    title: "TESDA Online Program",
    url: "https://sites.google.com/tesda.gov.ph/tesda-online-program/home",
    description:
      "Official program information and links to technical-vocational courses in the Philippines.",
    fields: ["engineering", "hospitality", "business"],
  },
  {
    id: "openlearn",
    title: "OpenLearn course catalogue",
    url: "https://www.open.edu/openlearn/free-courses/full-catalogue",
    description:
      "Browse free courses across business, education, health, science, arts, and other subjects.",
    fields: [],
  },
];
export function resourcesForAim(input: AimInput) {
  return LEARNING_RESOURCES.filter(
    (r) =>
      (!r.fields.length || r.fields.includes(input.field.id)) &&
      (!r.specialization || r.specialization === input.specialization.id),
  );
}
export function supportSuggestion(input: AimInput) {
  const place = input.school || input.location || "your school or local area";
  if (input.support.id === "independent-learning")
    return {
      title: "Use a weekly self-review",
      description:
        "Compare your output with the milestone and save a reflection. You can change your support preference later.",
    };
  if (input.support.id === "campus-organization")
    return {
      title: `Find a relevant student organization at ${place}`,
      description:
        "Ask your student-affairs office for its recognized organizations directory. Confirm the group’s focus and availability before contacting it.",
    };
  if (input.support.id === "mentor-feedback")
    return {
      title: "Identify a mentor for one feedback session",
      description: `Ask a teacher, supervisor, or professional contact at ${place} to review one specific output. Agree on scope and availability yourself.`,
    };
  if (
    input.field.id === "technology" &&
    input.support.id === "online-community"
  )
    return {
      title: "Explore Google Developer Groups",
      description:
        "Use the public directory to find an online or nearby chapter. This is a discovery link, not a confirmed match or CaDeT partnership.",
      url: "https://gdg.community.dev/",
    };
  return {
    title: "Find a relevant peer group",
    description: `Look for a recognized group in ${place} working in your chosen field. Check membership rules, then request feedback on a small output.`,
  };
}
