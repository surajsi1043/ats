import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { extractText } from "unpdf";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function extractTextFromPDF(data: Uint8Array): Promise<string> {
  try {
    // unpdf requires Uint8Array specifically
    const { text } = await extractText(data);
    return text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const jd_text = formData.get("jd_text") as string;

    if (!file || !jd_text) {
      return NextResponse.json({ error: "Missing resume or JD" }, { status: 400 });
    }

    // Convert the file's ArrayBuffer to a Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const resume_text = await extractTextFromPDF(uint8Array);

    // FIXED: Using a current supported model identifier for 2026
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert Indian Technical Recruiter. Analyze this resume against the Job Description (JD).
      
      JD: ${jd_text}
      Resume: ${resume_text}

      Provide the response strictly in JSON format:
      {
        "score": (0-100),
        "missing_keywords": ["tech skill", "soft skill"],
        "indian_market_tips": ["specific advice for Indian market like notice period, CGPA, etc."],
        "verdict": "Strong Match" | "Moderate Match" | "Weak Match"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean JSON response from AI Markdown formatting
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanedJson));
  } catch (error: any) {
    console.error("Analysis error:", error);
    // Enhanced error reporting to distinguish between 404 (retired model) and 429 (quota)
    return NextResponse.json(
      { error: `AI Analysis failed: ${error.message || "Unknown error"}` }, 
      { status: error.status || 500 }
    );
  }
}