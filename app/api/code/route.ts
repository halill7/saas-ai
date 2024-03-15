import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

/*async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });
}

main();*/


const intructionMessage: ChatCompletionMessageParam = {
    role:"system",
    content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
}





export async function POST (
    req: Request
) {
    try {
        const {userId} = auth();
        const body = await req.json();
        const {messages} = body;

        if(!userId){
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if(!openai.apiKey) {
            return new NextResponse("OpenAI API Key is not set", { status: 500 });
        
        }

        if(!messages || !messages.length){
            return new NextResponse("Messages are required", { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages:[intructionMessage, ...messages]
        });

        return NextResponse.json(response.choices[0].message);

    } catch (error) {
        console.error("[CODE_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}