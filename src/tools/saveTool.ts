import { createTool } from "@guolei1994/fast-ai";
import { addTool } from "../toolManager";
import fs from "fs/promises";
import path from "path";
import z from "zod";

export const saveTool = createTool({
    name: "saveTool",
    description: "将代码保存到/tools目录下",
    parameters: z.object({
        toolName: z.string().describe("工具名称"),
        content: z.string().describe("TypeScript文件内容")
    }),
    execute: async ({ toolName, content }) => {
        // 确保工具名称以 .ts 结尾
        const fileName = toolName.endsWith('.ts') ? toolName : `${toolName}.ts`;
        // 构建完整的文件路径，保存到 /tools 目录下
        const toolsDir = path.resolve(process.cwd(), 'src', 'tools');
        const fullPath = path.join(toolsDir, fileName);

        try {
            // 确保目录存在
            await fs.mkdir(toolsDir, { recursive: true });
            // 写入文件
            await fs.writeFile(fullPath, content, "utf-8");
            return `文件保存成功：${fullPath}`;
        } catch (error) {
            return `保存失败：${error instanceof Error ? error.message : String(error)}`;
        }
    }
});

addTool(saveTool);