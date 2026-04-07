import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GenerateOptions } from "../types";

// Helper to get the AI instance with the current API key
function getAI() {
  const manualKey = localStorage.getItem('GEMINI_API_KEY');
  // Vite replaces process.env.GEMINI_API_KEY at build time.
  // We also check import.meta.env as a fallback for some environments.
  const envKey = process.env.GEMINI_API_KEY;
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  const apiKey = manualKey || envKey || viteKey;

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    throw new Error("GEMINI_API_KEY is missing. Please provide it in the settings or set it as an environment variable (GEMINI_API_KEY or VITE_GEMINI_API_KEY).");
  }

  return new GoogleGenAI({ apiKey });
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Respond with 'ok' if you can read this.",
    });
    return response.text?.toLowerCase().includes('ok') ?? false;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}

export async function generateSkills(options: GenerateOptions): Promise<{ 
  title: string, 
  skills: Skill[], 
  detailedPrompt: string, 
  systemOptimization: string, 
  skillChainOptimization: string,
  masterSkill: string
}> {
  try {
    const ai = getAI();
    
    // Optimized: Single high-quality call instead of multiple calls to save API quota
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
        tools: [{ googleSearch: {} }],
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

  } catch (error: any) {
    console.error("Error generating skills:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("API Quota Exceeded. The free tier of Gemini has limits. Please wait a minute and try again.");
    }
    throw error;
  }
}

export async function refineSkill(skill: Skill, projectContext: string, refinementPrompt: string): Promise<Skill> {
  try {
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
        tools: [{ googleSearch: {} }],
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
  } catch (error: any) {
    console.error("Error refining skill:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("API Quota Exceeded. Please wait a minute and try again.");
    }
    throw error;
  }
}
