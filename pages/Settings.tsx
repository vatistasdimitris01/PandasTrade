
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  RefreshCw, 
  Camera, 
  Check, 
  Lock, 
  ShieldCheck, 
  Scan,
  // Added missing icon import
  ArrowUpRight,
  X,
  CreditCard,
  Bell,
  Eye,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useUserStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    name, setName, 
    avatar, setAvatar, 
    currency, 
    resetAccount, 
    balance, setBalance, 
    pin, setPin,
    isSecurityEnabled, setSecurityEnabled,
    isBiometricEnabled, setBiometricEnabled
  } = useUserStore();

  const [localName, setLocalName] = useState(name);
  const [localAvatar, setLocalAvatar] = useState(avatar);
  const [localBalance, setLocalBalance] = useState(balance.toString());
  const [localPin, setLocalPin] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const balanceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== balanceInputRef.current) {
      setLocalBalance(balance.toString());
    }
  }, [balance]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSave = () => {
    setName(localName);
    setAvatar(localAvatar);
    const numBalance = parseFloat(localBalance);
    if (!isNaN(numBalance)) {
      setBalance(numBalance);
    }
    setIsProfileEditOpen(false);
    toast.success('Settings updated');
  };

  const handlePinSave = () => {
    if (localPin.length === 4) {
      setPin(localPin);
      setSecurityEnabled(true);
      setIsPinModalOpen(false);
      setLocalPin('');
      toast.success('Security PIN set');
    } else {
      toast.error('PIN must be 4 digits');
    }
  };

  const toggleSecurity = () => {
    if (!pin && !isSecurityEnabled) {
      setIsPinModalOpen(true);
    } else {
      setSecurityEnabled(!isSecurityEnabled);
      if (isSecurityEnabled) setBiometricEnabled(false);
      toast.success(isSecurityEnabled ? 'Security disabled' : 'Security enabled');
    }
  };

  const toggleBiometrics = async () => {
    if (!isSecurityEnabled) {
      toast.error('Enable PIN security first');
      return;
    }

    if (isBiometricEnabled) {
      setBiometricEnabled(false);
      toast.success('Biometrics disabled');
      return;
    }

    try {
      if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const options: CredentialCreationOptions = {
          publicKey: {
            challenge,
            rp: { name: "PandasTrade" },
            user: { id: new Uint8Array(16), name: name, displayName: name },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: { userVerification: "required" }
          }
        };
        await navigator.credentials.create(options);
        setBiometricEnabled(true);
        toast.success('Face ID linked');
      } else {
        setBiometricEnabled(true);
        toast.success('Biometric simulation enabled');
      }
    } catch (err) {
      toast.error('Authentication failed');
    }
  };

  const handleReset = () => {
    if (confirm('This will permanently delete your portfolio history. Continue?')) {
      resetAccount();
      setLocalBalance("160");
      toast.success('Account reset successfully');
      navigate('/');
    }
  };

  // Made children optional to fix "Property 'children' is missing" TS error
  const SettingsGroup = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-2">{title}</h3>
      <div className="bg-neutral-900/50 rounded-[2rem] border border-neutral-800/50 overflow-hidden divide-y divide-neutral-800/30">
        {children}
      </div>
    </div>
  );

  const SettingsRow = ({ icon, label, sublabel, action, value, toggle }: { 
    icon: React.ReactNode; 
    label: string; 
    sublabel?: string; 
    action?: () => void;
    value?: string | React.ReactNode;
    toggle?: boolean;
  }) => (
    <div 
      onClick={action}
      className={`p-5 flex items-center justify-between transition-colors ${action ? 'active:bg-neutral-800 cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">{label}</p>
          {sublabel && <p className="text-neutral-500 text-[10px] mt-0.5 font-medium">{sublabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-neutral-500 text-xs font-bold">{value}</span>}
        {toggle !== undefined && (
          <div className={`w-10 h-6 rounded-full transition-colors relative ${toggle ? 'bg-emerald-500' : 'bg-neutral-800'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${toggle ? 'left-5' : 'left-1'}`} />
          </div>
        )}
        {action && !toggle && !value && <ChevronRight size={16} className="text-neutral-700" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-32 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white active:scale-90 transition-all">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tighter">Settings</h1>
          </div>
        </div>

        <div className="px-6 space-y-8">
          {/* Profile Card */}
          <section className="bg-gradient-to-br from-neutral-900 to-black rounded-[2.5rem] p-6 border border-neutral-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-neutral-800 ring-4 ring-emerald-500/10">
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setIsProfileEditOpen(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-lg active:scale-90"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white text-xl font-bold">{name}</h2>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Pro Member</span>
                </div>
                <p className="text-neutral-500 text-xs font-medium mb-3">Joined January 2024</p>
                <button 
                   onClick={() => setIsProfileEditOpen(true)}
                   className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Edit Profile <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </section>

          <SettingsGroup title="Financial">
            <SettingsRow 
              icon={<CreditCard size={18} />} 
              label="Available Balance" 
              value={`${currency}${balance.toLocaleString()}`}
            />
            <SettingsRow 
              icon={<ArrowUpRight size={18} />} 
              label="Main Currency" 
              value="EUR (€)" 
            />
          </SettingsGroup>

          <SettingsGroup title="App Preferences">
            <SettingsRow 
              icon={<Bell size={18} />} 
              label="Push Notifications" 
              sublabel="Price alerts and trade confirmations"
              toggle={notifications}
              action={() => setNotifications(!notifications)}
            />
            <SettingsRow 
              icon={<Eye size={18} />} 
              label="Privacy Mode" 
              sublabel="Hide balance on app launch"
              toggle={privacyMode}
              action={() => setPrivacyMode(!privacyMode)}
            />
            <SettingsGroup title="Security">
              <SettingsRow 
                icon={<Lock size={18} />} 
                label="App Lock (PIN)" 
                sublabel={isSecurityEnabled ? 'System locked with PIN' : 'Add security layer'}
                toggle={isSecurityEnabled}
                action={toggleSecurity}
              />
              <SettingsRow 
                icon={<Scan size={18} />} 
                label="Face ID / Biometrics" 
                sublabel="Unlock with biometrics"
                toggle={isBiometricEnabled}
                action={toggleBiometrics}
              />
            </SettingsGroup>
          </SettingsGroup>

          <SettingsGroup title="Support & Info">
            <SettingsRow icon={<HelpCircle size={18} />} label="Help Center" action={() => {}} />
            <SettingsRow icon={<SettingsIcon size={18} />} label="Advanced Features" action={() => {}} />
            <SettingsRow icon={<LogOut size={18} />} label="Reset App Data" action={handleReset} />
          </SettingsGroup>
          
          <div className="text-center pt-4 pb-8">
            <p className="text-neutral-700 text-[10px] font-black uppercase tracking-[0.3em]">PandasTrade v1.4.2</p>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isProfileEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsProfileEditOpen(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-tighter">Edit Profile</h2>
              <button onClick={() => setIsProfileEditOpen(false)} className="text-neutral-500 active:scale-90"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={localName} 
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Avatar URL</label>
                <input 
                  type="text" 
                  value={localAvatar} 
                  onChange={(e) => setLocalAvatar(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Balance Override</label>
                <input 
                  type="number" 
                  value={localBalance} 
                  onChange={(e) => setLocalBalance(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsPinModalOpen(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 w-full max-sm rounded-[2.5rem] p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter">Set Master PIN</h2>
              <p className="text-neutral-500 text-xs font-medium mt-2">Create a 4-digit code to protect your assets.</p>
            </div>
            <div className="space-y-8">
              <input 
                type="password"
                maxLength={4}
                placeholder="0000"
                value={localPin}
                onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black border border-neutral-800 rounded-3xl py-6 text-center text-5xl font-black tracking-[0.5em] text-white focus:border-emerald-500 focus:outline-none transition-all"
                autoFocus
              />
              <button 
                onClick={handlePinSave}
                disabled={localPin.length !== 4}
                className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest transition-all ${
                  localPin.length === 4 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-neutral-800 text-neutral-600'
                }`}
              >
                Set PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
