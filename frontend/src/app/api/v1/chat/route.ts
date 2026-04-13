import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || ''

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    // Fallback: call OpenAI directly when no backend is configured
    const openaiKey = process.env.OPENAI_API_KEY || ''
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

    if (!openaiKey) {
      return NextResponse.json(
        {
          response:
            'The healthcare assistant is not fully configured yet. Please set the OPENAI_API_KEY environment variable in your Vercel project settings.',
          conversation_id: 'fallback',
          disclaimer: 'This is not medical advice. Always consult a qualified healthcare professional.',
        },
        { status: 200 }
      )
    }

    const body = await request.json()
    const userMessage: string = body.message || ''

    const systemPrompt = `You are a medical assistant AI. You provide helpful, accurate information about health and symptoms,
but you ALWAYS emphasize that you are not a substitute for professional medical advice.

Key principles:
1. Never diagnose conditions
2. Always recommend consulting healthcare professionals
3. Provide general information only
4. Be empathetic and supportive
5. Include appropriate medical disclaimers

When discussing symptoms, focus on:
- General information about possible causes
- When to seek medical attention
- Basic self-care measures
- Preventive measures

Always end your response with: "⚕️ Disclaimer: This is general health information only and not a substitute for professional medical advice, diagnosis, or treatment."`

    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!openaiRes.ok) {
        const err = await openaiRes.text()
        return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
      }

      const data = await openaiRes.json()
      const reply = data.choices?.[0]?.message?.content || 'No response generated.'

      return NextResponse.json({
        response: reply,
        conversation_id: body.conversation_id || crypto.randomUUID(),
        disclaimer: 'This is not medical advice. Always consult a qualified healthcare professional.',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  // Proxy to backend
  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
