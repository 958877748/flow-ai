import { createTool } from "langchain/tools";
import fs from "fs/promises";
import path from "path";
import z from "zod";

export const saveTool = createTool({
    name: "saveTool",
    description: "将TypeScript代码保存到固定目录下的指定文件中。如果文件路径中包含目录，则会自动创建相应的目录结构。",
    parameters: z.object({
        filePath: z.string().describe("文件路径（相对固定目录），例如：'utils/math.ts'"),
        content: z.string().describe("TypeScript文件内容")
    }),
    execute: async ({ filePath, content }) => {
        // 设置固定目录（可根据需要修改）
        const baseDir = path.resolve(process.cwd(), "saved_ts_files");
        const fullPath = path.join(baseDir, filePath);
        
        try {
            // 确保文件是TS格式
            if (!filePath.endsWith(".ts")) {
                throw new Error("文件必须以 .ts 结尾");
            }
            
            // 创建目录结构（如果需要）
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            
            // 写入文件
            await fs.writeFile(fullPath, content, "utf-8");
            return `文件保存成功：${fullPath}`;
        } catch (error) {
            return `保存失败：${error instanceof Error ? error.message : String(error)}`;
        }
    }
});
