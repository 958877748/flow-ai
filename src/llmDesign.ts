import { createOpenAI, generateObject } from '@guolei1994/fast-ai';
import { FlowDefinitionSchema } from './flowDefinition';

const openai = createOpenAI();

export async function designFlowByLLM(task: string): Promise<any> {
    const prompt = `
你的任务是为以下任务设计一个执行流程：
${task}
要求：
1. 节点ID应该简洁且具有描述性
2. 节点类型必须是[\"LLMTextNode\", \"LLMObjectNode\", \"DataProcessNode\"]之一
3. 对于LLMTextNode和LLMObjectNode，需要提供promptTemplate
4. DataProcessNode的processFn可以是任何合理的处理函数名称
5. connections定义了节点之间的执行顺序
6. 只返回JSON，不要包含其他内容
`;
    try {
    } catch (error) {
        throw error;
    }
}
