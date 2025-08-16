import { createTool, Tool } from "@guolei1994/fast-ai";
import z from "zod";

/**
 * key: toolName
 * value: Tool<z.ZodTypeAny>
 */
const map = new Map<string, Tool<z.ZodTypeAny>>();

/**
 * 
 * @param tool 
 */
export function addTool(tool: Tool<z.ZodTypeAny>) {
    if (map.has(tool.name)) {
        throw new Error(`Tool with name "${tool.name}" already exists.`);
    }
    map.set(tool.name, tool);
}