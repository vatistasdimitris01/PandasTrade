
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
  X,
  CreditCard
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
      if (isSecurityEnabled) setBiometricEnabled(false); // Disable biometrics if security is off
      toast.success(isSecurityEnabled ? 'Security disabled' : 'Security enabled');
    }
  };

  // Real Biometric Registration Toggle
  const toggleBiometrics = async () => {
    if (!isSecurityEnabled) {
      toast.error('Please enable PIN security first');
      return;
    }

    if (isBiometricEnabled) {
      setBiometricEnabled(false);
      toast.success('Biometrics disabled');
      return;
    }

    try {
      if (window.PublicKeyCredential && 
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        
        // Native "Allow this app to use Face ID/Touch ID?" prompt
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Fix: userVerification belongs inside authenticatorSelection for PublicKeyCredentialCreationOptions
        const options: CredentialCreationOptions = {
          publicKey: {
            challenge,
            rp: { name: "PandasTrade" },
            user: {
              id: new Uint8Array(16),
              name: name,
              displayName: name
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: {
              userVerification: "required"
            }
          }
        };

        await navigator.credentials.create(options);
        
        setBiometricEnabled(true);
        toast.success('Face ID linked successfully');
      } else {
        // Fallback simulation
        setBiometricEnabled(true);
        toast.success('Biometric simulation enabled');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('Authentication required to link biometrics');
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

  const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-32 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-8 lg:pt-16 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-neutral-900/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors md:hidden active:scale-90 transform duration-150"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95"
          >
            <Check size={16} />
            <span>Save</span>
          </button>
        </div>

        <div className="px-6 py-8 space-y-10">
          {/* Profile Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User size={20} className="text-neutral-400" />
              Profile
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-neutral-900/30 p-6 rounded-3xl border border-neutral-800/50">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-800 bg-neutral-900">
                  <img src={localAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 w-full space-y-4">
                <InputGroup label="Display Name">
                  <input 
                    type="text" 
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </InputGroup>
                <InputGroup label="Avatar URL">
                  <input 
                    type="text" 
                    value={localAvatar}
                    onChange={(e) => setLocalAvatar(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </InputGroup>
              </div>
            </div>
          </section>

          {/* Finances Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard size={20} className="text-neutral-400" />
              Finances
            </h2>
            <div className="bg-neutral-900/30 p-6 rounded-3xl border border-neutral-800/50">
              <InputGroup label="Available Balance">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">{currency}</span>
                  <input 
                    ref={balanceInputRef}
                    type="number" 
                    value={localBalance}
                    onChange={(e) => setLocalBalance(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </div>
              </InputGroup>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              Security
            </h2>
            <div className="bg-neutral-900/30 rounded-3xl border border-neutral-800/50 divide-y divide-neutral-800/50 overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Scan size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Face ID / Biometrics</p>
                    <p className="text-neutral-500 text-xs">Require authentication on launch</p>
                  </div>
                </div>
                <button 
                  onClick={toggleBiometrics}
                  className={`w-14 h-8 rounded-full transition-all relative ${isBiometricEnabled ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${isBiometricEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Lock size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold">App Lock (PIN)</p>
                    <p className="text-neutral-500 text-xs">Master security: {pin ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleSecurity}
                  className={`w-14 h-8 rounded-full transition-all relative ${isSecurityEnabled ? 'bg-blue-500' : 'bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${isSecurityEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              
              {isSecurityEnabled && (
                <button 
                  onClick={() => setIsPinModalOpen(true)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-800/30 transition-colors"
                >
                  <p className="text-white font-bold">Change PIN</p>
                  <ChevronLeft size={20} className="text-neutral-700 rotate-180" />
                </button>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-10">
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
              <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                <RefreshCw size={18} />
                Danger Zone
              </h3>
              <p className="text-neutral-500 text-sm mb-6">
                Resetting your account will wipe all holdings, trade history, and custom configurations.
              </p>
              <button 
                onClick={handleReset}
                className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Reset All Account Data
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPinModalOpen(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Setup PIN</h2>
              <button onClick={() => setIsPinModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <input 
                type="password"
                maxLength={4}
                placeholder="0000"
                value={localPin}
                onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black border border-neutral-800 rounded-2xl py-6 text-center text-4xl font-bold tracking-[1em] text-white focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
              
              <button 
                onClick={handlePinSave}
                disabled={localPin.length !== 4}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  localPin.length === 4 
                    ? 'bg-white text-black hover:bg-neutral-200' 
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                Confirm PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
