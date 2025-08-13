import { createOpenAI, generateText } from "@guolei1994/fast-ai";

let openai = createOpenAI()

generateText({
    openai,
    messages: [
        { role: 'system', content: '你是一个流程设计专家，能够根据任务生成结构化的流程定义。' },
        { role: 'user', content: '设计一个agent，这个agent的任务是：写一本关于游戏ECS开发历史的书。' }
    ]
})