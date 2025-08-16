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
        return `${a + b}`;
    }
});

addTool(add);