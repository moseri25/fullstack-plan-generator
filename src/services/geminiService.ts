import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GenerateOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSkills(options: GenerateOptions): Promise<{ 
  title: string, 
  skills: Skill[], 
  detailedPrompt: string, 
  systemOptimization: string, 
  skillChainOptimization: string,
  masterSkill: string
}> {
  try {
    // Step 1: Initial Generation
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Use Pro for higher quality
      contents: `You are a Principal Software Architect and Lead Product Designer at a world-class technology firm. 
Your expertise spans across high-performance distributed systems, cutting-edge frontend engineering, and elite UI/UX design.

The user wants to build the following project:
"${options.prompt}"

Target Audience: ${options.audience}
Tone: ${options.tone}
Number of Skills to Generate: ${options.numSkills}

Your task is to architect this project at a professional, production-ready level. Avoid all generic, bland, or "tutorial-style" content. 
Every "skill" or step must represent the absolute best practices in the industry today.

Break down the project into exactly ${options.numSkills} elite "skills" or architectural phases.
Cover the entire lifecycle: 
1. High-Level Architecture & System Design (DDD, Clean Architecture, Scalability)
2. Elite UI/UX Design System (Atomic Design, Accessibility, Motion, Typography)
3. Advanced Frontend Engineering (State Management, Performance Optimization, Component Architecture)
4. Robust Backend & API Design (Security, Rate Limiting, Documentation, Type Safety)
5. Infrastructure & DevOps (CI/CD, Observability, Cloud-Native patterns)

In addition to the skills, you MUST generate:
1. "detailedPrompt": A master-level, full-stack prompt. This should be a comprehensive "Project Specification" that an elite AI or developer can use to build the entire system. Include data models, API contracts, and design tokens.
2. "systemOptimization": A deep-dive technical optimization strategy. Focus on low-latency, high-availability, security hardening, and cost-efficiency.
3. "skillChainOptimization": A strategic execution roadmap. Explain the dependency graph of the skills, why this specific order is critical for a professional build, and how each phase feeds into the next.
4. "masterSkill": A meta-prompt or "Skill Master". This is the ultimate orchestrator skill that provides precise instructions to an AI model on *when* and *how* to use the other generated skills to achieve optimal, full-stack, production-level development. It should conquer all the skills created and guide the AI to a state of optimal development.

STRICT PROFESSIONAL RULES:
1. NO GENERIC ADVICE. Be hyper-specific to the project's unique challenges.
2. ELITE CODE: Any code snippets must be modern, type-safe, and follow industry-standard style guides (e.g., TypeScript, Tailwind CSS, Clean Code).
3. DESIGN EXCELLENCE: Describe the UI/UX with precision. Use terms like "fluid transitions," "intentional whitespace," "semantic hierarchy," and "design tokens."
4. DEPTH: Each skill must feel like a senior engineer's briefing, not a beginner's guide.
5. LANGUAGE: The response from the model must always be in English, regardless of the input language.

Return the response as a JSON object with:
1. "title": A sophisticated, professional title for the project.
2. "detailedPrompt": The master-level full-stack prompt (markdown).
3. "systemOptimization": The technical optimization strategy (markdown).
4. "skillChainOptimization": The strategic execution roadmap (markdown).
5. "masterSkill": The ultimate orchestrator skill instructions (markdown).
6. "skills": An array of objects, each with:
   - "id": A unique, semantic string ID.
   - "title": A professional, high-level name for the skill.
   - "content": The elite-level markdown content. Use professional headings, clear technical requirements, and high-quality code examples.`,
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
                    description: "The elite-level markdown content for this skill.",
                  },
                },
                required: ["id", "title", "content"],
              },
            },
          },
          required: ["title", "detailedPrompt", "systemOptimization", "skillChainOptimization", "masterSkill", "skills"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);

    // Step 2: Self-Correction / Refinement by an even more critical reviewer
    const reviewResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a Senior Technical Reviewer and Quality Assurance Lead. 
Review the following architectural plan for the project "${options.prompt}".

Current Skills JSON:
${JSON.stringify(parsed.skills, null, 2)}

Your task is to ELIMINATE BLANDNESS and GENERIC CONTENT.
1. If a skill feels like a generic tutorial, rewrite it to be a professional engineering specification.
2. Ensure every skill has a "Technical Requirements" section and a "Professional Tip" or "Architectural Note".
3. Improve the visual hierarchy of the markdown. Use bolding, lists, and code blocks effectively.
4. Ensure the code examples are of the highest quality (Type-safe, modern patterns).
5. Verify that the tone is "${options.tone}" and the depth matches "${options.audience}".
6. LANGUAGE: The response from the model must always be in English, regardless of the input language.

Return the IMPROVED list of skills as a JSON array of objects (id, title, content).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["id", "title", "content"],
          },
        },
      },
    });

    const reviewText = reviewResponse.text;
    if (!reviewText) return parsed; // Fallback to original if review fails

    const improvedSkills = JSON.parse(reviewText);
    return {
      title: parsed.title,
      detailedPrompt: parsed.detailedPrompt,
      systemOptimization: parsed.systemOptimization,
      skillChainOptimization: parsed.skillChainOptimization,
      masterSkill: parsed.masterSkill,
      skills: improvedSkills
    };

  } catch (error) {
    console.error("Error generating skills:", error);
    throw error;
  }
}

export async function refineSkill(skill: Skill, projectContext: string, refinementPrompt: string): Promise<Skill> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a Principal Software Architect and Lead Product Designer.
Project Context: "${projectContext}"

Current Architectural Specification:
Title: ${skill.title}
Content:
${skill.content}

Stakeholder Refinement Request: "${refinementPrompt}"

Your task is to update this technical specification based on the stakeholder's request. 
Maintain the elite, professional standard. Ensure all technical requirements are precise, code examples are modern and type-safe, and the design language is sophisticated.
The response from the model must always be in English, regardless of the input language.

Return a JSON object with the updated "title" and "content".`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    return {
      ...skill,
      title: parsed.title,
      content: parsed.content
    };
  } catch (error) {
    console.error("Error refining skill:", error);
    throw error;
  }
}
