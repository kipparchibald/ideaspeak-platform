import { createXai } from '@ai-sdk/xai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || 'demo-key-for-local',
});

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const result = await streamText({
      model: xai('grok-4'),
      messages: [
        {
          role: 'system',
          content: `You are IdeaSpeak, a Grok-powered platform like Lovable.dev for voice-first vibe coding. 
Help users build full apps using natural language (ideally voice). 

Process:
1. Acknowledge the idea enthusiastically.
2. Clarify if needed.
3. Plan the app (features, stack, real estate integrations if relevant).
4. Provide structured steps, code snippets, or full components.
5. Suggest preview, refine via voice, or deploy.

Be encouraging, practical, creative, and tailored to Kipp's real estate + AI ventures. Use Council multi-agent concepts when fitting. 
When generating apps, aim for production-ready Next.js scaffolds. Output in conversational tone unless JSON is explicitly requested.`
        },
        ... (history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ reply: "Error connecting to Grok. Check your XAI_API_KEY in .env.local" }),
      { status: 500 }
    );
  }
}