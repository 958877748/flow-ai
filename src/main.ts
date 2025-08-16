import { createOpenAI, createTool, generateObject, generateText } from '@guolei1994/fast-ai';
import z from 'zod';
const openai = createOpenAI();
openai.messages = [];

export const add = createTool({
    name: 'add',
    description: '加法计算',
    parameters: z.object({
        a: z.number(),
        b: z.number()
    }),
    execute: async (params) => {
        return `${params.a + params.b}`;
    }
})


// openai.tools = [add as any];

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button') as HTMLButtonElement | null;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
    const chatMessages = document.getElementById('chat-messages') as HTMLDivElement | null;

    function appendMessage(text: string, sender: 'user' | 'ai') {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleSend() {
        if (!chatInput) return;
        const userText = chatInput.value.trim();
        if (!userText) return;
        appendMessage(userText, 'user');
        chatInput.value = '';
        try {
            // 创建用于接收流式数据的元素
            appendMessage('', 'ai');
            const aiMsgDiv = chatMessages?.lastElementChild as HTMLDivElement;

            // 使用流式处理 - 直接调用方法而不是传递回调函数
            await openai.stream(userText, (msg) => {
                if (aiMsgDiv) {
                    aiMsgDiv.textContent += msg;
                    if (chatMessages)
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
        } catch (error) {
            appendMessage('AI出错了: ' + (error instanceof Error ? error.message : String(error)), 'ai');
        }
    }

    if (sendButton && chatInput) {
        sendButton.addEventListener('click', handleSend);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }
});
