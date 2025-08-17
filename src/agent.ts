import { createOpenAI, generateText, Tool } from "@guolei1994/fast-ai";

import z, { ZodTypeAny } from "zod";
let openai = createOpenAI()

generateText({
    openai,
    messages: [
        { role: 'system', content: '你是一个流程设计专家，能够根据任务生成结构化的流程定义。' },
        { role: 'user', content: '设计一个agent，这个agent的任务是：写一本关于游戏ECS开发历史的书。' }
    ]
})

export class Agent {
    name: string = 'Agent';
    systemPrompt: string = ''
    tools: Tool<ZodTypeAny>[] = [];
}

type createAgentOption = {
    name: string;
    systemPrompt?: string;
    tools?: Tool<ZodTypeAny>[];
}
export function createAgent(opt: createAgentOption) {
    const agent = new Agent()
    agent.name = opt.name;
    agent.systemPrompt = opt.systemPrompt ? opt.systemPrompt : '';
    agent.tools = opt.tools ? opt.tools : [];
    return agent;
}

export const AgentSchema = z.object({
    think: z.string().min(500).describe("思考内容,输出内心活动"),
    systemPrompt: z.string().optional().describe("这是 Agent 的系统提示，包含核心角色定义和工作流程，确保它能全程按预期执行"),
    tools: z.array(z.string()).optional().describe("所有工具的自然语言描述,包含入参和功能")
});
