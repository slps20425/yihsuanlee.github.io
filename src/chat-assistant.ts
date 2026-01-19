import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';

// DOM elements
const chatToggle = document.getElementById('chatToggle') as HTMLButtonElement;
const chatPanel = document.getElementById('chatPanel') as HTMLDivElement;
const chatClose = document.getElementById('chatClose') as HTMLButtonElement;
const chatInput = document.getElementById('chatInput') as HTMLInputElement;
const chatSend = document.getElementById('chatSend') as HTMLButtonElement;
const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;

// Toggle chat panel
chatToggle?.addEventListener('click', () => {
    const isVisible = chatPanel.style.display === 'flex';
    chatPanel.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
        chatInput.focus();
    }
});

chatClose?.addEventListener('click', () => {
    chatPanel.style.display = 'none';
});

// Send message
async function sendMessage() {
    const question = chatInput.value.trim();
    if (!question) return;

    // Add user message
    addMessage(question, 'user');
    chatInput.value = '';
    chatSend.disabled = true;

    // Show typing indicator
    const typingId = addTypingIndicator();

    try {
        // Call Cloud Function
        const queryKnowledge = httpsCallable(functions, 'queryKnowledge');
        const result = await queryKnowledge({ question });

        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Add bot response
        const data = result.data as {
            answer: string;
            sources?: any[];
            isOffTopic?: boolean;
            relevanceScore?: number;
            queriesRemaining?: number;
        };

        addMessage(data.answer, 'bot', data.isOffTopic);

        // Show queries remaining
        if (data.queriesRemaining !== undefined) {
            console.log(`Queries remaining this hour: ${data.queriesRemaining}`);
        }

    } catch (error: any) {
        removeTypingIndicator(typingId);

        if (error.code === 'unauthenticated') {
            addMessage('Please sign in to use the chatbot.', 'bot', true);
        } else if (error.code === 'resource-exhausted') {
            addMessage('⏱️ You have reached the limit of 5 questions per hour. Please try again later.', 'bot', true);
        } else {
            addMessage('Sorry, I encountered an error. Please try again later.', 'bot', true);
        }

        console.error('Chat error:', error);
    } finally {
        chatSend.disabled = false;
        chatInput.focus();
    }
}

chatSend?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function addMessage(content: string, type: 'user' | 'bot', isOffTopic: boolean = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (isOffTopic) {
        contentDiv.classList.add('off-topic');
    }

    if (type === 'bot') {
        // Simple markdown rendering
        contentDiv.innerHTML = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">$1</code>')
            .replace(/\n/g, '<br>');
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator(): string {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = `
    <div class="message-content typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeTypingIndicator(id: string) {
    document.getElementById(id)?.remove();
}
