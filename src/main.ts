import { createOpenAI, createTool, generateObject, generateText } from '@guolei1994/fast-ai';
import z from 'zod';

async function main(task: string) {
    try {
        const openai = createOpenAI();
        openai.messages = [];
        let add = createTool({
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
        openai.tools = [add as any];
        const msg = await openai.chat(task);
        return msg;
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button') as HTMLButtonElement | null;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
    const chatMessages = document.getElementById('chat-messages');

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
            appendMessage('正在思考...', 'ai');
            const aiMsgDiv = chatMessages?.lastElementChild as HTMLDivElement;
            const aiReply = await main(userText);
            if (aiMsgDiv) aiMsgDiv.textContent = typeof aiReply === 'string' ? aiReply : JSON.stringify(aiReply, null, 2);
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
