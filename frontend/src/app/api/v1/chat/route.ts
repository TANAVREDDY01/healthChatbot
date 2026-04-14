import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SYSTEM_PROMPT = `You are a helpful medical assistant AI. You provide helpful, accurate information about health and symptoms.

Key principles:
1. Never diagnose conditions definitively
2. Always recommend consulting healthcare professionals for proper diagnosis
3. Provide general information and self-care tips
4. Be empathetic, clear, and supportive
5. When symptoms sound serious, strongly urge immediate medical attention

When discussing symptoms, cover:
- Possible general causes
- When to seek medical attention urgently
- Basic self-care measures
- Preventive tips

Always end your response with:
"⚕️ Disclaimer: This is general health information only and not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional."`

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      response: 'GEMINI_API_KEY is not configured. Please add it in Vercel Environment Variables.',
      conversation_id: 'fallback',
      disclaimer: 'This is not medical advice.',
    })
  }

  try {
    const body = await request.json()
    const userMessage: string = body.message || ''

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      console.error('Gemini API error:', err)
      return NextResponse.json(
        { response: 'Failed to get a response from the AI. Please try again shortly.' },
        { status: 200 }
      )
    }

    const data = await geminiRes.json()
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I was unable to generate a response. Please try again.'

    return NextResponse.json({
      response: reply,
      conversation_id: body.conversation_id || crypto.randomUUID(),
      disclaimer: 'This is not medical advice. Always consult a qualified healthcare professional.',
    })
  } catch (err: unknown) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { response: `Server error: ${message}` },
      { status: 500 }
    )
  }
}
