import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const JPEG_BYTES = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS" +
  "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ" +
  "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEA" +
  "AAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIh" +
  "MUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6" +
  "Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZ" +
  "mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx" +
  "8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA" +
  "AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAV" +
  "YnLRChYkNOEl8RcYI4Q/RFhHRUYnJCk6ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZn" +
  "aGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrC" +
  "w8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/" +
  "AP0poooA/9k=",
  "base64"
);

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this Indian Aadhaar card image and extract the following information.

Return a STRICT JSON object with no markdown around it with these exact fields:

{
  "full_name": "Name as printed on card",
  "date_of_birth": "DD/MM/YYYY format",
  "gender": "Male/Female/Other",
  "aadhaar_number": "12-digit number (spaces removed)",
  "address": "Full address as printed",
  "is_valid_aadhaar": true/false,
  "confidence": {
    "name": 0.0-1.0,
    "dob": 0.0-1.0,
    "gender": 0.0-1.0,
    "aadhaar_number": 0.0-1.0,
    "address": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "authenticity_markers": {
    "has_government_logo": true/false,
    "has_qr_code": true/false,
    "has_photo": true/false,
    "has_uidai_branding": true/false,
    "text_quality": "high/medium/low",
    "suspected_tampering": true/false
  }
}

Rules:
- If any field is unreadable, set its value to null and confidence to 0
- Remove spaces/dashes from aadhaar_number
- Validate aadhaar_number is exactly 12 digits
- Check for visual authenticity markers (government logos, QR code, UIDAI branding)
- Flag suspected_tampering if document looks altered`,
            },
            {
              inlineData: {
                data: JPEG_BYTES.toString("base64"),
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
    });
    
    console.log("GEMINI RAW TEXT:", response.text);
  } catch (e) {
    console.log("GEMINI ERROR:", e.message);
  }
}

run();
