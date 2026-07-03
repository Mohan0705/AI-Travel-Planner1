import React from "react";
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { User as UserType } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

type AuthTab = "login" | "register" | "forgot";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState<AuthTab>("login");
  
  // Input fields
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  
  // Message and Validation States
  const [errMessage, setErrMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");
    setSuccessMessage("");

    // BASIC VALS
    if (!email.trim()) {
      setErrMessage("Email coordinate is required.");
      return;
    }
    if (activeTab === "register" && !username.trim()) {
      setErrMessage("Please enter a username.");
      return;
    }

    // Email Pattern validator
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrMessage("Please enter a valid email address.");
      return;
    }

    if (activeTab !== "forgot") {
      if (!password || password.length < 6) {
        setErrMessage("Password must be at least 6 characters.");
        return;
      }
    }

    if (activeTab === "register") {
      if (password !== confirmPassword) {
        setErrMessage("Passwords do not match.");
        return;
      }
    }

    // PROCESS LOGIN/REGISTRATION
    if (activeTab === "login") {
      // Create user
      const user: UserType = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        username: email.split("@")[0],
        role: "user",
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      onClose();
    } else if (activeTab === "register") {
      const user: UserType = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        username: username.trim(),
        role: "user",
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      onClose();
    } else if (activeTab === "forgot") {
      setSuccessMessage("A password recovery transmission has been dispatched to your email address.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-earth-border rounded-2xl p-6 relative space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button 
          id="close-auth-modal"
          onClick={onClose}
          className="p-2 text-earth-text/50 hover:text-earth-text rounded-lg hover:bg-earth-light-sage/20 absolute top-4 right-4 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-xl bg-earth-accent/10 border border-earth-accent/20 text-earth-accent mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif italic font-light text-2xl text-earth-text tracking-tight">
            {activeTab === "login" && "Access Voyage Vault"}
            {activeTab === "register" && "Create Luxury Account"}
            {activeTab === "forgot" && "Recover Passkey"}
          </h2>
          <p className="text-xs text-earth-text/60 font-light max-w-[280px] mx-auto">
            {activeTab === "login" && "Unlock global route persistence, ledger synchronization, and concierge AI chats."}
            {activeTab === "register" && "Begin your lifetime travel ledger mapping. Completely secure, offline-first storage."}
            {activeTab === "forgot" && "Dispatches cryptographic recovery instructions directly to your email coordinates."}
          </p>
        </div>

        {errMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-earth-light-sage/50 border border-earth-border flex items-start gap-2.5 text-xs text-earth-sage font-medium">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">USERNAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. wanderlust"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">EMAIL COORDINATE</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voyager@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
              />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">SECURE PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-confirmpass-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          {activeTab === "login" && (
            <div className="text-right">
              <button 
                id="auth-switch-forgot"
                type="button" 
                onClick={() => setActiveTab("forgot")}
                className="text-[10px] font-mono text-earth-accent hover:text-earth-accent/80 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-3.5 rounded-full bg-earth-accent hover:bg-earth-accent/90 text-white font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 font-sans shadow-sm"
          >
            <span>
              {activeTab === "login" && "Unlock Vault"}
              {activeTab === "register" && "Register Ledger"}
              {activeTab === "forgot" && "Reset Passkey"}
            </span>
          </button>

        </form>

        {/* Tab Switcher links */}
        <div className="border-t border-earth-border pt-4 flex justify-between text-xs font-medium font-sans text-earth-text/75">
          {activeTab === "login" ? (
            <span>New Voyager? <button id="auth-switch-register" onClick={() => { setActiveTab("register"); setErrMessage(""); }} className="text-earth-accent hover:underline font-bold">Register Account</button></span>
          ) : (
            <span>Already have credentials? <button id="auth-switch-login" onClick={() => { setActiveTab("login"); setErrMessage(""); }} className="text-earth-accent hover:underline font-bold">Sign In</button></span>
          )}
        </div>

      </div>
    </div>
  );
}
