export interface Skill {
  id: string;
  title: string;
  content: string;
}

export interface GenerateOptions {
  prompt: string;
  audience: string;
  tone: string;
  numSkills: number;
}

export interface Project {
  id?: string;
  userId: string;
  prompt: string;
  audience?: string;
  tone?: string;
  numSkills?: number;
  title: string;
  createdAt: any; // Firestore Timestamp
  skills: Skill[];
}
