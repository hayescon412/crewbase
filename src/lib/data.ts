export type Status = "Active" | "Wrapping Up" | "Complete";

export interface CrewMember {
  name: string;
  role: string;
}

export interface Job {
  id: string;
  name: string;
  address: string;
  trade: string;
  status: Status;
  crew: CrewMember[];
  defaultTasks: string[];
}

export const jobs: Job[] = [
  {
    id: "johnson",
    name: "Johnson Residence",
    address: "412 Maple St",
    trade: "Cabinetry",
    status: "Active",
    crew: [
      { name: "Mike R.", role: "Lead Carpenter" },
      { name: "Danny P.", role: "Helper" },
    ],
    defaultTasks: [
      "Measure and confirm cabinet dimensions",
      "Install upper cabinets",
      "Install base cabinets",
      "Hang cabinet doors and adjust hinges",
      "Install drawer pulls and hardware",
      "Final cleanup and walkthrough",
    ],
  },
  {
    id: "brooks",
    name: "Brooks Office Build-Out",
    address: "88 Commerce Blvd, Suite 4",
    trade: "Flooring + Lighting",
    status: "Active",
    crew: [
      { name: "Tony S.", role: "Flooring Lead" },
      { name: "Chris W.", role: "Electrician" },
      { name: "Jake M.", role: "Helper" },
    ],
    defaultTasks: [
      "Remove existing flooring",
      "Prep and level subfloor",
      "Install LVP flooring",
      "Install transition strips",
      "Rough-in recessed lighting",
      "Wire and install pendant lights",
      "Install dimmer switches",
      "Final inspection and cleanup",
    ],
  },
  {
    id: "taylor",
    name: "Taylor Master Bath",
    address: "207 Birchwood Dr",
    trade: "Tile + Cabinetry",
    status: "Wrapping Up",
    crew: [
      { name: "Mike R.", role: "Lead Carpenter" },
      { name: "Luis G.", role: "Tile Setter" },
    ],
    defaultTasks: [
      "Set floor tile",
      "Grout floor tile",
      "Set shower wall tile",
      "Grout shower walls",
      "Install vanity cabinet",
      "Install mirrors and fixtures",
      "Caulk all seams",
      "Final walkthrough with client",
    ],
  },
  {
    id: "miller",
    name: "Miller Kitchen Remodel",
    address: "55 Oak Lane",
    trade: "Cabinetry + Countertops",
    status: "Complete",
    crew: [
      { name: "Danny P.", role: "Carpenter" },
      { name: "Tony S.", role: "Install Lead" },
    ],
    defaultTasks: [
      "Demo existing cabinets",
      "Install upper cabinets",
      "Install base cabinets",
      "Template countertops",
      "Install countertops",
      "Install backsplash",
      "Install hardware",
      "Final cleanup",
    ],
  },
];

// All unique crew members across all jobs
export function getAllCrew(): CrewMember[] {
  const seen = new Set<string>();
  const all: CrewMember[] = [];
  for (const job of jobs) {
    for (const member of job.crew) {
      if (!seen.has(member.name)) {
        seen.add(member.name);
        all.push(member);
      }
    }
  }
  return all;
}

// Jobs a specific crew member is assigned to
export function getJobsForCrew(name: string): Job[] {
  return jobs.filter((j) => j.crew.some((c) => c.name === name));
}
