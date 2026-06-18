const { HfInference } = require('@huggingface/inference');
const mysql = require('mysql2/promise');
const natural = require('natural');
const { NlpManager } = require('node-nlp');

class TravelChatbot {
    constructor() {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();

        // Initialize NLP manager for intent recognition
        this.manager = new NlpManager({ languages: ['en'] });
        this.setupIntents();

        // Database connection
        this.dbConfig = {
            host: process.env.DB_HOST || 'mysql',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Aabid2004@',
            database: process.env.DB_NAME || 'lanka_vacations',
            charset: 'utf8mb4'
        };
    }

    async setupIntents() {
        // Package-related intents
        this.manager.addNamedEntityText('package', 'cultural', ['en'], ['cultural', 'culture', 'heritage']);
        this.manager.addNamedEntityText('package', 'adventure', ['en'], ['adventure', 'adventurous', 'thrilling']);
        this.manager.addNamedEntityText('package', 'beach', ['en'], ['beach', 'coastal', 'seaside']);
        this.manager.addNamedEntityText('package', 'wildlife', ['en'], ['wildlife', 'animals', 'safari']);
        this.manager.addNamedEntityText('package', 'comprehensive', ['en'], ['comprehensive', 'complete', 'full']);

        // Destination types
        this.manager.addNamedEntityText('destinationType', 'cultural', ['en'], ['cultural', 'historical', 'heritage']);
        this.manager.addNamedEntityText('destinationType', 'beach', ['en'], ['beach', 'coastal', 'seaside']);
        this.manager.addNamedEntityText('destinationType', 'adventure', ['en'], ['adventure', 'hiking', 'trekking']);
        this.manager.addNamedEntityText('destinationType', 'wildlife', ['en'], ['wildlife', 'animals', 'safari']);
        this.manager.addNamedEntityText('destinationType', 'city', ['en'], ['city', 'urban', 'metropolitan']);
        this.manager.addNamedEntityText('destinationType', 'hill_country', ['en'], ['hill', 'mountains', 'tea']);

        // Duration entities
        this.manager.addNamedEntityText('duration', 'short', ['en'], ['short', 'quick', 'brief', 'few days']);
        this.manager.addNamedEntityText('duration', 'medium', ['en'], ['medium', 'moderate', 'week']);
        this.manager.addNamedEntityText('duration', 'long', ['en'], ['long', 'extended', 'comprehensive']);

        // Budget entities
        this.manager.addNamedEntityText('budget', 'budget', ['en'], ['budget', 'cheap', 'economical', 'affordable']);
        this.manager.addNamedEntityText('budget', 'moderate', ['en'], ['moderate', 'medium', 'reasonable']);
        this.manager.addNamedEntityText('budget', 'premium', ['en'], ['premium', 'luxury', 'expensive', 'deluxe']);

        // Add intents
        this.manager.addDocument('en', 'Tell me about packages', 'package.info');
        this.manager.addDocument('en', 'What packages do you have?', 'package.info');
        this.manager.addDocument('en', 'Show me available tours', 'package.info');

        this.manager.addDocument('en', 'I want cultural packages', 'package.type');
        this.manager.addDocument('en', 'Show me adventure tours', 'package.type');
        this.manager.addDocument('en', 'Looking for beach packages', 'package.type');

        this.manager.addDocument('en', 'What destinations do you have?', 'destination.info');
        this.manager.addDocument('en', 'Tell me about places to visit', 'destination.info');

        this.manager.addDocument('en', 'What activities are available?', 'activity.info');
        this.manager.addDocument('en', 'Things to do in Sri Lanka', 'activity.info');

        this.manager.addDocument('en', 'Package prices', 'package.price');
        this.manager.addDocument('en', 'How much does it cost?', 'package.price');

        this.manager.addDocument('en', 'Best time to visit', 'destination.season');
        this.manager.addDocument('en', 'When to go to', 'destination.season');

        // Train the model
        await this.manager.train();
    }

    async getDatabaseConnection() {
        return await mysql.createConnection(this.dbConfig);
    }

    async queryPackages(filters = {}) {
        const connection = await this.getDatabaseConnection();
        try {
            let query = `
                SELECT package_id, package_name, package_type, description, 
                       duration_days, price_per_person_usd, included_activities,
                       accommodation_type, transport_type, image_urls
                FROM packages 
                WHERE 1=1
            `;
            const params = [];

            if (filters.packageType) {
                query += ' AND package_type LIKE ?';
                params.push(`%${filters.packageType}%`);
            }

            if (filters.duration) {
                if (filters.duration === 'short') {
                    query += ' AND duration_days <= 5';
                } else if (filters.duration === 'medium') {
                    query += ' AND duration_days BETWEEN 6 AND 10';
                } else if (filters.duration === 'long') {
                    query += ' AND duration_days > 10';
                }
            }

            if (filters.budget) {
                if (filters.budget === 'budget') {
                    query += ' AND price_per_person_usd <= 400';
                } else if (filters.budget === 'moderate') {
                    query += ' AND price_per_person_usd BETWEEN 401 AND 800';
                } else if (filters.budget === 'premium') {
                    query += ' AND price_per_person_usd > 800';
                }
            }

            const [packages] = await connection.execute(query, params);
            return packages;
        } finally {
            await connection.end();
        }
    }

    async queryDestinations(filters = {}) {
        const connection = await this.getDatabaseConnection();
        try {
            let query = `
                SELECT destination_id, destination_name, type, description,
                       best_visit_start, best_visit_end, tags
                FROM destinations 
                WHERE 1=1
            `;
            const params = [];

            if (filters.type) {
                query += ' AND type = ?';
                params.push(filters.type);
            }

            if (filters.name) {
                query += ' AND destination_name LIKE ?';
                params.push(`%${filters.name}%`);
            }

            const [destinations] = await connection.execute(query, params);
            return destinations;
        } finally {
            await connection.end();
        }
    }

    async queryActivities(filters = {}) {
        const connection = await this.getDatabaseConnection();
        try {
            let query = `
                SELECT activity_id, activity_name, type, description,
                       duration_hours, intensity, price_range, cities
                FROM activities 
                WHERE 1=1
            `;
            const params = [];

            if (filters.type) {
                query += ' AND type LIKE ?';
                params.push(`%${filters.type}%`);
            }

            if (filters.city) {
                query += ' AND JSON_CONTAINS(cities, ?)';
                params.push(`"${filters.city}"`);
            }

            const [activities] = await connection.execute(query, params);
            return activities;
        } finally {
            await connection.end();
        }
    }

    async processMessage(userMessage, sessionId = null) {
        try {
            // First, try to understand the intent
            const intentResult = await this.manager.process('en', userMessage);

            // Extract entities
            const entities = intentResult.entities || [];
            const intent = intentResult.intent;

            let response = '';
            let data = null;

            switch (intent) {
                case 'package.info':
                    const packageFilters = {};
                    entities.forEach(entity => {
                        if (entity.entity === 'package') {
                            packageFilters.packageType = entity.option;
                        }
                        if (entity.entity === 'duration') {
                            packageFilters.duration = entity.option;
                        }
                        if (entity.entity === 'budget') {
                            packageFilters.budget = entity.option;
                        }
                    });
                    data = await this.queryPackages(packageFilters);
                    response = this.formatPackageResponse(data, packageFilters);
                    break;

                case 'destination.info':
                    const destinationFilters = {};
                    entities.forEach(entity => {
                        if (entity.entity === 'destinationType') {
                            destinationFilters.type = entity.option;
                        }
                    });
                    data = await this.queryDestinations(destinationFilters);
                    response = this.formatDestinationResponse(data, destinationFilters);
                    break;

                case 'activity.info':
                    const activityFilters = {};
                    // Extract city from message using simple pattern matching
                    const cityMatch = userMessage.match(/(?:in|at|near)\s+([A-Za-z\s]+)/i);
                    if (cityMatch) {
                        activityFilters.city = cityMatch[1].trim();
                    }
                    data = await this.queryActivities(activityFilters);
                    response = this.formatActivityResponse(data, activityFilters);
                    break;

                case 'package.price':
                    data = await this.queryPackages();
                    response = this.formatPriceResponse(data);
                    break;

                case 'destination.season':
                    response = await this.getBestSeasonInfo(userMessage);
                    break;

                default:
                    // Fallback: search across all data
                    response = await this.generalSearch(userMessage);
            }

            return {
                success: true,
                response: response,
                data: data,
                intent: intent,
                entities: entities
            };

        } catch (error) {
            console.error('Chatbot error:', error);
            return {
                success: false,
                response: "I apologize, but I'm having trouble accessing the travel information right now. Please try again later or contact our support team.",
                data: null
            };
        }
    }

    formatPackageResponse(packages, filters) {
        if (!packages || packages.length === 0) {
            let message = "I couldn't find any packages";
            if (filters.packageType) {
                message += ` of type '${filters.packageType}'`;
            }
            if (filters.duration) {
                message += ` with ${filters.duration} duration`;
            }
            if (filters.budget) {
                message += ` in ${filters.budget} range`;
            }
            return message + ". Please try different criteria.";
        }

        let response = `I found ${packages.length} package(s) for you:\n\n`;

        packages.forEach((pkg, index) => {
            response += `**${pkg.package_name}**\n`;
            response += `📍 Type: ${pkg.package_type}\n`;
            response += `⏱️ Duration: ${pkg.duration_days} days\n`;
            response += `💰 Price: $${pkg.price_per_person_usd} per person\n`;
            response += `🏨 Accommodation: ${pkg.accommodation_type}\n`;
            response += `🚗 Transport: ${pkg.transport_type}\n`;

            if (pkg.included_activities) {
                try {
                    const activities = Array.isArray(pkg.included_activities) 
                        ? pkg.included_activities 
                        : JSON.parse(pkg.included_activities);
                    if (activities.length > 0) {
                        response += `🎯 Activities: ${activities.slice(0, 3).join(', ')}`;
                        if (activities.length > 3) response += ` and ${activities.length - 3} more`;
                        response += `\n`;
                    }
                } catch (e) {
                    // Skip if parsing fails
                }
            }

            response += `---\n`;
        });

        return response;
    }

    formatDestinationResponse(destinations, filters) {
        if (!destinations || destinations.length === 0) {
            let message = "I couldn't find any destinations";
            if (filters.type) {
                message += ` of type '${filters.type}'`;
            }
            return message + " in our database.";
        }

        let response = `Here are ${destinations.length} destination(s) in Sri Lanka:\n\n`;

        destinations.forEach((dest, index) => {
            response += `**${dest.destination_name}**\n`;
            response += `🏷️ Type: ${dest.type}\n`;
            response += `📅 Best time: ${dest.best_visit_start} to ${dest.best_visit_end}\n`;

            if (dest.tags) {
                try {
                    const tags = Array.isArray(dest.tags) ? dest.tags : JSON.parse(dest.tags);
                    if (tags.length > 0) {
                        response += `🏷️ Tags: ${tags.join(', ')}\n`;
                    }
                } catch (e) {
                    // Skip if parsing fails
                }
            }

            response += `📝 ${dest.description}\n`;
            response += `---\n`;
        });

        return response;
    }

    formatActivityResponse(activities, filters) {
        if (!activities || activities.length === 0) {
            let message = "I couldn't find any activities";
            if (filters.city) {
                message += ` in ${filters.city}`;
            }
            return message + ". Please try a different location or activity type.";
        }

        let response = `I found ${activities.length} activity(s):\n\n`;

        activities.forEach((activity, index) => {
            response += `**${activity.activity_name}**\n`;
            response += `🎯 Type: ${activity.type}\n`;
            response += `⏱️ Duration: ${activity.duration_hours} hours\n`;
            response += `💪 Intensity: ${activity.intensity}\n`;
            response += `💰 Price range: ${activity.price_range}\n`;

            if (activity.cities) {
                try {
                    const cities = Array.isArray(activity.cities) ? activity.cities : JSON.parse(activity.cities);
                    if (cities.length > 0) {
                        response += `📍 Available in: ${cities.join(', ')}\n`;
                    }
                } catch (e) {
                    // Skip if parsing fails
                }
            }

            response += `📝 ${activity.description}\n`;
            response += `---\n`;
        });

        return response;
    }

    formatPriceResponse(packages) {
        if (!packages || packages.length === 0) {
            return "I couldn't find any package prices at the moment.";
        }

        let response = "Here are our package prices:\n\n";

        packages.forEach(pkg => {
            response += `**${pkg.package_name}**: $${pkg.price_per_person_usd} per person for ${pkg.duration_days} days\n`;
        });

        response += `\nAll prices are in USD and include accommodation, activities, and transport as specified.`;
        return response;
    }

    async getBestSeasonInfo(message) {
        const connection = await this.getDatabaseConnection();
        try {
            // Extract destination name from message
            const destMatch = message.match(/(?:visit|go to|see|explore)\s+([A-Za-z\s]+)/i);
            if (destMatch) {
                const destName = destMatch[1].trim();
                const [destinations] = await connection.execute(
                    'SELECT destination_name, best_visit_start, best_visit_end FROM destinations WHERE destination_name LIKE ?',
                    [`%${destName}%`]
                );

                if (destinations.length > 0) {
                    const dest = destinations[0];
                    return `The best time to visit **${dest.destination_name}** is from **${dest.best_visit_start}** to **${dest.best_visit_end}**.`;
                }
            }

            // General season info
            const [allDestinations] = await connection.execute(
                'SELECT type, best_visit_start, best_visit_end FROM destinations GROUP BY type, best_visit_start, best_visit_end'
            );

            let response = "**Best visiting seasons in Sri Lanka:**\n\n";
            const seasonInfo = {};

            allDestinations.forEach(dest => {
                if (!seasonInfo[dest.type]) {
                    seasonInfo[dest.type] = new Set();
                }
                seasonInfo[dest.type].add(`${dest.best_visit_start}-${dest.best_visit_end}`);
            });

            Object.keys(seasonInfo).forEach(type => {
                response += `**${type.charAt(0).toUpperCase() + type.slice(1)}**: ${Array.from(seasonInfo[type]).join(', ')}\n`;
            });

            return response;

        } finally {
            await connection.end();
        }
    }

    async generalSearch(query) {
        // Search across packages, destinations, and activities
        const [packages] = await this.queryPackages();
        const [destinations] = await this.queryDestinations();
        const [activities] = await this.queryActivities();

        const results = [];

        // Simple keyword matching
        const keywords = this.tokenizer.tokenize(query.toLowerCase());

        packages.forEach(pkg => {
            const text = `${pkg.package_name} ${pkg.package_type} ${pkg.description}`.toLowerCase();
            const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
            if (matchCount > 0) {
                results.push({ type: 'package', data: pkg, score: matchCount });
            }
        });

        destinations.forEach(dest => {
            const text = `${dest.destination_name} ${dest.type} ${dest.description}`.toLowerCase();
            const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
            if (matchCount > 0) {
                results.push({ type: 'destination', data: dest, score: matchCount });
            }
        });

        activities.forEach(activity => {
            const text = `${activity.activity_name} ${activity.type} ${activity.description}`.toLowerCase();
            const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
            if (matchCount > 0) {
                results.push({ type: 'activity', data: activity, score: matchCount });
            }
        });

        // Sort by relevance
        results.sort((a, b) => b.score - a.score);

        if (results.length === 0) {
            return "I couldn't find information related to your query. Could you please rephrase or ask about packages, destinations, or activities?";
        }

        let response = "I found these results for your query:\n\n";
        results.slice(0, 5).forEach(result => {
            if (result.type === 'package') {
                response += `📦 **Package**: ${result.data.package_name} (${result.data.duration_days} days, $${result.data.price_per_person_usd})\n`;
            } else if (result.type === 'destination') {
                response += `🏝️ **Destination**: ${result.data.destination_name} (${result.data.type})\n`;
            } else if (result.type === 'activity') {
                response += `🎯 **Activity**: ${result.data.activity_name} (${result.data.duration_hours} hours)\n`;
            }
        });

        return response;
    }
}

module.exports = TravelChatbot;