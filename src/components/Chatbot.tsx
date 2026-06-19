import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    data?: any;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "🤖 **AI Lanka Vacations Agent**\n\nHello! I'm your AI travel assistant for Sri Lanka. I can help you with:\n\n• 🏝️ City information & activities\n• 📦 Tour packages & budget planning\n• 🗺️ Distance calculations between cities\n• 🎯 Activity recommendations\n• 🏛️ Cultural & historical sites\n• 🐘 Wildlife experiences\n• 🧗‍♂️ Adventure activities\n• 🏨 Hotel recommendations\n\nWhat would you like to know about your Sri Lanka adventure?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    sessionId: 'user-session'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                isUser: false,
                timestamp: new Date(),
                data: data.data
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "🤖 **AI Lanka Vacations Agent**\n\nI'm currently unavailable. Please make sure the server is running on port 5000 or contact our support team.",
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);

            toast({
                title: "Connection Error",
                description: "Unable to connect to AI travel assistant.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        "Distance from Colombo to Kandy",
        "Packages under $500",
        "Hotels in Anuradhapura",
        "Budget hotels in Kandy",
        "Activities in Ella",
        "Luxury hotels in Galle",
        "Cultural sites",
        "Wildlife experiences"
    ];

    const formatMessage = (text: string) => {
        return text.split('\n').map((line, lineIndex) => (
            <div key={lineIndex} className="mb-1">
                {line.split('**').map((part, partIndex) => {
                    if (partIndex % 2 === 1) {
                        return <strong key={partIndex} className="font-bold">{part}</strong>;
                    }
                    return part;
                })}
            </div>
        ));
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button with Robot Icon */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center animate-gentle-bounce"
                    aria-label="Open AI travel assistant"
                >
                    <div className="relative">
                        <img
                            src="/src/assets/chatbot.webp"
                            alt="AI Assistant"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                                // Fallback to SVG if image not found
                                e.currentTarget.style.display = 'none';
                                const svg = document.createElement('div');
                                svg.innerHTML = `
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-6-8c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm8 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z"/>
                  </svg>
                `;
                                e.currentTarget.parentNode?.appendChild(svg.firstChild as Node);
                            }}
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200 animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white rounded-full p-1">
                                <img
                                    src="/src/assets/chatbot.webp"
                                    alt="AI Assistant"
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const svg = document.createElement('div');
                                        svg.innerHTML = `
                      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-6-8c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm8 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z"/>
                      </svg>
                    `;
                                        e.currentTarget.parentNode?.appendChild(svg.firstChild as Node);
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">AI Travel Agent</h3>
                                <p className="text-xs opacity-90">Lanka Vacations Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white hover:bg-opacity-20"
                            aria-label="Close chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 ${
                                        message.isUser
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {formatMessage(message.text)}
                                    </div>
                                    <div className={`text-xs mt-2 ${
                                        message.isUser ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none p-4 max-w-[85%] border border-gray-200">
                                    <div className="flex space-x-2 items-center">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-3 border-t border-gray-200 pt-3 bg-white">
                            <div className="text-xs text-gray-500 mb-2 font-medium">Try asking:</div>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputMessage(question)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-full transition-colors border border-gray-300"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex space-x-3">
                            <div className="flex-1 relative">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about Sri Lanka travel..."
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    rows={1}
                    style={{ minHeight: '50px', maxHeight: '120px' }}
                />
                                {inputMessage && (
                                    <button
                                        onClick={() => setInputMessage('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl px-5 py-3 transition-colors flex items-center justify-center min-w-[50px] shadow-lg"
                                aria-label="Send message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;