import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Service for processing vehicle data
 * Uses OpenAI to clean, normalize, and enhance scraped data
 */
class LLMService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        this.enabled = !!apiKey && apiKey !== 'your-openai-key-here';

        if (this.enabled) {
            this.openai = new OpenAI({ apiKey });
        } else {
            console.log('⚠️  OpenAI API Key missing - running in fallback mode');
        }
    }

    /**
     * Process vehicle data with LLM
     */
    async processVehicle(vehicleData) {
        if (!this.enabled) {
            console.log('⚠️  OpenAI not configured - skipping LLM processing');
            return this.processVehicleFallback(vehicleData);
        }

        try {
            console.log(`🤖 Processing ${vehicleData.brand} ${vehicleData.model} with LLM...`);

            const prompt = this.buildPrompt(vehicleData);

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are an automotive expert that processes vehicle data. Extract and structure information from raw scraped data. Return valid JSON only."
                }, {
                    role: "user",
                    content: prompt
                }],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 1000
            });

            const result = JSON.parse(response.choices[0].message.content);

            // Merge LLM results with original data
            return {
                ...vehicleData,
                pros_cons: result.pros_cons,
                description: result.description,
                specs: {
                    ...vehicleData.specs,
                    ...result.specs
                }
            };

        } catch (error) {
            console.error(`❌ LLM processing error: ${error.message}`);
            return this.processVehicleFallback(vehicleData);
        }
    }

    /**
     * Build prompt for LLM
     */
    buildPrompt(vehicleData) {
        return `
Process the following ${vehicleData.type} data and extract structured information:

Vehicle: ${vehicleData.brand} ${vehicleData.model}
Type: ${vehicleData.type}
Price: ₹${(vehicleData.price / 100000).toFixed(2)} Lakh
Specs: ${JSON.stringify(vehicleData.specs)}

Please provide:
1. Pros (5 advantages based on specs and price point)
2. Cons (5 disadvantages or considerations)
3. A compelling 2-line description for marketing
4. Normalized specifications (ensure consistent units and format)

Return JSON in this exact format:
{
    "pros_cons": {
        "pros": ["advantage 1", "advantage 2", "advantage 3", "advantage 4", "advantage 5"],
        "cons": ["disadvantage 1", "disadvantage 2", "disadvantage 3", "disadvantage 4", "disadvantage 5"]
    },
    "description": "Two compelling sentences about this vehicle",
    "specs": {
        "fuel_type": "normalized fuel type",
        "transmission": "normalized transmission",
        "mileage": "X km/l or X km/charge",
        "engine": "displacement or type",
        "fuel_tank_capacity": "X Liters",
        "seat_height": "X mm",
        "abs": "Yes/No (single/dual channel)",
        "kerb_weight": "X kg"
    }
}`;
    }

    /**
     * Fallback processing without LLM
     */
    processVehicleFallback(vehicleData) {
        console.log(`🔧 Using fallback processing for ${vehicleData.brand} ${vehicleData.model}`);

        const pros_cons = this.generateProsCons(vehicleData);
        const description = this.generateDescription(vehicleData);

        return {
            ...vehicleData,
            pros_cons,
            description,
            specs: {
                ...vehicleData.specs,
                fuel_tank_capacity: 'N/A', // Default fallback
                seat_height: vehicleData.type === 'bike' ? 'N/A' : undefined, // Only for bikes
                kerb_weight: 'N/A',
                abs: 'N/A'
            }
        };
    }

    /**
     * Generate pros/cons without LLM
     */
    generateProsCons(vehicle) {
        const pros = [];
        const cons = [];

        if (vehicle.type === 'car') {
            // Car pros
            if (vehicle.specs.fuel_type === 'Electric') {
                pros.push('Zero Emissions & Eco-Friendly');
                pros.push('Low Running Costs');
                cons.push('Charging Infrastructure Dependency');
            } else if (vehicle.specs.fuel_type === 'Diesel') {
                pros.push('Excellent Fuel Efficiency');
                pros.push('High Torque for Highway Driving');
            } else {
                pros.push('Wide Service Network');
                pros.push('Good Resale Value');
            }

            pros.push('Spacious Interior');
            pros.push('Modern Features & Technology');
            pros.push('Proven Reliability');

            cons.push('Competitive Segment');
            cons.push('Regular Maintenance Required');
            cons.push('Insurance Costs');
            cons.push('Depreciation Over Time');
            cons.push('Fuel Price Volatility');

        } else { // bike
            pros.push('Excellent Fuel Efficiency');
            pros.push('Easy Maneuverability');
            pros.push('Low Maintenance Costs');
            pros.push('Affordable Insurance');
            pros.push('Easy Parking');

            cons.push('Limited Weather Protection');
            cons.push('Two-Person Capacity');
            cons.push('Minimal Storage Space');
            cons.push('Safety Concerns');
            cons.push('Not Ideal for Long Distances');
        }

        return { pros: pros.slice(0, 5), cons: cons.slice(0, 5) };
    }

    /**
     * Generate description without LLM
     */
    generateDescription(vehicle) {
        const price = (vehicle.price / 100000).toFixed(2);
        return `The ${vehicle.brand} ${vehicle.model} is a popular ${vehicle.type} priced at ₹${price} Lakh. It offers a great combination of ${vehicle.specs.fuel_type} efficiency and modern features.`;
    }

    /**
     * Batch process multiple vehicles
     */
    async batchProcess(vehicles) {
        console.log(`🔄 Batch processing ${vehicles.length} vehicles...`);

        const results = [];
        for (const vehicle of vehicles) {
            try {
                const processed = await this.processVehicle(vehicle);
                results.push(processed);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error processing ${vehicle.brand} ${vehicle.model}:`, error.message);
                results.push(vehicle); // Include unprocessed vehicle
            }
        }

        console.log(`✅ Batch processing complete: ${results.length}/${vehicles.length} successful`);
        return results;
    }

    /**
     * Generate chatbot response
     */
    async generateChatResponse(message, vehicleContext = []) {
        if (!this.enabled) {
            return null; // Fallback handled in routes
        }

        try {
            const contextSummary = vehicleContext.map(v =>
                `${v.brand} ${v.model} (${v.type}, ₹${(v.price / 100000).toFixed(2)} Lakhs, ${v.specs?.fuel_type || 'Petrol'})`
            ).join('\n');

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are the AutoVerse AI Assistant. You help users find cars and bikes. 
                        Website Identity: AutoVerse is a premium platform for comparing vehicles and finding showrooms.
                        
                        Current Available Vehicles Highlight:
                        ${contextSummary || "We have a wide range of popular Indian cars and bikes."}
                        
                        Guidelines:
                        1. Be professional, friendly, and helpful.
                        2. If asked about recommendations, use the context above.
                        3. Encourage users to visit the 'Vehicles' page for filters or 'Compare' page for side-by-side specs.
                        4. Mention that they can find showroom contacts and WhatsApp numbers on vehicle detail pages.
                        5. Keep responses concise (2-3 sentences).`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content;

        } catch (error) {
            console.error(`❌ Chat AI error: ${error.message}`);
            return null;
        }
    }
}

export default LLMService;
