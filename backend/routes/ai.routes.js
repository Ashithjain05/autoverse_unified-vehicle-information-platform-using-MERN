import express from 'express';
import dotenv from 'dotenv';
import { collections } from '../config/database.js';
import LLMService from '../services/llm.service.js';

dotenv.config();

const router = express.Router();
const llmService = new LLMService();

/**
 * AI Chatbot endpoint
 */
// Mock data for hard fallback if everything else fails
const MOCK_VEHICLES = [
    { brand: 'Maruti', model: 'Swift', type: 'car', price: 600000 },
    { brand: 'Hyundai', model: 'Creta', type: 'car', price: 1100000 },
    { brand: 'Tata', model: 'Nexon', type: 'car', price: 800000 },
    { brand: 'Royal Enfield', model: 'Classic 350', type: 'bike', price: 190000 }
];

// Smart Local Chatbot Implementation (Fallback if OpenAI fails or key is default)
async function handleLocalQuery(message) {
    const lowerMessage = message.toLowerCase();

    try {
        const vehiclesCollection = collections.vehicles ? collections.vehicles() : null;

        // 0. Website Identity
        if (lowerMessage.includes('website') || lowerMessage.includes('autoverse')) {
            return "This is AutoVerse! 🚗✨ Your premium destination for discovering and comparing the best Cars and Bikes. We help you find your dream vehicle and connect you with authorized showrooms.";
        }

        // 1. Check for specific brands in DB if available
        if (vehiclesCollection) {
            const distinctBrands = await vehiclesCollection.distinct('brand');
            const foundBrand = distinctBrands.find(b => lowerMessage.includes(b.toLowerCase()));
            if (foundBrand) {
                const brandVehicles = await vehiclesCollection.find({ brand: foundBrand }).limit(3).toArray();
                const models = brandVehicles.map(v => v.model);
                return `We have some great ${foundBrand} vehicles available, such as the ${models.join(', ')}. Would you like to see details for any of these?`;
            }
        }

        // 2. Generic Helpful Responses
        if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return "Hello! I'm your Autoverse assistant. I can help you find cars, bikes, compare specs, or find local showrooms. What can I do for you today?";
        }

        if (lowerMessage.includes('showroom') || lowerMessage.includes('contact')) {
            return "You can find authorized showrooms and their WhatsApp contact numbers on every vehicle's detail page. Just click on a vehicle to see more!";
        }

        return "I'm looking into that for you. You can browse our full collection on the 'Vehicles' page, where you can filter by brand and budget.";

    } catch (error) {
        console.error('Local chatbot error:', error);
        return "I'm here to help! Try asking about specific brands like 'Tata' or 'BMW', or ask about 'Showrooms'.";
    }
}

router.post('/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        let aiMessage;

        // Try AI first
        if (llmService.enabled) {
            try {
                // Get small context from DB to help AI
                let context = [];
                if (collections.vehicles) {
                    context = await collections.vehicles().find({}).limit(10).toArray();
                }

                aiMessage = await llmService.generateChatResponse(message, context);
            } catch (err) {
                console.warn('AI Chat failed, falling back to local:', err.message);
            }
        }

        // Fallback to local logic if AI is disabled or failed
        if (!aiMessage) {
            aiMessage = await handleLocalQuery(message);
        }

        res.json({
            success: true,
            data: {
                message: aiMessage,
                conversationId: conversationId || 'default'
            }
        });

    } catch (error) {
        console.error('AI route error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
