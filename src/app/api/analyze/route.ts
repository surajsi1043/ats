// @ts-ignore
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const Uint8ArrayBuffer = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data: Uint8ArrayBuffer,
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0, 
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const jd_text = formData.get("jd_text") as string;

    if (!file || !jd_text) {
      return NextResponse.json({ error: "Missing resume or JD" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resume_text = await extractTextFromPDF(buffer);

    // FIXED: Use a supported 2026 model identifier. 
    // "gemini-1.5-flash" is retired; use "gemini-2.5-flash" or "gemini-3-flash".
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