import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GenerateOptions } from "../types";

// Helper to get the AI instance with the current API key
function getAI() {
  // ONLY use the key the user entered in the UI (stored in localStorage)
  // This ensures the app is local-per-user and doesn't use a permanent system key.
  const apiKey = localStorage.getItem('GEMINI_API_KEY');

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || !apiKey.trim()) {
    throw new Error("API Key missing. Please configure your Gemini API key in the settings menu (Key icon) to use the generator.");
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

export interface RequirementAnalysis {
  requirements: string[];
  edgeCases: string[];
  clarifyingQuestions: string[];
  suggestedStack: string[];
}

export async function analyzeRequirements(prompt: string): Promise<RequirementAnalysis> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the Elite Architect. Your goal is to perform a deep technical analysis of a project request to ensure no detail is missed.
Project Request: "${prompt}"

Analyze this request and identify:
1. Core Functional Requirements (Deep dive).
2. Critical Edge Cases & Potential Technical Debt.
3. Clarifying Questions (If any part of the request is ambiguous).
4. Suggested Elite Tech Stack (Modern, high-performance).

Return a JSON object with: "requirements" (array), "edgeCases" (array), "clarifyingQuestions" (array), "suggestedStack" (array).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          edgeCases: { type: Type.ARRAY, items: { type: Type.STRING } },
          clarifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedStack: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["requirements", "edgeCases", "clarifyingQuestions", "suggestedStack"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Analysis failed");
  return JSON.parse(text);
}

export async function generateSkills(options: GenerateOptions, analysis?: RequirementAnalysis): Promise<{ 
  title: string, 
  skills: Skill[], 
  detailedPrompt: string, 
  systemOptimization: string, 
  skillChainOptimization: string,
  masterSkill: string
}> {
  const ai = getAI();
  
  const analysisContext = analysis ? `
TECHNICAL ANALYSIS CONTEXT:
Requirements: ${analysis.requirements.join(', ')}
Edge Cases: ${analysis.edgeCases.join(', ')}
Suggested Stack: ${analysis.suggestedStack.join(', ')}
` : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: `You are the Elite Vibe Coding Instructor. Your mission is to guide developers in building high-performance skills and architectural mastery through the "vibe coding" philosophy.
Your expertise spans across high-performance distributed systems, cutting-edge frontend engineering, and elite UI/UX design.

The student wants to build the following project:
"${options.prompt}"
${analysisContext}

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

export async function enrichSkills(skills: Skill[], projectContext: string): Promise<Skill[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the Elite Quality Assurance Architect. 
Project Context: "${projectContext}"

Review the following architectural skills and ENRICH them with:
1. Advanced Implementation Details (Specific code patterns, library suggestions).
2. Security Hardening (Specific threats and mitigations).
3. Performance Optimizations (Caching, lazy loading, indexing).
4. Accessibility & UX Best Practices.

Skills to enrich:
${JSON.stringify(skills)}

Return a JSON object with an "enrichedSkills" array containing the updated skills. Maintain the same IDs.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          enrichedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "title", "content", "tags"]
            }
          }
        },
        required: ["enrichedSkills"],
      },
    },
  });

  const text = response.text;
  if (!text) return skills;
  const parsed = JSON.parse(text);
  return parsed.enrichedSkills;
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
