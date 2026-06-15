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
          content: `You are IdeaSpeak, a Grok-powered platform like Lovable.dev. 
          Help users build full apps using natural language. 
          When they describe an idea, plan it with Grok Build steps, suggest code, and simulate building.
          Integrate voice vibe features, Council multi-agent, and real estate tools.
          Be encouraging and practical for Kipp's projects.`
        },
        ...history.map((m: any) => ({ role: m.role, content: m.content })),
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