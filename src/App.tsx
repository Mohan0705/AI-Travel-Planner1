import React from "react";
import { 
  Compass, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar, 
  Heart, 
  Copy, 
  Trash2, 
  Sun, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";

// Sub-components
import Sidebar from "./components/Sidebar";
import DiscoverView from "./components/DiscoverView";
import DashboardView from "./components/DashboardView";
import CreateTripView from "./components/CreateTripView";
import ItineraryView from "./components/ItineraryView";
import ChatAssistantView from "./components/ChatAssistantView";
import ExpenseTrackerView from "./components/ExpenseTrackerView";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";

// Data & Store
import { 
  getTrips, 
  saveTrips, 
  getAdminLogs, 
  addAdminLog, 
  clearAdminLogs, 
  getNotifications, 
  markNotificationsAsRead, 
  PRESET_TRIPS 
} from "./dataStore";
import { Trip, User, AdminLog, TravelNotification } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>("discover");
  
  // Auth state
  const [currentUser, setCurrentUser] = React.useState<User | null>(() => {
    const savedUser = localStorage.getItem("voyage_user");
    if (savedUser) return JSON.parse(savedUser);
    
    // Default logged in user from previous setup
    const defaultUser: User = {
      id: "user-akhil",
      email: "akhilvarmakshatriya3@gmail.com",
      username: "akhilvarmakshatriya3",
      role: "admin", // Give admin privilege by default for complete feature exploration
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("voyage_user", JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [initialDestination, setInitialDestination] = React.useState("");

  // Loaded Trips
  const [trips, setTrips] = React.useState<Trip[]>(() => {
    return getTrips();
  });

  // Active loaded trip (defaulting to the first available trip)
  const [activeTrip, setActiveTrip] = React.useState<Trip | null>(() => {
    const loaded = getTrips();
    return loaded.length > 0 ? loaded[0] : null;
  });

  // Administrative Logs
  const [logs, setLogs] = React.useState<AdminLog[]>(() => {
    return getAdminLogs();
  });

  // Alert Notifications
  const [notifications, setNotifications] = React.useState<TravelNotification[]>(() => {
    return getNotifications();
  });

  // Dynamic quick trip generation callback
  const handleTripGenerated = (newTrip: Trip) => {
    const updated = [newTrip, ...trips];
    setTrips(updated);
    saveTrips(updated);
    setActiveTrip(newTrip);
    
    // Log action
    const message = `Orchestrated new multi-agent itinerary to ${newTrip.destination}, ${newTrip.country}`;
    const nextLogs = addAdminLog(message, "generation", currentUser?.username || "anonymous");
    setLogs(nextLogs);

    // Push new alert
    const newAlert: TravelNotification = {
      id: `alert-${Date.now()}`,
      type: "system",
      title: "Itinerary Ready",
      message: `BESPOKE PLAN READY: Hour-by-hour itinerary for ${newTrip.destination} has been compiled successfully.`,
      read: false,
      date: "Just now"
    };
    const storedAlerts = JSON.parse(localStorage.getItem("voyage_notifications") || "[]");
    const nextAlerts = [newAlert, ...storedAlerts];
    localStorage.setItem("voyage_notifications", JSON.stringify(nextAlerts));
    setNotifications(nextAlerts);

    setActiveTab("itinerary");
  };

  const handleDeleteTrip = (tripId: string) => {
    const targetTrip = trips.find(t => t.id === tripId);
    const updated = trips.filter(t => t.id !== tripId);
    setTrips(updated);
    saveTrips(updated);

    if (activeTrip?.id === tripId) {
      setActiveTrip(updated.length > 0 ? updated[0] : null);
    }

    if (targetTrip) {
      const nextLogs = addAdminLog(`Purged travel record for ${targetTrip.destination}`, "deletion", currentUser?.username || "anonymous");
      setLogs(nextLogs);
    }
  };

  const handleDuplicateTrip = (tripId: string) => {
    const original = trips.find(t => t.id === tripId);
    if (!original) return;

    const copy: Trip = {
      ...original,
      id: `trip-copy-${Date.now()}`,
      destination: `${original.destination} (Copy)`,
      createdAt: new Date().toISOString()
    };

    const updated = [copy, ...trips];
    setTrips(updated);
    saveTrips(updated);
    setActiveTrip(copy);

    const nextLogs = addAdminLog(`Duplicated travel profile: ${original.destination}`, "duplication", currentUser?.username || "anonymous");
    setLogs(nextLogs);
  };

  const handleToggleFavorite = (tripId: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        const nextFavState = !t.isFavorite;
        addAdminLog(`${nextFavState ? "Favorited" : "Unfavorited"} destination ${t.destination}`, "favorite", currentUser?.username || "anonymous");
        return { ...t, isFavorite: nextFavState };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);
    setLogs(getAdminLogs());

    if (activeTrip?.id === tripId) {
      const match = updated.find(t => t.id === tripId);
      if (match) setActiveTrip(match);
    }
  };

  const handleAddExpense = (tripId: string, amount: number, title: string, category: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        const newExpense = {
          id: `exp-${Date.now()}`,
          title,
          amount,
          category,
          date: new Date().toISOString().slice(0, 10)
        };
        const nextExpenses = [newExpense, ...(t.expenses || [])];
        return { ...t, expenses: nextExpenses };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    const matchedTrip = updated.find(t => t.id === tripId);
    if (matchedTrip) {
      setActiveTrip(matchedTrip);
      const logMessage = `Logged bill for ${title} ($${amount}) on ${matchedTrip.destination} ledger`;
      setLogs(addAdminLog(logMessage, "expense", currentUser?.username || "anonymous"));
    }
  };

  const handleRemoveExpense = (tripId: string, expenseId: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        const nextExpenses = (t.expenses || []).filter(e => e.id !== expenseId);
        return { ...t, expenses: nextExpenses };
      }
      return t;
    });

    setTrips(updated);
    saveTrips(updated);

    const matchedTrip = updated.find(t => t.id === tripId);
    if (matchedTrip) {
      setActiveTrip(matchedTrip);
      setLogs(addAdminLog(`Removed transaction bill from ${matchedTrip.destination} ledger`, "expense", currentUser?.username || "anonymous"));
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_TRIPS.find(p => p.id === presetId);
    if (!preset) return;

    // Check if we already have this preset loaded
    const alreadyExists = trips.some(t => t.destination === preset.destination);
    if (alreadyExists) {
      const match = trips.find(t => t.destination === preset.destination);
      if (match) {
        setActiveTrip(match);
        setActiveTab("itinerary");
        return;
      }
    }

    // Duplicate preset with fresh dates to avoid stale presets
    const currentYear = new Date().getFullYear();
    const freshTrip: Trip = {
      ...preset,
      id: `trip-preset-${Date.now()}`,
      startDate: `${currentYear}-07-10`,
      endDate: `${currentYear}-07-15`,
      isSaved: true,
      isFavorite: false,
      expenses: [],
      createdAt: new Date().toISOString()
    };

    const updated = [freshTrip, ...trips];
    setTrips(updated);
    saveTrips(updated);
    setActiveTrip(freshTrip);

    setLogs(addAdminLog(`Loaded luxury preset itinerary for ${preset.destination}`, "preset", currentUser?.username || "anonymous"));
    setActiveTab("itinerary");
  };

  const handlePlanCustomTrip = (destName?: string) => {
    setInitialDestination(destName || "");
    setActiveTab("create");
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("voyage_user", JSON.stringify(user));
    setLogs(addAdminLog(`Authenticated user: ${user.username}`, "auth", user.username));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("voyage_user");
    setLogs(addAdminLog("Deauthenticated active session", "auth", "anonymous"));
  };

  const handleSwitchRole = () => {
    if (!currentUser) return;
    const nextRole = currentUser.role === "admin" ? "user" : "admin";
    const updated = { ...currentUser, role: nextRole };
    setCurrentUser(updated);
    localStorage.setItem("voyage_user", JSON.stringify(updated));
    setLogs(addAdminLog(`Developer security privilege override: switched to ${nextRole.toUpperCase()}`, "auth", currentUser.username));
  };

  const handleClearLogs = () => {
    clearAdminLogs();
    setLogs([]);
  };

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
    setNotifications(getNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-earth-bg font-sans antialiased text-earth-text">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchRole={handleSwitchRole}
        unreadCount={unreadCount}
      />

      {/* Main Panel views switcher */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {activeTab === "discover" && (
          <DiscoverView 
            onPlanTrip={handlePlanCustomTrip} 
            onLoadPreset={handleLoadPreset} 
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardView 
            trips={trips}
            activeTrip={activeTrip}
            onSelectTrip={(id) => {
              const matched = trips.find(t => t.id === id);
              if (matched) {
                setActiveTrip(matched);
                setActiveTab("itinerary");
              }
            }}
            onDeleteTrip={handleDeleteTrip}
            onDuplicateTrip={handleDuplicateTrip}
            onToggleFavorite={handleToggleFavorite}
            onPlanCustomTrip={() => setActiveTab("create")}
            onOpenWeatherCity={activeTrip?.destination || "Kyoto"}
          />
        )}

        {activeTab === "create" && (
          <CreateTripView 
            onTripGenerated={handleTripGenerated}
            initialDestination={initialDestination}
          />
        )}

        {activeTab === "itinerary" && (
          <ItineraryView 
            trip={activeTrip}
            onToggleFavorite={handleToggleFavorite}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === "chat" && (
          <ChatAssistantView 
            currentTrip={activeTrip} 
          />
        )}

        {activeTab === "expenses" && (
          <ExpenseTrackerView 
            trip={activeTrip}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />
        )}

        {activeTab === "notifications" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-earth-bg">
            <div className="flex items-center justify-between border-b border-earth-border pb-4">
              <div>
                <h1 className="font-serif italic font-light text-3xl text-earth-text tracking-tight">Alert Center</h1>
                <p className="text-xs text-earth-text/60 mt-1">Real-time alerts, flight status updates, and security disclosures.</p>
              </div>

              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 rounded-full bg-white border border-earth-border text-xs font-semibold hover:bg-earth-accent/10 text-earth-accent transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Dismiss All Alerts</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-w-3xl">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition-all
                    ${notif.read 
                      ? "bg-white/40 border-earth-border/40 opacity-60" 
                      : "bg-white border-earth-accent/30 shadow-sm"
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${notif.read ? "bg-earth-bg text-earth-text/60" : "bg-earth-accent/10 text-earth-accent animate-pulse"}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-earth-text leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] font-mono text-earth-text/50">{notif.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "admin" && currentUser?.role === "admin" && (
          <AdminPanel 
            logs={logs}
            onClearLogs={handleClearLogs}
            tripsCount={trips.length}
          />
        )}

      </main>

      {/* Auth Drawer Modal overlay */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
