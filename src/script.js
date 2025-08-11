// 引入必要的库
const { Node, Flow } = require('pocketflow');
const { createOpenAI, generateText, generateObject } = require('@guolei1994/fast-ai');
const { z } = require('zod');

// 初始化OpenAI客户端
// 注意：在生产环境中，API密钥应该从环境变量或安全的配置中获取
const API_KEY = ''; // 请在这里填入你的ModelScope API密钥

// 如果没有API密钥，则使用模拟模式
const useMock = !API_KEY;

let client;
if (!useMock) {
    client = createOpenAI({
        // 可以自定义baseURL，默认是https://api-inference.modelscope.cn/v1
        // baseURL: 'https://api-inference.modelscope.cn/v1',
        apiKey: API_KEY
    });
}

// 定义一个用于调用LLM生成文本的节点
class LLMTextNode extends Node {
    constructor(promptTemplate, systemPrompt = '', maxRetries = 1, wait = 0) {
        super(maxRetries, wait);
        this.promptTemplate = promptTemplate;
        this.systemPrompt = systemPrompt;
    }

    async exec(input) {
        const prompt = this.promptTemplate.replace('{{input}}', input || '');

        // 打印调试信息
        console.log('--- LLMTextNode 执行 ---');
        console.log('输入:', input);
        console.log('提示模板:', this.promptTemplate);
        console.log('系统提示:', this.systemPrompt);
        console.log('最终提示:', prompt);

        if (useMock) {
            // 模拟LLM响应
            const mockResponse = `这是对 "${prompt}" 的模拟回复。`;
            console.log('LLM Text Response (模拟):', mockResponse);
            return mockResponse;
        }

        try {
            const { text } = await generateText({
                client,
                model: 'Qwen/Qwen2.5-7B-Instruct', // 使用Qwen模型
                messages: [
                    ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
                    { role: 'user', content: prompt }
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
class LLMObjectNode extends Node {
    constructor(schema, promptTemplate, systemPrompt = '', maxRetries = 1, wait = 0) {
        super(maxRetries, wait);
        this.schema = schema;
        this.promptTemplate = promptTemplate;
        this.systemPrompt = systemPrompt;
    }

    async exec(input) {
        const prompt = this.promptTemplate.replace('{{input}}', input || '');

        // 打印调试信息
        console.log('--- LLMObjectNode 执行 ---');
        console.log('输入:', input);
        console.log('提示模板:', this.promptTemplate);
        console.log('系统提示:', this.systemPrompt);
        console.log('最终提示:', prompt);

        if (useMock) {
            // 模拟LLM响应
            const mockResponse = {
                task: "写一本关于游戏ECS开发历史的书",
                nodes: [
                    {
                        id: "start",
                        type: "DataProcessNode",
                        config: {
                            processFn: "identity"
                        }
                    },
                    {
                        id: "research",
                        type: "LLMTextNode",
                        config: {
                            promptTemplate: "研究游戏ECS架构的历史发展，包括关键人物、技术突破和重要项目。输出一个详细的大纲：{{input}}",
                            systemPrompt: "你是一位游戏开发历史专家，熟悉ECS架构的发展历程。"
                        }
                    },
                    {
                        id: "write",
                        type: "LLMTextNode",
                        config: {
                            promptTemplate: "根据以下大纲撰写一章内容：{{input}}",
                            systemPrompt: "你是一位技术作家，能够将复杂的技术概念以通俗易懂的方式表达。"
                        }
                    }
                ],
                connections: [
                    { from: "start", to: "research" },
                    { from: "research", to: "write" }
                ]
            };
            console.log('LLM Object Response (模拟):', JSON.stringify(mockResponse, null, 2));
            return mockResponse;
        }

        try {
            const { object } = await generateObject({
                client,
                model: 'Qwen/Qwen2.5-7B-Instruct', // 使用Qwen模型
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
class DataProcessNode extends Node {
    constructor(processFn, maxRetries = 1, wait = 0) {
        super(maxRetries, wait);
        this.processFn = processFn;
    }

    async exec(input) {
        // 打印调试信息
        console.log('--- DataProcessNode 执行 ---');
        console.log('输入:', input);
        console.log('处理函数:', this.processFn);

        try {
            // 根据函数名称执行不同的处理逻辑
            let result;
            switch (this.processFn) {
                case 'identity':
                    result = input;
                    break;
                case 'squareArray':
                    result = Array.isArray(input) ? input.map(x => x * x) : [];
                    break;
                case 'sumArray':
                    result = Array.isArray(input) ? input.reduce((a, b) => a + b, 0) : 0;
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
function createFlowFromDefinition(flowDef) {
    console.log('--- 创建流程 ---');
    console.log('流程定义:', JSON.stringify(flowDef, null, 2));

    const nodeMap = {};

    // 创建节点
    for (const nodeDef of flowDef.nodes) {
        let node;
        switch (nodeDef.type) {
            case 'LLMTextNode':
                node = new LLMTextNode(
                    nodeDef.config.promptTemplate || '',
                    nodeDef.config.systemPrompt || ''
                );
                break;
            case 'LLMObjectNode':
                // 为了简化，我们直接使用预定义的schema
                node = new LLMObjectNode(
                    FlowDefinitionSchema,
                    nodeDef.config.promptTemplate || '',
                    nodeDef.config.systemPrompt || ''
                );
                break;
            case 'DataProcessNode':
                node = new DataProcessNode(nodeDef.config.processFn || 'identity');
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
async function designFlowByLLM(task) {
    console.log('--- LLM设计流程 ---');
    console.log('任务:', task);

    const prompt = `
你的任务是为以下任务设计一个执行流程：
${task}

请生成一个符合以下Zod Schema的JSON格式的流程定义：

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

要求：
1. 节点ID应该简洁且具有描述性
2. 节点类型必须是["LLMTextNode", "LLMObjectNode", "DataProcessNode"]之一
3. 对于LLMTextNode和LLMObjectNode，需要提供promptTemplate
4. DataProcessNode的processFn可以是任何合理的处理函数名称
5. connections定义了节点之间的执行顺序
6. 只返回JSON，不要包含其他内容

示例输出：
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

    if (useMock) {
        // 模拟LLM响应
        const mockResponse = {
            task: "写一本关于游戏ECS开发历史的书",
            nodes: [
                {
                    id: "start",
                    type: "DataProcessNode",
                    config: {
                        processFn: "identity"
                    }
                },
                {
                    id: "research",
                    type: "LLMTextNode",
                    config: {
                        promptTemplate: "研究游戏ECS架构的历史发展，包括关键人物、技术突破和重要项目。输出一个详细的大纲：{{input}}",
                        systemPrompt: "你是一位游戏开发历史专家，熟悉ECS架构的发展历程。"
                    }
                },
                {
                    id: "write",
                    type: "LLMTextNode",
                    config: {
                        promptTemplate: "根据以下大纲撰写一章内容：{{input}}",
                        systemPrompt: "你是一位技术作家，能够将复杂的技术概念以通俗易懂的方式表达。"
                    }
                }
            ],
            connections: [
                { from: "start", to: "research" },
                { from: "research", to: "write" }
            ]
        };
        console.log('LLM流程设计 (模拟):', JSON.stringify(mockResponse, null, 2));
        return mockResponse;
    }

    try {
        const { object } = await generateObject({
            client,
            model: 'Qwen/Qwen2.5-7B-Instruct',
            schema: FlowDefinitionSchema,
            prompt: prompt,
            system: "你是一个流程设计专家，能够根据任务生成结构化的流程定义。"
        });

        console.log('LLM流程设计:', JSON.stringify(object, null, 2));
        return object;
    } catch (error) {
        console.error('LLM流程设计失败:', error);
        throw error;
    }
}

// 主函数
async function main(task) {
    try {
        // 清空输出容器
        document.getElementById('output-container').innerHTML = '';

        // 添加日志到页面
        function addLog(message) {
            const outputContainer = document.getElementById('output-container');
            const logElement = document.createElement('pre');
            logElement.textContent = message;
            outputContainer.appendChild(logElement);
            // 滚动到底部
            outputContainer.scrollTop = outputContainer.scrollHeight;
        }

        // 重写console.log以同时输出到页面
        const originalLog = console.log;
        console.log = function (...args) {
            originalLog.apply(console, args);
            addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
        };

        // 重写console.error以同时输出到页面
        const originalError = console.error;
        console.error = function (...args) {
            originalError.apply(console, args);
            addLog('ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '));
        };

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

        // 恢复原始console.log
        console.log = originalLog;
        console.error = originalError;
    } catch (error) {
        console.error('执行出错:', error);
        // 恢复原始console.log
        console.log = originalLog;
        console.error = originalError;
    }
}

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('run-button');
    const taskInput = document.getElementById('task-input');

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
});