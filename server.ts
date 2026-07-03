import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// RESTAURANT MOCK GENERATOR FOR FALLBACK
const MOCK_RESTAURANTS_TEMPLATES = [
  { name: "La Trattoria Premium", cuisine: "Italian", priceRange: "$$$", isVegetarian: true, isNonVegetarian: true, description: "Authentic handmade pasta and cozy rustic vibe." },
  { name: "The Grill Master", cuisine: "Steakhouse", priceRange: "$$$$", isVegetarian: false, isNonVegetarian: true, description: "Flame-broiled prime cuts with skyline views." },
  { name: "Zen Sushi Bar", cuisine: "Japanese", priceRange: "$$$", isVegetarian: true, isNonVegetarian: true, description: "Fresh sashimi and innovative signature rolls." },
  { name: "Green Garden Bistro", cuisine: "Vegetarian / Vegan", priceRange: "$$", isVegetarian: true, isNonVegetarian: false, description: "Organic farm-to-table plant-based delicacies." },
  { name: "Spice Route Lounge", cuisine: "Indian Fusion", priceRange: "$$", isVegetarian: true, isNonVegetarian: true, description: "Rich, aromatic curries and clay-oven specialties." },
];

const MOCK_HOTEL_TEMPLATES = [
  { name: "Grand Vista Luxury Resort", rating: 4.9, price: 320, amenities: ["Pool", "Spa", "Free WiFi", "Ocean View", "Gym"], distance: "0.2 miles from center", description: "Breathtaking views, world-class luxury and direct access to major attractions." },
  { name: "Metropolitan Boutique Hotel", rating: 4.7, price: 180, amenities: ["Breakfast", "Free WiFi", "Bar", "City View"], distance: "0.5 miles from center", description: "Modern, stylish rooms featuring hand-picked local art and a vibrant cocktail bar." },
  { name: "The Eco Lodge & Spa", rating: 4.8, price: 210, amenities: ["Eco Friendly", "Organic Dining", "Spa", "Pool"], distance: "1.4 miles from center", description: "Peaceful forest-surrounded eco sanctuary designed for relaxation and rejuvenation." },
];

// UTILITY TO GENERATE FULL MOCKS IF AI IS OFFLINE
function generateFallbackItinerary(dest: string, days: number, style: string, budget: number, foodPref: string): any {
  const daysArray = [];
  const baseLat = 40.7128 + (Math.random() - 0.5) * 5;
  const baseLng = -74.0060 + (Math.random() - 0.5) * 5;

  for (let i = 1; i <= days; i++) {
    daysArray.push({
      dayNumber: i,
      date: `Day ${i}`,
      theme: `${style} Exploration of ${dest}`,
      morning: [
        {
          id: `act-${i}-m`,
          title: `Discover ${dest}'s Cultural Landmarks`,
          description: `Kick off your day with a guided walking tour exploring historical sights, striking architecture, and beautiful plazas in the heart of ${dest}.`,
          time: "09:00 AM",
          duration: "3 hours",
          cost: Math.min(budget * 0.05, 30),
          location: { name: `${dest} Historical Center`, lat: baseLat + 0.01, lng: baseLng - 0.01, type: "attraction" },
          type: "sightseeing",
          rating: 4.8,
          image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80`
        }
      ],
      afternoon: [
        {
          id: `act-${i}-a1`,
          title: `Culinary Tasting Experience`,
          description: `Enjoy a curated lunch matching your food preference (${foodPref}) at a highly rated local diner, highlighting local culinary secrets.`,
          time: "12:30 PM",
          duration: "1.5 hours",
          cost: Math.min(budget * 0.08, 45),
          location: { name: `${dest} Artisan Kitchen`, lat: baseLat + 0.005, lng: baseLng + 0.015, type: "restaurant" },
          type: "food",
          rating: 4.7,
          image: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80`
        },
        {
          id: `act-${i}-a2`,
          title: `Leisurely Scenic Tour & Views`,
          description: `Stroll through premium gardens, local craft markets, or iconic viewpoints. Perfect for taking pictures and picking up authentic souvenirs.`,
          time: "02:30 PM",
          duration: "2.5 hours",
          cost: 0,
          location: { name: `${dest} Panoramic Gardens`, lat: baseLat - 0.015, lng: baseLng + 0.005, type: "attraction" },
          type: "sightseeing",
          rating: 4.6
        }
      ],
      evening: [
        {
          id: `act-${i}-e`,
          title: `Panoramic Sunset Dinner & Lounge`,
          description: `Unwind with a spectacular sunset view, premium local drinks, and custom chef pairings, summarizing the vibrant spirit of ${dest}.`,
          time: "07:00 PM",
          duration: "3 hours",
          cost: Math.min(budget * 0.15, 80),
          location: { name: `${dest} Sunset Skybar`, lat: baseLat, lng: baseLng, type: "restaurant" },
          type: "food",
          rating: 4.9,
          image: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80`
        }
      ]
    });
  }

  // Generate Hotels
  const hotels = MOCK_HOTEL_TEMPLATES.map((h, index) => ({
    id: `hotel-${index}`,
    name: h.name,
    rating: h.rating,
    price: Math.round(h.price * (budget > 1000 ? 1.5 : budget < 400 ? 0.6 : 1.0)),
    amenities: h.amenities,
    distance: h.distance,
    imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80`,
    bookingUrl: "#",
    description: h.description
  }));

  // Generate Restaurants
  const restaurants = MOCK_RESTAURANTS_TEMPLATES.map((r, index) => ({
    id: `rest-${index}`,
    name: `${dest} ${r.name}`,
    rating: 4.5 + Math.random() * 0.4,
    distance: `${(0.4 + index * 0.3).toFixed(1)} miles from center`,
    cuisine: r.cuisine,
    priceRange: r.priceRange,
    isVegetarian: r.isVegetarian,
    isNonVegetarian: r.isNonVegetarian,
    imageUrl: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80`,
    reviewsCount: Math.floor(100 + Math.random() * 800),
    description: r.description
  }));

  return { itinerary: daysArray, hotels, restaurants };
}

// 1. DYNAMIC WEATHER GENERATOR
app.get("/api/weather", async (req, res) => {
  const city = (req.query.city as string) || "Paris";
  const client = getGeminiClient();

  if (!client) {
    // Generate realistic weather mockup based on common locations
    const temp = Math.floor(14 + Math.random() * 12);
    const conditions = ["Sunny", "Partly Cloudy", "Mild Showers", "Overcast", "Clear Sky"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const humidity = Math.floor(40 + Math.random() * 45);
    const windSpeed = Math.floor(5 + Math.random() * 15);
    const isOutdoor = !["Mild Showers", "Overcast"].includes(condition);

    res.json({
      temp,
      condition,
      icon: isOutdoor ? "sun" : "cloud-rain",
      humidity,
      windSpeed,
      recommendation: isOutdoor
        ? "Excellent weather for walking tours, historical parks, and rooftop dining!"
        : "Perfect day for high-end museums, art galleries, historical libraries, or indoor boutique shopping.",
      forecast: [
        { day: "Tomorrow", temp: temp + 1, condition: "Sunny" },
        { day: "Day 3", temp: temp - 1, condition: "Partly Cloudy" },
        { day: "Day 4", temp: temp - 2, condition: "Rainy" },
        { day: "Day 5", temp: temp, condition: "Clear Sky" }
      ]
    });
    return;
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate realistic current weather info and a 4-day forecast for ${city} in early summer. Provide an actionable activity recommendation (indoor or outdoor based on conditions).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temp: { type: Type.INTEGER, description: "Temperature in Celsius" },
            condition: { type: Type.STRING, description: "Single-word description e.g. Sunny, Rainy, Overcast" },
            icon: { type: Type.STRING, description: "Either 'sun', 'cloud', 'cloud-rain', or 'wind'" },
            humidity: { type: Type.INTEGER },
            windSpeed: { type: Type.INTEGER },
            recommendation: { type: Type.STRING, description: "Outdoor or indoor travel activity recommendations based on weather." },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "Short day name, e.g. Tomorrow, Day 3" },
                  temp: { type: Type.INTEGER },
                  condition: { type: Type.STRING }
                },
                required: ["day", "temp", "condition"]
              }
            }
          },
          required: ["temp", "condition", "icon", "humidity", "windSpeed", "recommendation", "forecast"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (error) {
    console.error("Weather Generation Error:", error);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// 2. AI ITINERARY GENERATOR WITH STRUCTURED SCHEMA
app.post("/api/itinerary/generate", async (req, res) => {
  const {
    destination,
    country,
    budget,
    currency,
    startDate,
    endDate,
    travelers,
    children,
    travelStyle,
    foodPreference,
    hotelPreference,
    transport,
    interests
  } = req.body;

  if (!destination) {
    res.status(400).json({ error: "Destination is required" });
    return;
  }

  const daysCount = Math.min(
    14,
    Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) || 3
  );

  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key or placeholder detected. Returning high-fidelity offline fallback itinerary...");
    const fallback = generateFallbackItinerary(destination, daysCount, travelStyle || "Adventure", budget || 1000, foodPreference || "Local Cuisines");
    res.json(fallback);
    return;
  }

  try {
    const prompt = `
      Act as an elite travel concierge. Generate a custom, high-fidelity luxury travel itinerary for:
      - Destination: ${destination}, ${country || ""}
      - Duration: ${daysCount} Days
      - Budget Limit: ${budget} ${currency || "USD"}
      - Travelers: ${travelers} Adults, ${children} Children
      - Travel Style: ${travelStyle}
      - Food Preferences: ${foodPreference}
      - Hotel Preference: ${hotelPreference}
      - Preferred Transport: ${transport}
      - Interests: ${interests?.join(", ") || "Sightseeing, culture"}

      Ensure every day has full plans: Morning (1 activity), Afternoon (2 activities), and Evening (1 activity).
      Provide coordinates (lat, lng) within the geographic range of ${destination} for every activity, hotel, and restaurant.
      Include 3 hotel recommendations fitting the style, and 3 restaurant recommendations fitting the food preference.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.ARRAY,
              description: "Day-by-day travel plan",
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING, description: "Date formatting, e.g., 'Day 1' or 'July 4th'" },
                  theme: { type: Type.STRING, description: "Theme of the day" },
                  morning: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING, description: "Compelling description of the activity" },
                        time: { type: Type.STRING, description: "E.g., 09:00 AM" },
                        duration: { type: Type.STRING, description: "E.g., 3 hours" },
                        cost: { type: Type.NUMBER, description: "Approximate cost in numeric value" },
                        type: { type: Type.STRING, description: "Must be: sightseeing, food, rest, or transport" },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            type: { type: Type.STRING, description: "E.g. attraction" }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  },
                  afternoon: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        cost: { type: Type.NUMBER },
                        type: { type: Type.STRING },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  },
                  evening: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        cost: { type: Type.NUMBER },
                        type: { type: Type.STRING },
                        location: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER }
                          },
                          required: ["name", "lat", "lng"]
                        }
                      },
                      required: ["id", "title", "description", "time", "duration", "cost", "type", "location"]
                    }
                  }
                },
                required: ["dayNumber", "date", "theme", "morning", "afternoon", "evening"]
              }
            },
            hotels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  price: { type: Type.NUMBER, description: "Nightly price in numbers" },
                  amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  distance: { type: Type.STRING, description: "E.g. 0.4 miles from center" },
                  imageUrl: { type: Type.STRING, description: "Use general elegant unsplash URLs" },
                  bookingUrl: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "name", "rating", "price", "amenities", "distance", "imageUrl", "bookingUrl"]
              }
            },
            restaurants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  distance: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  priceRange: { type: Type.STRING, description: "E.g., $$, $$$" },
                  isVegetarian: { type: Type.BOOLEAN },
                  isNonVegetarian: { type: Type.BOOLEAN },
                  imageUrl: { type: Type.STRING },
                  reviewsCount: { type: Type.INTEGER },
                  description: { type: Type.STRING }
                },
                required: ["id", "name", "rating", "distance", "cuisine", "priceRange", "isVegetarian", "isNonVegetarian", "imageUrl", "reviewsCount"]
              }
            }
          },
          required: ["itinerary", "hotels", "restaurants"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (error) {
    console.error("AI Generation Failed. Using graceful offline fallback...", error);
    const fallback = generateFallbackItinerary(destination, daysCount, travelStyle || "Adventure", budget || 1000, foodPreference || "Local Cuisines");
    res.json(fallback);
  }
});

// 3. AI TRAVEL CHAT ENDPOINT WITH COMPREHENSIVE SYSTEM INSTRUCTIONS
app.post("/api/chat", async (req, res) => {
  const { messages, currentTrip } = req.body;
  const client = getGeminiClient();

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: "Messages are required" });
    return;
  }

  // Formatting historical context for the assistant
  const formattedHistory = messages.map((m: any) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }]
  }));

  const userQuery = formattedHistory[formattedHistory.length - 1].parts[0].text;
  const historyBeforeQuery = formattedHistory.slice(0, -1);

  const tripContext = currentTrip
    ? `The user is currently planning or viewing a trip to: ${currentTrip.destination}, ${currentTrip.country}.
       Trip style is ${currentTrip.travelStyle || "casual"} with a budget of ${currentTrip.budget} ${currentTrip.currency || "USD"}.
       The itinerary includes ${currentTrip.itinerary?.length || 0} days.`
    : "No active trip is loaded. Invite them to plan a trip using the Quick Planner.";

  if (!client) {
    // Elegant fallback chat responses
    let answer = "I'm running in offline assistant mode. ";
    if (userQuery.toLowerCase().includes("restaurant") || userQuery.toLowerCase().includes("food")) {
      answer += "For a truly gourmet experience, explore local street food or look for family-owned bistros near the main square. Always try the seasonal specials!";
    } else if (userQuery.toLowerCase().includes("packing") || userQuery.toLowerCase().includes("pack")) {
      answer += "Pack versatile, breathable layers. Don't forget comfortable walking shoes, a waterproof jacket, a power bank, and a refillable water bottle!";
    } else if (userQuery.toLowerCase().includes("safety") || userQuery.toLowerCase().includes("safe")) {
      answer += "Always keep your essentials in a zipped secure bag, keep photocopies of passport on cloud, buy comprehensive travel insurance, and note local emergency numbers.";
    } else if (userQuery.toLowerCase().includes("budget") || userQuery.toLowerCase().includes("cost")) {
      answer += "Consider taking high-quality public transit or walking instead of ride-sharing. Eat at central marketplaces instead of immediate tourist spots for 40% cost savings.";
    } else {
      answer += `That is a marvelous question! Traveling to unique places offers incredible memory-making. If you want customized insights about ${currentTrip?.destination || "your next adventure"}, try connecting your Gemini API Key in the Secrets panel!`;
    }
    res.json({ text: answer });
    return;
  }

  try {
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are 'Voyage AI', an elite, ultra-knowledgeable luxury AI Travel Concierge.
        Your style is sophisticated, warm, helpful, objective, and scannable.
        Here is the current Trip Context: ${tripContext}
        Always keep suggestions highly practical, referring to best local restaurants, hidden gems, and safety guidelines.
        Give well-structured answers using clear Markdown. Do not praise yourself or write flowery fluff. Maintain extreme professionalism.`
      },
      history: historyBeforeQuery
    });

    const response = await chat.sendMessage({ message: userQuery });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// START PRODUCTION BUILD ROUTING HANDLERS
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running in DEV mode on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  // Standard Express 4 route handler
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in PRODUCTION mode on http://localhost:${PORT}`);
  });
}
