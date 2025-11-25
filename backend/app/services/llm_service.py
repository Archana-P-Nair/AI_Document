# backend/app/services/llm_service.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# === GEMINI CONFIGURATION ===
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is missing! Set it in Vercel Environment Variables.")

genai.configure(api_key=api_key)

# Use gemini-1.5-flash (fast, reliable, and fully available)
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_section_content(topic: str, section_title: str, document_type: str, context: str = "") -> str:
    """Generate content for a single section (docx = paragraphs, pptx = bullets)"""
    try:
        if document_type == "docx":
            prompt = f"""
You are a professional content writer. Generate detailed, well-structured content for a document section.

Document Topic: {topic}
Section Title: {section_title}
{f"Additional Context: {context}" if context else ""}

Requirements:
- Write 3-4 detailed and informative paragraphs
- Use professional, natural language
- Make content specific to the section title
- Do not include the section title in the output
- Only return the content

Generate the content now:
"""
        else:  # pptx
            prompt = f"""
You are a professional presentation writer. Generate content for a PowerPoint slide.

Presentation Topic: {topic}
Slide Title: {section_title}
{f"Additional Context: {context}" if context else ""}

Requirements:
- Create 4-6 concise, impactful bullet points
- Use clear and professional language
- Start each bullet with • or -
- Do not include the slide title
- Only return the bullet points

Generate the content now:
"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error in generate_section_content: {str(e)}")
        raise Exception(f"Failed to generate content: {str(e)}")


def refine_content(original_content: str, refinement_prompt: str, document_type: str) -> str:
    """Refine existing content based on user feedback"""
    try:
        prompt = f"""
You are a professional content editor.

Original Content:
{original_content}

User's Request: {refinement_prompt}

Requirements:
- Follow the user's instructions exactly
- Keep the same format: {"paragraphs" if document_type == "docx" else "bullet points"}
- Maintain professional tone
- Return only the refined content, no explanations

Refined content:
"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error in refine_content: {str(e)}")
        raise Exception(f"Failed to refine content: {str(e)}")


def generate_document_outline(topic: str, document_type: str, num_sections: int = 5) -> list:
    """Generate section/slide titles for a document or presentation"""
    try:
        if document_type == "docx":
            prompt = f"""
You are a professional document planner.
Generate exactly {num_sections} logical section titles for a document.

Topic: {topic}

Requirements:
- Return exactly {num_sections} titles
- One title per line
- No numbers, no bullets, no explanations
- Professional and well-structured

Section titles:
"""
        else:  # pptx
            prompt = f"""
You are a professional presentation planner.
Generate exactly {num_sections} slide titles for a PowerPoint presentation.

Topic: {topic}

Requirements:
- Return exactly {num_sections} titles
- One title per line
- No numbers, no bullets, no explanations
- Clear and engaging

Slide titles:
"""

        response = model.generate_content(prompt)
        lines = [line.strip() for line in response.text.strip().split("\n") if line.strip()]
        return lines[:num_sections]

    except Exception as e:
        print(f"Error in generate_document_outline: {str(e)}")
        raise Exception(f"Failed to generate outline: {str(e)}")
