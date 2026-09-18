export interface Option {
  id: string;
  label: string;
}
export interface Specialization extends Option {
  roles: Option[];
  skills: string[];
}
export interface Field extends Option {
  specializations: Specialization[];
}
const options = (values: string[]): Option[] =>
  values.map((label) => ({
    id: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
    label,
  }));
const specialization = (
  id: string,
  label: string,
  roles: string[],
  skills: string[],
): Specialization => ({ id, label, roles: options(roles), skills });
// Product taxonomy v1: starter choices, not occupational standards or validated competency requirements.
export const FIELDS: Field[] = [
  {
    id: "technology",
    label: "Technology & computing",
    specializations: [
      specialization(
        "software",
        "Software development",
        ["Frontend Developer", "Backend Developer", "Full-Stack Developer"],
        ["HTML", "CSS", "JavaScript", "React", "SQL", "Git", "Testing"],
      ),
      specialization(
        "data-ai",
        "Data & AI",
        ["Data Analyst", "AI Application Developer"],
        ["Python", "Data Processing", "SQL", "Model Evaluation"],
      ),
      specialization(
        "security",
        "Cybersecurity & networks",
        ["Security Analyst", "Network Technician"],
        ["Network fundamentals", "Threat analysis", "Linux"],
      ),
    ],
  },
  {
    id: "business",
    label: "Business & entrepreneurship",
    specializations: [
      specialization(
        "marketing",
        "Marketing & sales",
        ["Marketing Associate", "Digital Marketer"],
        ["Market research", "Copywriting", "Campaign analysis"],
      ),
      specialization(
        "operations",
        "Operations & entrepreneurship",
        ["Operations Associate", "Entrepreneur"],
        ["Process mapping", "Budgeting", "Customer discovery"],
      ),
    ],
  },
  {
    id: "creative",
    label: "Design, media & communication",
    specializations: [
      specialization(
        "design",
        "Visual & product design",
        ["Graphic Designer", "Product Designer"],
        ["Visual design", "User research", "Prototyping"],
      ),
      specialization(
        "media",
        "Content & communication",
        ["Content Creator", "Communications Associate"],
        ["Storytelling", "Video editing", "Writing"],
      ),
    ],
  },
  {
    id: "engineering",
    label: "Engineering & skilled trades",
    specializations: [
      specialization(
        "engineering-design",
        "Engineering design",
        ["Engineering Trainee", "CAD Technician"],
        ["Technical drawing", "CAD", "Problem solving"],
      ),
      specialization(
        "trades",
        "Technical services",
        ["Electrical Technician", "Maintenance Technician"],
        ["Safety procedures", "Troubleshooting", "Technical documentation"],
      ),
    ],
  },
  {
    id: "education",
    label: "Education & social services",
    specializations: [
      specialization(
        "teaching",
        "Teaching & learning",
        ["Tutor", "Learning Facilitator"],
        ["Lesson planning", "Communication", "Assessment design"],
      ),
      specialization(
        "community",
        "Community development",
        ["Program Assistant", "Community Organizer"],
        ["Facilitation", "Research", "Project coordination"],
      ),
    ],
  },
  {
    id: "health",
    label: "Health & life sciences",
    specializations: [
      specialization(
        "health-support",
        "Health education & support",
        ["Health Program Assistant", "Health Educator"],
        ["Health literacy", "Communication", "Research"],
      ),
      specialization(
        "life-sciences",
        "Life sciences & research",
        ["Research Assistant", "Laboratory Trainee"],
        ["Scientific writing", "Data collection", "Laboratory safety"],
      ),
    ],
  },
  {
    id: "hospitality",
    label: "Hospitality & tourism",
    specializations: [
      specialization(
        "guest-services",
        "Guest services",
        ["Guest Services Associate", "Tourism Assistant"],
        ["Customer service", "Communication", "Service recovery"],
      ),
      specialization(
        "food-events",
        "Food service & events",
        ["Events Assistant", "Food Service Associate"],
        ["Event planning", "Food safety", "Teamwork"],
      ),
    ],
  },
  {
    id: "sports",
    label: "Sports & esports",
    specializations: [
      specialization(
        "competition",
        "Competitive performance",
        ["Esports Player", "Athlete"],
        [
          "Team communication",
          "Performance review",
          "Strategic decision making",
        ],
      ),
      specialization(
        "coaching",
        "Coaching & analysis",
        ["Performance Analyst", "Assistant Coach"],
        ["Video analysis", "Feedback delivery", "Practice planning"],
      ),
    ],
  },
];
export const STATUSES = options([
  "Undergraduate student",
  "Working student",
  "Recent graduate",
  "Early-career professional",
  "Career changer",
  "Exploring options",
]);
export const EXPERIENCE = options([
  "No professional experience",
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6+ years",
]);
export const OUTCOMES = options([
  "Explore a career direction",
  "Build a portfolio",
  "Prepare for an internship",
  "Prepare for a first job",
  "Grow in my current role",
  "Start a small venture",
]);
export const VALUES = options([
  "Meaningful impact",
  "Financial stability",
  "Creativity",
  "Continuous learning",
  "Flexibility",
  "Leadership",
]);
export const ENVIRONMENTS = options([
  "Remote",
  "On-site",
  "Hybrid",
  "Flexible / still exploring",
]);
export const FORMATS = options([
  "Reading & documentation",
  "Video lessons",
  "Hands-on practice",
  "Mixed formats",
]);
export const SUPPORT = options([
  "Campus organization",
  "Online community",
  "Mentor feedback",
  "Independent learning",
]);
export const CATEGORY_OPTIONS = options([
  "Technical",
  "Soft",
  "Domain",
  "Tool",
  "Language",
  "Framework",
]);
export const LEVEL_OPTIONS = options([
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
]);
export const OTHER: Option = { id: "other", label: "Other — specify" };
export const EXPLORING: Option = {
  id: "exploring",
  label: "Not sure yet — help me explore",
};
