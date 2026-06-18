const express = require('express');
const router = express.Router();
const TravelChatbot = require('../chatbot-service');

let chatbotInstance = null;

const getChatbot = async () => {
    if (!chatbotInstance) {
        chatbotInstance = new TravelChatbot();
        await chatbotInstance.setupIntents();
    }
    return chatbotInstance;
};

router.post('/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                response: 'Please provide a message.'
            });
        }

        const chatbot = await getChatbot();
        const result = await chatbot.processMessage(message, sessionId);

        res.json(result);

    } catch (error) {
        console.error('❌ Chatbot error:', error);
        res.status(500).json({
            success: false,
            response: "I apologize, but I'm having trouble processing your request. Please try again.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
