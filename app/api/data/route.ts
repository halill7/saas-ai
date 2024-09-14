import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {checkApiLimit, increaseApiLimit} from "@/lib/api-limit";
import {checkSubscription} from "@/lib/subscription";

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
    content: "I want you to focus exclusively on data analysis tasks, including interpreting data, running statistical analysis, identifying trends, providing insights from datasets, and suggesting data-driven solutions. Additionally, help us optimize the performance of the Meta ads referred to in the report by identifying key areas for improvement, suggesting strategies, and proposing actionable recommendations. Avoid generating any code or technical implementations, just focus on analyzing the data and delivering insights, explanations, and conclusions."
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

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();

        if (!freeTrial && !isPro) {
            return new NextResponse("Free trial has expired", { status: 403 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages:[intructionMessage, ...messages]
        });

        if(!isPro) {
            await increaseApiLimit();
        }

        return NextResponse.json(response.choices[0].message);

    } catch (error) {
        console.error("[CODE_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}