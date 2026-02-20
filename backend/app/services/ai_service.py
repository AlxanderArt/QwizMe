import base64
import json
import logging
import re

logger = logging.getLogger("qwizme.ai")

QUIZ_PROMPT = """Analyze this image and generate an educational quiz based on its content.

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "title": "Quiz title based on image content",
  "questions": [
    {
      "question_text": "The question",
      "explanation": "Why the correct answer is right",
      "correct_answer_index": 0,
      "answers": [
        {"text": "Correct answer", "is_correct": true},
        {"text": "Wrong answer 1", "is_correct": false},
        {"text": "Wrong answer 2", "is_correct": false},
        {"text": "Wrong answer 3", "is_correct": false}
      ]
    }
  ]
}

Generate 5-8 questions with 4 answer choices each. Make questions educational and varied in difficulty."""


def _parse_quiz_json(text: str) -> dict:
    text = text.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence_match:
        text = fence_match.group(1).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise ValueError("AI returned an invalid response — please try again")
    if "title" not in data or "questions" not in data:
        raise ValueError("Missing required fields in AI response")
    return data


def generate_quiz_claude(image_bytes: bytes, media_type: str, api_key: str) -> dict:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    b64 = base64.standard_b64encode(image_bytes).decode()
    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                    {"type": "text", "text": QUIZ_PROMPT},
                ],
            }],
        )
    except anthropic.AuthenticationError:
        raise ValueError("Invalid API key")
    except anthropic.APIError as e:
        logger.error("Claude API error: %s", e)
        raise ValueError("AI service error")
    return _parse_quiz_json(message.content[0].text)


def generate_quiz_openai(image_bytes: bytes, media_type: str, api_key: str) -> dict:
    import openai
    client = openai.OpenAI(api_key=api_key)
    b64 = base64.standard_b64encode(image_bytes).decode()
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
                    {"type": "text", "text": QUIZ_PROMPT},
                ],
            }],
        )
    except openai.AuthenticationError:
        raise ValueError("Invalid API key")
    except openai.APIError as e:
        logger.error("OpenAI API error: %s", e)
        raise ValueError("AI service error")
    return _parse_quiz_json(response.choices[0].message.content)


def generate_quiz(image_bytes: bytes, media_type: str, provider: str, api_key: str) -> dict:
    if provider == "claude":
        return generate_quiz_claude(image_bytes, media_type, api_key)
    elif provider == "openai":
        return generate_quiz_openai(image_bytes, media_type, api_key)
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
