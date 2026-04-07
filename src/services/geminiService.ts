import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GenerateOptions } from "../types";

// Helper to get the AI instance with the current API key
function getAI() {
  // 1. First priority: The key the user entered in the UI (stored in localStorage)
  const manualKey = localStorage.getItem('GEMINI_API_KEY');
  
  // 2. Second priority: Fallback to environment variables
  // Note: process.env.GEMINI_API_KEY is defined in vite.config.ts for production/dev
  const apiKey = manualKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || !apiKey.trim()) {
    console.error("Gemini API Key is missing. Please configure it in settings.");
    throw new Error("מפתח API חסר. נא להגדיר את מפתח ה-Gemini שלך בתפריט ההגדרות באתר.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || !apiKey.trim()) return false;
  
  // List of models to try for validation, from most preferred to most stable
  const modelsToTry = [
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite-preview"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`[API Validation] Attempting with model: ${modelName}`);
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`[API Validation] Success with model: ${modelName}`);
        return true;
      }
    } catch (error: any) {
      console.warn(`[API Validation] Failed for ${modelName}:`, error?.message || error);
      // If it's a 403 or 400, it might be a key issue rather than a model issue
      if (error?.message?.includes('403') || error?.message?.includes('400')) {
        console.error("[API Validation] Critical error (403/400) - likely invalid key or restriction.");
      }
    }
  }

  console.error("All API key validation attempts failed.");
  return false;
}

export async function generateSkills(options: GenerateOptions): Promise<{ 
  title: string, 
  skills: Skill[], 
  detailedPrompt: string, 
  systemOptimization: string, 
  skillChainOptimization: string,
  masterSkill: string
}> {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: `You are the Elite Vibe Coding Instructor. Your mission is to guide developers in building high-performance skills and architectural mastery through the "vibe coding" philosophy.
Your expertise spans across high-performance distributed systems, cutting-edge frontend engineering, and elite UI/UX design.

The student wants to build the following project:
"${options.prompt}"

Target Audience: ${options.audience}
Tone: ${options.tone}
Number of Skills to Generate: ${options.numSkills}

Your task is to architect this project at a professional, production-ready level while maintaining the "vibe coding" spirit—fast, intuitive, and powerful.
Avoid all generic, bland, or "tutorial-style" content. Every skill must represent absolute industry best practices.

Break down the project into exactly ${options.numSkills} elite "skills" or architectural phases.
Cover the entire lifecycle: 
1. High-Level Architecture & System Design (DDD, Clean Architecture, Scalability)
2. Elite UI/UX Design System (Atomic Design, Accessibility, Motion, Typography)
3. Advanced Frontend Engineering (State Management, Performance Optimization, Component Architecture)
4. Robust Backend & API Design (Security, Rate Limiting, Documentation, Type Safety)
5. Infrastructure & DevOps (CI/CD, Observability, Cloud-Native patterns)

In addition to the skills, you MUST generate:
1. "detailedPrompt": A master-level, full-stack prompt (markdown).
2. "systemOptimization": A deep-dive technical optimization strategy (markdown).
3. "skillChainOptimization": A strategic execution roadmap and dependency graph (markdown).
4. "masterSkill": The ultimate orchestrator skill instructions (markdown).

STRICT INSTRUCTOR RULES:
1. NO GENERIC ADVICE. Be hyper-specific to the project's unique challenges.
2. ELITE CODE: Any code snippets must be modern, type-safe, and follow industry-standard style guides (e.g., TypeScript, Tailwind CSS, Clean Code).
3. DESIGN EXCELLENCE: Describe the UI/UX with precision. Use terms like "fluid transitions," "intentional whitespace," "semantic hierarchy," and "design tokens."
4. DEPTH: Each skill must feel like a senior engineer's briefing, not a beginner's guide.
5. VIBE CODING: Infuse the content with the energy of "vibe coding"—focus on flow, intuition, and high-impact results.
6. LANGUAGE: The response from the model must always be in English, regardless of the input language.

Return the response as a JSON object with the following structure:`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A sophisticated, professional title for the project.",
          },
          detailedPrompt: {
            type: Type.STRING,
            description: "A master-level, full-stack prompt for the entire system.",
          },
          systemOptimization: {
            type: Type.STRING,
            description: "A deep-dive technical optimization strategy.",
          },
          skillChainOptimization: {
            type: Type.STRING,
            description: "A strategic execution roadmap and dependency graph.",
          },
          masterSkill: {
            type: Type.STRING,
            description: "The ultimate orchestrator skill providing precise instructions to the model on when and how to use the other skills.",
          },
          skills: {
            type: Type.ARRAY,
            description: "The list of elite skills required to build the project.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "A unique semantic string ID for the skill.",
                },
                title: {
                  type: Type.STRING,
                  description: "The professional name of the skill.",
                },
                content: {
                  type: Type.STRING,
                  description: "The elite-level markdown content for this skill. Include Technical Requirements and Architectural Notes.",
                },
                tags: {
                  type: Type.ARRAY,
                  description: "An array of 3-6 relevant keywords or technologies.",
                  items: {
                    type: Type.STRING
                  }
                }
              },
              required: ["id", "title", "content", "tags"],
            },
          },
        },
        required: ["title", "detailedPrompt", "systemOptimization", "skillChainOptimization", "masterSkill", "skills"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text);
}

export async function refineSkill(skill: Skill, projectContext: string, refinementPrompt: string): Promise<Skill> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the Elite Vibe Coding Instructor.
Project Context: "${projectContext}"

Current Architectural Specification:
Title: ${skill.title}
Content:
${skill.content}

Student Refinement Request: "${refinementPrompt}"

Your task is to update this technical specification based on the student's request while maintaining the "vibe coding" flow. 
Ensure all technical requirements are precise, code examples are modern and type-safe, and the design language is sophisticated.
The response from the model must always be in English, regardless of the input language.

Return a JSON object with the updated "title", "content", and "tags".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content", "tags"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  const parsed = JSON.parse(text);
  return {
    ...skill,
    title: parsed.title,
    content: parsed.content,
    tags: parsed.tags
  };
}
