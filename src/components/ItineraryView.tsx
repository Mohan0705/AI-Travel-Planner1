import React from "react";
import { 
  Printer, 
  Share2, 
  MapPin, 
  DollarSign, 
  Utensils, 
  Hotel, 
  Activity, 
  Clock, 
  Heart, 
  ChevronRight, 
  Map, 
  Star,
  CheckCircle,
  Download,
  AlertCircle
} from "lucide-react";
import { Trip, DayPlan, Activity as ActivityType } from "../types";

interface ItineraryViewProps {
  trip: Trip | null;
  onToggleFavorite: (tripId: string) => void;
  onAddExpense: (tripId: string, amount: number, title: string, category: any) => void;
}

export default function ItineraryView({ trip, onToggleFavorite, onAddExpense }: ItineraryViewProps) {
  const [selectedDayIdx, setSelectedDayIdx] = React.useState(0);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [printMode, setPrintMode] = React.useState(false);

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-earth-bg text-earth-text/50">
        <Map className="w-16 h-16 text-earth-border animate-float" />
        <h3 className="font-serif italic font-light text-earth-text text-lg">No Active Itinerary Loaded</h3>
        <p className="text-xs text-earth-text/50 max-w-sm">Please select an existing trip from the Dashboard or create a custom journey in Plan New Trip to load the timeline layout.</p>
      </div>
    );
  }

  const activeDay = trip.itinerary[selectedDayIdx] || trip.itinerary[0];

  // SUM ALL COSTS
  const totalCostOfActivities = trip.itinerary.reduce((sum, day) => {
    const morningCost = day.morning?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const afternoonCost = day.afternoon?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    const eveningCost = day.evening?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
    return sum + morningCost + afternoonCost + eveningCost;
  }, 0);

  const totalSpentAll = (trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0) + totalCostOfActivities;

  // ALL POINTS IN CURRENT DAY FOR MAP PLOTTING
  const mapPoints: { name: string; lat: number; lng: number; type: 'hotel' | 'restaurant' | 'attraction'; time: string; id: string }[] = [];

  if (activeDay) {
    activeDay.morning?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: 'attraction', time: a.time, id: a.id });
    });
    activeDay.afternoon?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: a.type === 'food' ? 'restaurant' : 'attraction', time: a.time, id: a.id });
    });
    activeDay.evening?.forEach(a => {
      mapPoints.push({ name: a.title, lat: a.location.lat, lng: a.location.lng, type: a.type === 'food' ? 'restaurant' : 'attraction', time: a.time, id: a.id });
    });
  }

  // Calculate coordinates bounds for the interactive Vector Map
  const lats = mapPoints.map(p => p.lat);
  const lngs = mapPoints.map(p => p.lng);
  const minLat = Math.min(...lats, 40);
  const maxLat = Math.max(...lats, 41);
  const minLng = Math.min(...lngs, -74);
  const maxLng = Math.max(...lngs, -73);
  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  // PRINT / EXPORT METHOD
  const handleTriggerPrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-earth-bg text-earth-text ${printMode ? "p-0 bg-white text-black" : "p-6 space-y-8"}`}>
      
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-earth-accent">
            <span>JOURNEY ARCHIVE</span>
            <span>•</span>
            <span>{trip.travelStyle}</span>
          </div>
          <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight mt-1">{trip.destination} Luxury Schedule</h1>
          <p className="text-xs text-earth-text/50 mt-1">Spanning {trip.startDate} to {trip.endDate} for {trip.travelers} guests.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="print-itinerary-btn"
            onClick={handleTriggerPrint}
            className="px-5 py-2.5 rounded-full bg-white border border-earth-border text-earth-text hover:bg-earth-light-sage/20 transition-all flex items-center gap-2 text-xs font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 text-earth-accent" />
            <span>Print / Export PDF</span>
          </button>
          <button 
            id="itinerary-favorite-btn"
            onClick={() => onToggleFavorite(trip.id)}
            className={`p-2.5 rounded-full border transition-all ${trip.isFavorite ? "border-rose-200 bg-rose-50 text-rose-500" : "border-earth-border bg-white text-earth-text/50 hover:text-rose-500 shadow-sm"}`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Budget Summary & Weather Warning Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Cash Allocation</span>
          <p className="text-xl font-serif italic text-[#4A4A3A] font-light">${trip.budget.toLocaleString()}</p>
          <div className="w-full h-1 bg-earth-light-sage rounded overflow-hidden mt-2">
            <div 
              className="h-full bg-earth-accent animate-pulse" 
              style={{ width: `${Math.min(100, (totalSpentAll / trip.budget) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Aggressed Spending</span>
          <p className="text-xl font-serif italic text-rose-600 font-light">${totalSpentAll.toLocaleString()}</p>
          <p className="text-[10px] text-earth-text/50 mt-1">Includes activities and ledger bills</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-earth-border space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-[#4A4A3A] uppercase font-medium">Remaining Reserves</span>
          <p className="text-xl font-serif italic text-earth-sage font-medium">
            ${Math.max(0, trip.budget - totalSpentAll).toLocaleString()}
          </p>
          <p className="text-[10px] text-earth-text/50 mt-1">
            {totalSpentAll > trip.budget ? "Spending limit exceeded." : "Budget within target limit."}
          </p>
        </div>

      </div>

      {/* Main Layout: Timeline (Left) & Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Timeline Col */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Day selection tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-earth-border/60">
            {trip.itinerary.map((day, idx) => (
              <button
                id={`day-tab-btn-${day.dayNumber}`}
                key={day.dayNumber}
                onClick={() => setSelectedDayIdx(idx)}
                className={`
                  px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shrink-0 transition-all border
                  ${selectedDayIdx === idx 
                    ? "bg-earth-accent/10 border-earth-accent text-earth-accent font-semibold" 
                    : "bg-white border border-earth-border text-earth-text/75 hover:bg-earth-light-sage/20"}
                `}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {activeDay ? (
            <div className="space-y-6">
              
              {/* Day Theme */}
              <div className="p-5 rounded-2xl bg-earth-light-sage/20 border border-earth-border/40">
                <span className="text-[10px] font-mono text-earth-accent uppercase tracking-widest font-semibold">TODAY'S THEME</span>
                <h2 className="font-serif italic text-xl text-[#4A4A3A] mt-1">{activeDay.theme}</h2>
                <p className="text-xs text-earth-text/75 mt-1">Mapped with custom walking paths and coordinated dining reservations.</p>
              </div>

              {/* Day Activities */}
              <div className="space-y-8 pl-4 border-l-2 border-earth-border relative">
                
                {/* MORNING */}
                {activeDay.morning?.map((act) => (
                  <div 
                    key={act.id} 
                    className="relative"
                    onMouseEnter={() => setHoveredNodeId(act.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-accent border-2 border-earth-bg timeline-dot-glow" />
                    
                    <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-accent/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-accent/10 text-earth-accent border border-earth-accent/20 uppercase font-semibold">MORNING</span>
                          <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                          <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                        </div>
                        {act.image && (
                          <img 
                            src={act.image} 
                            alt={act.title} 
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: ${act.cost}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AFTERNOON */}
                {activeDay.afternoon?.map((act) => (
                  <div 
                    key={act.id} 
                    className="relative"
                    onMouseEnter={() => setHoveredNodeId(act.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-sage border-2 border-earth-bg" />
                    
                    <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-sage/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-sage/10 text-earth-sage border border-earth-sage/20 uppercase font-semibold">AFTERNOON</span>
                          <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                          <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                        </div>
                        {act.image && (
                          <img 
                            src={act.image} 
                            alt={act.title} 
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: ${act.cost}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* EVENING */}
                {activeDay.evening?.map((act) => (
                  <div 
                    key={act.id} 
                    className="relative"
                    onMouseEnter={() => setHoveredNodeId(act.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-earth-dark border-2 border-earth-bg" />
                    
                    <div className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${hoveredNodeId === act.id ? "border-earth-dark/40 bg-[#FAF9F5]" : "border-earth-border"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-earth-dark/10 text-earth-dark border border-earth-dark/20 uppercase font-semibold">EVENING</span>
                          <h4 className="font-serif italic text-earth-text text-lg mt-2">{act.title}</h4>
                          <p className="text-xs text-earth-text/75 font-light leading-relaxed">{act.description}</p>
                        </div>
                        {act.image && (
                          <img 
                            src={act.image} 
                            alt={act.title} 
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-earth-border/60 text-[11px] text-earth-text/60 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-earth-accent" />{act.time} ({act.duration})</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-earth-sage" />Cost: ${act.cost}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-earth-dark" />{act.location.name}</span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>

            </div>
          ) : (
            <p className="text-earth-text/50 text-xs">No day schedule has been compiled yet.</p>
          )}

        </div>

        {/* Spatial Maps Col */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Curated Dark-Style Spatial Route Map */}
          <div className="p-6 rounded-[32px] bg-white border border-earth-border space-y-4 shadow-sm">
            <div>
              <h3 className="font-serif italic font-light text-earth-text text-lg">Spatial Route Canvas</h3>
              <p className="text-[10px] text-earth-text/50">Day {selectedDayIdx + 1} Coordinate mapping</p>
            </div>

            {/* Custom Interactive SVG Map Grid */}
            <div className="relative h-64 bg-earth-light-sage/10 rounded-2xl border border-earth-border overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full absolute inset-0 text-earth-border/40" viewBox="0 0 100 100">
                {/* Map Grid Lines */}
                <line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="40" y1="0" x2="40" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="60" y1="0" x2="60" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />

                {/* Draw Route Paths between coordinate nodes */}
                {mapPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#C5A880"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                    points={mapPoints.map(p => {
                      const x = 10 + ((p.lng - minLng) / lngRange) * 80;
                      const y = 80 - ((p.lat - minLat) / latRange) * 60;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                )}

                {/* Draw Nodes */}
                {mapPoints.map((p, idx) => {
                  const x = 10 + ((p.lng - minLng) / lngRange) * 80;
                  const y = 80 - ((p.lat - minLat) / latRange) * 60;
                  const isHovered = hoveredNodeId === p.id;
                  
                  return (
                    <g key={p.id} className="cursor-pointer" onMouseEnter={() => setHoveredNodeId(p.id)} onMouseLeave={() => setHoveredNodeId(null)}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 4}
                        fill={p.type === 'restaurant' ? "#8F9E8B" : p.type === 'hotel' ? "#5F5E4E" : "#C5A880"}
                        className="transition-all duration-300"
                      />
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="none"
                          stroke="#C5A880"
                          strokeWidth="1.0"
                          className="animate-ping"
                        />
                      )}
                      <text
                        x={x}
                        y={y - 8}
                        fill="#4A4A3A"
                        fontSize="6"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-sm font-sans"
                      >
                        {idx + 1}. {p.name.slice(0, 15)}...
                      </text>
                    </g>
                  );
                })}
              </svg>

              {mapPoints.length === 0 && (
                <span className="text-xs text-earth-text/50 font-mono">Vetting coordinate feeds...</span>
              )}

              {/* Map Legend panel */}
              <div className="absolute bottom-3 left-3 bg-white/95 border border-earth-border rounded-lg shadow-sm p-2 flex gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-earth-accent" />Attractions</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-earth-sage" />Gastronomy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-earth-dark" />Lodging</span>
              </div>
            </div>
          </div>

          {/* Curated Lodging suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Vetted Lodging Guides</h3>
              <span className="text-xs text-earth-text/50 font-mono">Curated Selection</span>
            </div>

            <div className="space-y-4">
              {trip.hotels && trip.hotels.length > 0 ? (
                trip.hotels.map((h) => (
                  <div key={h.id} className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 group hover:border-earth-sage/30 transition-all shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={h.imageUrl} 
                        alt={h.name} 
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-earth-accent text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-semibold font-mono">{h.rating}</span>
                        </div>
                        <h4 className="font-serif italic text-earth-text text-base group-hover:text-earth-accent transition-colors">{h.name}</h4>
                        <p className="text-[11px] text-earth-text/50">{h.distance}</p>
                      </div>
                    </div>
                    <p className="text-xs text-earth-text/75 font-light leading-relaxed">{h.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-earth-border/60 text-xs font-mono">
                      <span>Price: <strong className="text-earth-text">${h.price}/night</strong></span>
                      <button 
                        id={`add-hotel-expense-${h.id}`}
                        onClick={() => onAddExpense(trip.id, h.price * 3, `Hotel Stay: ${h.name}`, "hotel")}
                        className="px-3 py-1.5 rounded-full bg-earth-light-sage/35 hover:bg-earth-accent/20 text-earth-accent border border-earth-border/50 transition-all font-sans text-[11px] font-medium"
                      >
                        Log Bills (${h.price * 3})
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-earth-text/50">No hotel profiles generated for this coordinate range.</p>
              )}
            </div>
          </div>

          {/* Curated Gastronomy Dining guides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic font-light text-earth-text text-xl">Curated Gastronomy</h3>
              <span className="text-xs text-earth-text/50 font-mono">Michelin Vetted</span>
            </div>

            <div className="space-y-4">
              {trip.restaurants && trip.restaurants.length > 0 ? (
                trip.restaurants.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white border border-earth-border space-y-3 group hover:border-earth-sage/30 transition-all shadow-sm">
                    <div className="flex gap-4">
                      <img 
                        src={r.imageUrl} 
                        alt={r.name} 
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-earth-border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-earth-accent flex items-center"><Star className="w-3.5 h-3.5 fill-current mr-0.5" />{r.rating}</span>
                          <span className="text-earth-border">•</span>
                          <span className="text-earth-accent font-bold font-mono">{r.priceRange}</span>
                          <span className="text-earth-border">•</span>
                          <span className="text-earth-text/75 capitalize">{r.cuisine}</span>
                        </div>
                        <h4 className="font-serif italic text-earth-text text-base group-hover:text-earth-accent transition-colors">{r.name}</h4>
                        <p className="text-[11px] text-earth-text/50">{r.distance}</p>
                      </div>
                    </div>
                    <p className="text-xs text-earth-text/75 font-light leading-relaxed">{r.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-earth-border/60 text-[11px] text-earth-text/50 font-mono">
                      <span>Reviews: {r.reviewsCount} logged</span>
                      <div className="flex gap-2 text-[10px]">
                        {r.isVegetarian && <span className="px-1.5 py-0.5 rounded bg-earth-sage/10 border border-earth-sage/25 text-earth-sage">VEG</span>}
                        {r.isNonVegetarian && <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600">MEAT</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-earth-text/50">No restaurants curated for this food preference style.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
