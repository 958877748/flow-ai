import { z } from 'zod';
import { Flow } from 'pocketflow';
import { LLMTextNode, LLMObjectNode, DataProcessNode } from './nodes';

export const FlowDefinitionSchema = z.object({
    task: z.string().describe("任务描述"),
    nodes: z.array(z.object({
        id: z.string().describe("节点ID"),
        type: z.enum(["LLMTextNode", "LLMObjectNode", "DataProcessNode"]).describe("节点类型"),
        config: z.object({
            promptTemplate: z.string().optional().describe("LLM节点的提示模板"),
            systemPrompt: z.string().optional().describe("LLM节点的系统提示"),
            schema: z.string().optional().describe("LLM对象节点的schema（JSON字符串）"),
            processFn: z.string().optional().describe("数据处理函数名称")
        }).describe("节点配置")
    })).describe("节点列表"),
    connections: z.array(z.object({
        from: z.string().describe("起始节点ID"),
        to: z.string().describe("目标节点ID")
    })).describe("节点连接关系")
});

export function createFlowFromDefinition(flowDef: z.infer<typeof FlowDefinitionSchema>): Flow {
    const nodeMap: { [key: string]: any } = {};
    for (const nodeDef of flowDef.nodes) {
        let node: any;
        switch (nodeDef.type) {
            case 'LLMTextNode':
                node = new LLMTextNode({
                    promptTemplate: nodeDef.config.promptTemplate || '',
                    systemPrompt: nodeDef.config.systemPrompt || ''
                });
                break;
            case 'LLMObjectNode':
                node = new LLMObjectNode({
                    schema: FlowDefinitionSchema,
                    promptTemplate: nodeDef.config.promptTemplate || '',
                    systemPrompt: nodeDef.config.systemPrompt || ''
                });
                break;
            case 'DataProcessNode':
                node = new DataProcessNode({
                    processFn: nodeDef.config.processFn || 'identity'
                });
                break;
            default:
                throw new Error(`Unknown node type: ${nodeDef.type}`);
        }
        nodeMap[nodeDef.id] = node;
    }
    for (const conn of flowDef.connections) {
        if (nodeMap[conn.from] && nodeMap[conn.to]) {
            nodeMap[conn.from].next(nodeMap[conn.to]);
        }
    }
    const startNode = nodeMap[flowDef.nodes[0].id];
    if (!startNode) {
        throw new Error("无法找到起始节点");
    }
    return new Flow(startNode);
}
