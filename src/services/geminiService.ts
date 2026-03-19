import { GoogleGenAI, Type } from "@google/genai";
import { Skill, GenerateOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSkills(options: GenerateOptions): Promise<{ title: string, skills: Skill[] }> {
  try {
    // Step 1: Initial Generation
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class expert in instructional design, curriculum development, and learning experience design.
The user wants to build the following project:
"${options.prompt}"

Target Audience: ${options.audience}
Tone: ${options.tone}
Number of Skills to Generate: ${options.numSkills}

Break down the project into a comprehensive list of exactly ${options.numSkills} "skills" or steps required to build it from scratch to a production-ready state.
Each skill should include a detailed prompt/instruction that a developer (or AI) can follow to implement that specific part.
Cover all aspects: Architecture, UI/UX, Frontend, Backend, Database, Deployment, etc.

STRICT RULES:
1. Avoid clichés and generic advice. Be highly specific to the project.
2. Provide practical, concrete examples for each skill (e.g., code snippets, architecture diagrams, or specific tool configurations).
3. Ensure the tone matches the requested tone (${options.tone}) and the complexity matches the target audience (${options.audience}).
4. Keep the text concise but highly actionable.

Return the response as a JSON object with:
1. "title": A short, descriptive title for the project.
2. "skills": An array of objects, each with:
   - "id": A unique string ID (e.g., "frontend-setup").
   - "title": The name of the skill (e.g., "Frontend Architecture & Setup").
   - "content": The detailed markdown content for this skill, including the prompt and instructions. Format it nicely with markdown headings, lists, and code blocks if necessary.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the project.",
            },
            skills: {
              type: Type.ARRAY,
              description: "The list of skills required to build the project.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: {
                    type: Type.STRING,
                    description: "A unique string ID for the skill.",
                  },
                  title: {
                    type: Type.STRING,
                    description: "The name of the skill.",
                  },
                  content: {
                    type: Type.STRING,
                    description: "The detailed markdown content for this skill, including the prompt and instructions.",
                  },
                },
                required: ["id", "title", "content"],
              },
            },
          },
          required: ["title", "skills"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);

    // Step 2: Self-Correction / Refinement
    const reviewResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Review the following curriculum/skills generated for the project "${options.prompt}".
Target Audience: ${options.audience}
Tone: ${options.tone}

Current Skills JSON:
${JSON.stringify(parsed.skills, null, 2)}

Your task as a Master Reviewer:
1. Check if the skills truly meet the user's request.
2. Fix any duplicates or overlapping content.
3. Ensure there are practical examples in every skill.
4. Improve the markdown formatting if it's lacking.
5. Ensure the tone and audience constraints are perfectly met.

Return the IMPROVED list of skills as a JSON array of objects (id, title, content). Do not change the overall structure, just improve the content and titles if necessary.`,
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
      model: "gemini-3-flash-preview",
      contents: `You are an expert instructional designer.
Project Context: "${projectContext}"

Current Skill Content:
Title: ${skill.title}
Content:
${skill.content}

User's Refinement Request: "${refinementPrompt}"

Update the skill's title and content based EXACTLY on the user's request. Keep the markdown formatting clean and professional.
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
