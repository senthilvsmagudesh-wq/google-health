import { GoogleGenAI, Type } from "@google/genai";
import { ToolId } from '../types';

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MODEL_NAME = 'gemini-2.5-flash';

const SAFETY_DISCLAIMER = `
CRITICAL SAFETY INSTRUCTION:
You are an AI medical assistant. 
1. Your output is for informational purposes only.
2. NEVER provide a definitive medical diagnosis.
3. ALWAYS use safe wording like "possible indications", "may suggest", "associated with".
4. ALWAYS conclude with a disclaimer: "This is AI-generated information, not medical advice. Consult a healthcare professional."
`;

export const analyzeHealthData = async (
  input: string,
  inputType: string,
  tool: ToolId
): Promise<string> => {
  let prompt = `${SAFETY_DISCLAIMER}\n\nInput Type: ${inputType}\nData:\n${input}\n\n`;

  let responseSchema = undefined;

  switch (tool) {
    case 'summary':
      prompt += `
      Analyze the provided health data and generate a "Patient-Friendly Health Report".
      Goals: SIMPLE (5th-grade level), VISUAL (emojis), ACTIONABLE, EMPATHETIC.

      Structure the response as a JSON object matching the SimplifiedReport interface.
      `;
      
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          patientInfo: {
            type: Type.OBJECT,
            properties: {
              age: { type: Type.STRING, nullable: true },
              duration: { type: Type.STRING, nullable: true }
            },
            nullable: true
          },
          simpleSummary: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              match: { type: Type.STRING }
            }
          },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                test: { type: Type.STRING },
                result: { type: Type.STRING },
                meaning: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['ok', 'attention', 'warning'] }
              }
            }
          },
          riskAssessment: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              description: { type: Type.STRING },
              colorCode: { type: Type.STRING, enum: ['green', 'yellow', 'red'] }
            }
          },
          potentialCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionableAdvice: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          visualSummary: {
            type: Type.OBJECT,
            properties: {
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              labs: { type: Type.ARRAY, items: { type: Type.STRING } },
              overall: { type: Type.STRING }
            }
          }
        }
      };
      break;

    case 'risk':
      prompt += `
      Analyze the data for health risks.
      Output a structured JSON response designed for a non-medical user.
      1. Overall Risk: Low/Mild/Moderate/High with a simple description.
      2. Attention Items: What is happening now (e.g., Fever, High WBC) and what it means.
      3. Future Risks: What to watch out for if symptoms worsen.
      4. Simple Actions: List of 4-6 simple home care steps.
      5. Urgent Warnings: When to see a doctor immediately.
      `;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallRisk: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ['Low', 'Mild', 'Moderate', 'High'] },
              description: { type: Type.STRING },
              colorCode: { type: Type.STRING, enum: ['green', 'yellow', 'orange', 'red'] }
            }
          },
          attentionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING },
                meaning: { type: Type.STRING }
              }
            }
          },
          futureRisks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                risk: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          simpleActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          urgentWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      };
      break;

    case 'insights': // Formerly Treatment
      prompt += "Provide general lifestyle insights, hydration tips, and sleep advice relevant to the findings. Do NOT prescribe medication. Focus on holistic wellness and recovery.";
      break;

    case 'recommendations':
      prompt += "Provide a checklist of specific 'Do's and Don'ts' for the patient based on their condition. Keep it practical and daily-life oriented.";
      break;

    case 'warning_signs':
      prompt += "List ONLY the specific warning signs or red flags that would indicate the patient needs to go to the hospital or see a doctor immediately. Be clear and direct.";
      break;

    case 'nutrition':
      prompt += "Analyze the data for any nutritional needs. If specific vitamins (like D, B12, Iron) are low, suggest food sources. If infection is present, suggest immune-boosting foods. Keep it simple.";
      break;

    case 'breakdown':
      prompt += "Break down the medical report or text into simple, easy-to-understand terms for a layman. Explain medical jargon found in the input.";
      break;

    case 'compare':
      prompt += "If multiple data points are present (e.g. current vs previous), compare them simply. If only one, compare against standard healthy baselines. Highlight differences.";
      break;

    default:
      prompt += "Analyze the provided health data.";
  }

  try {
    const config: any = {
        systemInstruction: "You are a helpful, safety-conscious AI medical assistant. Your goal is to make health information accessible and easy to understand for everyone.",
    };

    if (responseSchema) {
        config.responseMimeType = "application/json";
        config.responseSchema = responseSchema;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: config
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing data. Please try again.";
  }
};
