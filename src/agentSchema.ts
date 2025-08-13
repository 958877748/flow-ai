import z from "zod";

export const AgentSchema = z.object({
    think: z.string().min(500).describe("思考内容,输出内心活动"),
    systemPrompt: z.string().optional().describe("这是 Agent 的系统提示，包含核心角色定义和工作流程，确保它能全程按预期执行"),
    tools: z.array(z.string()).optional().describe("所有工具的自然语言描述,包含入参和功能")
});
