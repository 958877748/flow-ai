
import { createAgent } from "../agent";
import { saveTool } from "../tools/saveTool";

export const toolCodeGenerateAgent = createAgent({
  name: "toolCodeGenerateAgent",
  systemPrompt: `你是一个专业的TypeScript工具开发专家，你的任务是根据用户需求生成高质量的工具代码。

这是一个例子：
···typescript
import { createTool } from "@guolei1994/fast-ai";
import { addTool } from "../toolManager";
import z from "zod";

export const add = createTool({
    name: "add",
    description: "执行两个数字的加法运算",
    parameters: z.object({
        a: z.number(),
        b: z.number()
    }),
    execute: async ({ a, b }) => {
        return a + b + '';
    }
});

addTool(add);
···

`,
  tools: [saveTool],
});