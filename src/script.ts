// 引入必要的库
import { Node, Flow } from 'pocketflow';
import { createOpenAI, generateText, generateObject } from '@guolei1994/fast-ai';
import { z } from 'zod';

const useMock = false;

let client = createOpenAI();

// 定义一个用于调用LLM生成文本的节点
interface LLMTextNodeConfig {
    promptTemplate: string;
    systemPrompt?: string;
    maxRetries?: number;
    wait?: number;
}

class LLMTextNode extends Node {
    private promptTemplate: string;
    private systemPrompt: string;

    constructor(config: LLMTextNodeConfig) {
        const { promptTemplate, systemPrompt = '', maxRetries = 1, wait = 0 } = config;
        super(maxRetries, wait);
        this.promptTemplate = promptTemplate;
        this.systemPrompt = systemPrompt;
    }

    async exec(input: string): Promise<string> {
        const prompt = this.promptTemplate.replace('{{input}}', input || '');

        // 打印调试信息
        console.log('--- LLMTextNode 执行 ---');
        console.log('输入:', input);
        console.log('提示模板:', this.promptTemplate);
        console.log('系统提示:', this.systemPrompt);
        console.log('最终提示:', prompt);

        try {
            if (!client) {
                throw new Error('AI client is not initialized');
            }

            const text = await generateText({
                model: client(process.env.OPENAI_MODEL as any),
                messages: [
                    { role: 'system' as const, content: this.systemPrompt },
                    { role: 'user' as const, content: prompt }
                ]
            });

            console.log('LLM Text Response:', text);
            return text;
        } catch (error) {
            console.error('LLM调用失败:', error);
            throw error;
        }
    }
}

// 定义一个用于调用LLM生成结构化数据的节点
interface LLMObjectNodeConfig {
    schema: z.ZodSchema;
    promptTemplate: string;
    systemPrompt?: string;
    maxRetries?: number;
    wait?: number;
}

class LLMObjectNode extends Node {
    private schema: z.ZodSchema;
    private promptTemplate: string;
    private systemPrompt: string;

    constructor(config: LLMObjectNodeConfig) {
        const { schema, promptTemplate, systemPrompt = '', maxRetries = 1, wait = 0 } = config;
        super(maxRetries, wait);
        this.schema = schema;
        this.promptTemplate = promptTemplate;
        this.systemPrompt = systemPrompt;
    }

    async exec(input: string): Promise<any> {
        const prompt = this.promptTemplate.replace('{{input}}', input || '');

        // 打印调试信息
        console.log('--- LLMObjectNode 执行 ---');
        console.log('输入:', input);
        console.log('提示模板:', this.promptTemplate);
        console.log('系统提示:', this.systemPrompt);
        console.log('最终提示:', prompt);

        try {
            const object = await generateObject({
                model: client(process.env.OPENAI_MODEL as any),
                schema: this.schema,
                prompt: prompt,
                system: this.systemPrompt
            });

            console.log('LLM Object Response:', JSON.stringify(object, null, 2));
            return object;
        } catch (error) {
            console.error('LLM对象生成失败:', error);
            throw error;
        }
    }
}

// 定义一个用于数据处理的节点
interface DataProcessNodeConfig {
    processFn: string;
    maxRetries?: number;
    wait?: number;
}

class DataProcessNode extends Node {
    private processFn: string;

    constructor(config: DataProcessNodeConfig) {
        const { processFn, maxRetries = 1, wait = 0 } = config;
        super(maxRetries, wait);
        this.processFn = processFn;
    }

    async exec(input: any): Promise<any> {
        // 打印调试信息
        console.log('--- DataProcessNode 执行 ---');
        console.log('输入:', input);
        console.log('处理函数:', this.processFn);

        try {
            // 根据函数名称执行不同的处理逻辑
            let result: any;
            switch (this.processFn) {
                case 'identity':
                    result = input;
                    break;
                case 'squareArray':
                    result = Array.isArray(input) ? input.map((x: number) => x * x) : [];
                    break;
                case 'sumArray':
                    result = Array.isArray(input) ? input.reduce((a: number, b: number) => a + b, 0) : 0;
                    break;
                default:
                    result = input;
            }

            console.log('Data Process Result:', result);
            return result;
        } catch (error) {
            console.error('数据处理失败:', error);
            throw error;
        }
    }
}

// 定义流程定义的Zod Schema
const FlowDefinitionSchema = z.object({
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

// 根据流程定义创建PocketFlow实例
function createFlowFromDefinition(flowDef: z.infer<typeof FlowDefinitionSchema>): Flow {
    console.log('--- 创建流程 ---');
    console.log('流程定义:', JSON.stringify(flowDef, null, 2));

    const nodeMap: { [key: string]: Node } = {};

    // 创建节点
    for (const nodeDef of flowDef.nodes) {
        let node: Node;
        switch (nodeDef.type) {
            case 'LLMTextNode':
                node = new LLMTextNode({
                    promptTemplate: nodeDef.config.promptTemplate || '',
                    systemPrompt: nodeDef.config.systemPrompt || ''
                });
                break;
            case 'LLMObjectNode':
                // 为了简化，我们直接使用预定义的schema
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
        console.log(`创建节点: ${nodeDef.id} (${nodeDef.type})`);
    }

    // 连接节点
    for (const conn of flowDef.connections) {
        if (nodeMap[conn.from] && nodeMap[conn.to]) {
            nodeMap[conn.from].next(nodeMap[conn.to]);
            console.log(`连接节点: ${conn.from} -> ${conn.to}`);
        } else {
            console.warn(`无法连接节点: ${conn.from} -> ${conn.to}`);
        }
    }

    // 创建流程
    const startNode = nodeMap[flowDef.nodes[0].id];
    if (!startNode) {
        throw new Error("无法找到起始节点");
    }

    console.log('流程创建完成');
    return new Flow(startNode);
}

// 让LLM设计流程的函数
async function designFlowByLLM(task: string): Promise<z.infer<typeof FlowDefinitionSchema>> {
    console.log('--- LLM设计流程 ---');
    console.log('任务:', task);

    const prompt = `
你的任务是为以下任务设计一个执行流程：
${task}

要求：
1. 节点ID应该简洁且具有描述性
2. 节点类型必须是["LLMTextNode", "LLMObjectNode", "DataProcessNode"]之一
3. 对于LLMTextNode和LLMObjectNode，需要提供promptTemplate
4. DataProcessNode的processFn可以是任何合理的处理函数名称
5. connections定义了节点之间的执行顺序
6. 只返回JSON，不要包含其他内容

一个示例：
{
  "task": "计算一组数字的平方并求和",
  "nodes": [
    {
      "id": "start",
      "type": "DataProcessNode",
      "config": {
        "processFn": "identity"
      }
    },
    {
      "id": "square",
      "type": "DataProcessNode",
      "config": {
        "processFn": "squareArray"
      }
    },
    {
      "id": "sum",
      "type": "DataProcessNode",
      "config": {
        "processFn": "sumArray"
      }
    }
  ],
  "connections": [
    {
      "from": "start",
      "to": "square"
    },
    {
      "from": "square",
      "to": "sum"
    }
  ]
}
`;

    try {
        const object = await generateObject({
            model: client(process.env.OPENAI_MODEL as any),
            schema: FlowDefinitionSchema,
            prompt: prompt,
            system: "你是一个流程设计专家，能够根据任务生成结构化的流程定义。"
        });

        console.log('LLM流程设计:', JSON.stringify(object, null, 2));
        return object as any;
    } catch (error) {
        console.error('LLM流程设计失败:', error);
        throw error;
    }
}

// 主函数
async function main(task: string) {
    // 重写console.log以同时输出到页面
    const originalLog = console.log;
    const originalError = console.error;

    // 添加日志到页面
    function addLog(message: string) {
        const outputContainer = document.getElementById('output-container');
        if (outputContainer) {
            const logElement = document.createElement('pre');
            logElement.textContent = message;
            outputContainer.appendChild(logElement);
            // 滚动到底部
            outputContainer.scrollTop = outputContainer.scrollHeight;
        }
    }

    console.log = function (...args: any[]) {
        originalLog(...args);
        addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    };

    console.error = function (...args: any[]) {
        originalError(...args);
        addLog('ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    };

    try {
        // 清空输出容器
        const outputContainer = document.getElementById('output-container');
        if (outputContainer) {
            outputContainer.innerHTML = '';
        }

        // 打印开始信息
        console.log('=== 开始执行任务 ===');
        console.log('任务:', task);

        // 让LLM设计流程
        console.log(`开始为任务 "${task}" 设计流程...`);
        const flowDefinition = await designFlowByLLM(task);

        // 根据流程定义创建PocketFlow实例
        const flow = createFlowFromDefinition(flowDefinition);

        // 执行流程
        console.log(`开始执行任务: ${flowDefinition.task}`);
        const result = await flow.run(task);
        console.log('任务执行完成，最终结果:', result);
        console.log('=== 任务执行结束 ===');
    } catch (error) {
        console.error('执行出错:', error);
    } finally {
        // 恢复原始console.log
        console.log = originalLog;
        console.error = originalError;
    }
}

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('run-button') as HTMLButtonElement | null;
    const taskInput = document.getElementById('task-input') as HTMLInputElement | null;

    if (runButton && taskInput) {
        runButton.addEventListener('click', () => {
            const task = taskInput.value.trim();
            if (task) {
                main(task);
            } else {
                alert('请输入任务');
            }
        });

        // 默认任务
        taskInput.value = '写一本关于游戏ECS开发历史的书';
    }
});