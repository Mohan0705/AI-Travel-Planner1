import React from "react";
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar, 
  Heart, 
  Compass, 
  Check, 
  ChevronRight, 
  PlaneTakeoff,
  AlertCircle
} from "lucide-react";
import { Trip } from "../types";

interface CreateTripViewProps {
  onTripGenerated: (trip: Trip) => void;
  initialDestination?: string;
}

const TRAVEL_STYLES = [
  "Cultural Luxury",
  "High-End Adventure",
  "Relaxed Coastal / Beach",
  "Eco-Friendly Sanctuary",
  "Family-Friendly Exploration",
  "Romantic Honeymoon",
  "Art, Architecture & Fashion"
];

const FOOD_PREFERENCES = [
  "Michelin Star Dining",
  "Local Traditional Cuisines",
  "Seafood & Waterfront Grills",
  "Strict Vegetarian / Plant-based",
  "Gluten-Free Fine Cuisine",
  "Anything / Global Gastronomy"
];

const HOTEL_PREFERENCES = [
  "Historic Palace / Ryokan",
  "Modern Boutique Hotels",
  "Five-Star Luxury Resort",
  "Scenic Eco Lodges",
  "Private Villas & Chalets"
];

const TRANSPORTS = [
  "Private Chauffeur & Tesla",
  "First-Class Rail / Bullet Train",
  "Scenic Convertible Rental",
  "Premium Taxi & Public Transit",
  "Yacht Charters & Helicopters"
];

const INTERESTS_LIST = [
  "Temples & Shrines",
  "Museums & Art Archives",
  "Shopping & Haute Couture",
  "Hiking & Forest Trails",
  "Spa, Onsen & Rejuvenation",
  "Sunset Lounges & Nightlife",
  "Historical Castles & Ruins",
  "Cooking Classes & Wine Tastings",
  "Hidden Local Gems",
  "Beaches & Water Sports"
];

const LOADING_STEPS = [
  "Booting Voyage Multi-Agent Orchestrator...",
  "Spatial Coordinator plotting geographical coordinates...",
  "Gastronomy Agent vetting seasonal local restaurant cuisines...",
  "Concierge Specialist selecting boutique lodging choices...",
  "Meteorological Agent checking early weather calendars...",
  "Formatting high-contrast luxury day timeline PDF outputs..."
];

export default function CreateTripView({ onTripGenerated, initialDestination = "" }: CreateTripViewProps) {
  // Form States
  const [destination, setDestination] = React.useState(initialDestination);
  const [country, setCountry] = React.useState("");
  const [budget, setBudget] = React.useState("1500");
  const [currency, setCurrency] = React.useState("USD");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [travelers, setTravelers] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [travelStyle, setTravelStyle] = React.useState(TRAVEL_STYLES[0]);
  const [foodPreference, setFoodPreference] = React.useState(FOOD_PREFERENCES[1]);
  const [hotelPreference, setHotelPreference] = React.useState(HOTEL_PREFERENCES[1]);
  const [transport, setTransport] = React.useState(TRANSPORTS[3]);
  const [interests, setInterests] = React.useState<string[]>([]);
  
  // App states
  const [loading, setLoading] = React.useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = React.useState(0);
  const [validationError, setValidationError] = React.useState("");

  React.useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  // Dynamic loading message transitions
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // VALIDATION
    if (!destination.trim()) {
      setValidationError("Destination location is required.");
      return;
    }
    if (!startDate || !endDate) {
      setValidationError("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError("End Date cannot precede the Start Date.");
      return;
    }

    setLoading(true);
    setLoadingStepIdx(0);

    const payload = {
      destination: destination.trim(),
      country: country.trim() || "International",
      budget: Number(budget) || 1500,
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
    };

    try {
      const response = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Server itinerary generation failed.");
      }

      const generatedData = await response.json();
      
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        destination: payload.destination,
        country: payload.country,
        startDate: payload.startDate,
        endDate: payload.endDate,
        travelers: payload.travelers,
        children: payload.children,
        budget: payload.budget,
        currency: payload.currency,
        travelStyle: payload.travelStyle,
        foodPreference: payload.foodPreference,
        hotelPreference: payload.hotelPreference,
        transport: payload.transport,
        interests: payload.interests,
        isSaved: true,
        isFavorite: false,
        itinerary: generatedData.itinerary || [],
        expenses: [],
        hotels: generatedData.hotels || [],
        restaurants: generatedData.restaurants || [],
        createdAt: new Date().toISOString()
      };

      onTripGenerated(newTrip);
    } catch (err) {
      console.error("AI Generation Error", err);
      setValidationError("AI failed to generate a response. Please verify your internet connection and API credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-earth-bg text-earth-text">
      
      {/* Loading Cinematic Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-earth-bg/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-t-earth-accent border-earth-border/25 animate-spin" />
            <Sparkles className="w-8 h-8 text-earth-accent animate-pulse absolute inset-0 m-auto" />
          </div>
          <div className="space-y-3 max-w-md">
            <h3 className="font-serif italic font-light text-[#4A4A3A] text-2xl tracking-tight">Designing Your Masterwork</h3>
            <p className="text-sm font-mono text-earth-accent h-12 transition-all duration-300">
              {LOADING_STEPS[loadingStepIdx]}
            </p>
            <p className="text-xs text-earth-text/60 font-light leading-relaxed">Please wait. AI is drafting optimized coordinate loops, selecting fine culinary structures, and calculating overall spend curves.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">AI Itinerary Planner</h1>
          <p className="text-sm text-earth-text/65 font-light">Input your travel characteristics below to orchestrate a bespoke luxury agenda.</p>
        </div>

        {validationError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-8 p-6 md:p-8 rounded-[32px] bg-white border border-earth-border shadow-sm">
          
          {/* Section 1: Geo & Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">1. Destination Coordinates & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Destination City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-destination"
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="E.g., Kyoto, London, New York..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Country (Optional)</label>
                <input 
                  id="form-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="E.g., Japan, United Kingdom..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Departure Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-start-date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Return Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-end-date"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Budget & Travelers */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">2. Budget & Travelers Density</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-earth-text/80">Max Budget Limit</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-earth-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    id="form-budget"
                    type="number"
                    required
                    min="1"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Adult Travelers</label>
                <input 
                  id="form-travelers"
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Children / Kids</label>
                <input 
                  id="form-children"
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                />
              </div>

            </div>
          </div>

          {/* Section 3: Luxury Characteristics Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">3. Journey Characteristics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Travel Style Theme</label>
                <select 
                  id="form-style"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {TRAVEL_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Culinary / Dining Preference</label>
                <select 
                  id="form-food"
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {FOOD_PREFERENCES.map(food => <option key={food} value={food}>{food}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Lodging & Hotel Class</label>
                <select 
                  id="form-hotel"
                  value={hotelPreference}
                  onChange={(e) => setHotelPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {HOTEL_PREFERENCES.map(hotel => <option key={hotel} value={hotel}>{hotel}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-earth-text/80">Transport Method</label>
                <select 
                  id="form-transport"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:ring-1 focus:ring-earth-accent/30 focus:border-earth-accent/50 focus:outline-none text-sm font-medium"
                >
                  {TRANSPORTS.map(tr => <option key={tr} value={tr}>{tr}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Section 4: Activities Interests Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif italic text-[#4A4A3A] font-medium border-b border-earth-border pb-2">4. Personalized Interests</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {INTERESTS_LIST.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    id={`interest-tag-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border flex items-center justify-between
                      ${isSelected 
                        ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                        : "bg-earth-light-sage/20 border-earth-border/40 text-earth-text/80 hover:bg-white hover:border-earth-accent/30"}
                    `}
                  >
                    <span>{interest}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-earth-accent shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            id="form-submit-generate"
            type="submit"
            className="w-full py-4 rounded-full bg-earth-dark hover:bg-earth-dark-accent text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm font-sans"
          >
            <Sparkles className="w-4 h-4 text-earth-light-sage" />
            <span>Engage AI Itinerary Engine</span>
            <ChevronRight className="w-4 h-4 text-earth-light-sage" />
          </button>

        </form>
      </div>

    </div>
  );
}
