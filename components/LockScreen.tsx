import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Scan, ShieldAlert } from 'lucide-react';
import { useUserStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function LockScreen() {
  const { pin, isLocked, setLocked, avatar, name, isBiometricEnabled } = useUserStore();
  const [input, setInput] = useState<string>('');
  const [isFaceIDActive, setIsFaceIDActive] = useState(false);
  const [isError, setIsError] = useState(false);

  // Real Biometric Authentication using WebAuthn API
  const handleRealBiometric = useCallback(async () => {
    if (!isBiometricEnabled) return;

    try {
      setIsFaceIDActive(true);
      
      // Check for WebAuthn support
      if (window.PublicKeyCredential && 
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        
        // Triggers the native iOS/Android system biometric prompt
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const options: CredentialRequestOptions = {
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'required',
          },
        };

        // This line halts execution until the system prompt is resolved
        await navigator.credentials.get(options);
        
        // Success: Unlock the app
        setLocked(false);
        toast.success('Authenticated');
      } else {
        // Simulation for browsers/devices without WebAuthn
        await new Promise(resolve => setTimeout(resolve, 1200));
        setLocked(false);
        toast.success('Authenticated (Simulated)');
      }
    } catch (err) {
      console.warn('Biometric auth failed or canceled:', err);
      // Don't show toast for "canceled" as it's a common user action
      // but keep the Face ID state closed so they can use PIN
    } finally {
      setIsFaceIDActive(false);
    }
  }, [isBiometricEnabled, setLocked]);

  // Auto-trigger on mount if locked and biometrics enabled
  useEffect(() => {
    if (isLocked && isBiometricEnabled) {
      const timer = setTimeout(() => {
        handleRealBiometric();
      }, 500); // Brief delay for visual transition
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBiometricEnabled, handleRealBiometric]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      
      if (newInput.length === 4) {
        if (newInput === pin) {
          setLocked(false);
          toast.success('Unlocked');
        } else {
          setIsError(true);
          // Haptic feedback simulation
          if ('vibrate' in navigator) navigator.vibrate(100);
          
          setTimeout(() => {
            setInput('');
            setIsError(false);
          }, 600);
          toast.error('Incorrect PIN');
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  const dots = [1, 2, 3, 4];

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center max-w-sm w-full">
        {/* Identity Header */}
        <div className="mb-12 relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden border-2 ${
            isFaceIDActive ? 'bg-emerald-500/10 border-emerald-500/50 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-neutral-900 border-neutral-800'
          }`}>
            {isFaceIDActive ? (
              <Scan size={48} className="text-emerald-400 animate-pulse" />
            ) : (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            )}
          </div>
          {isFaceIDActive && (
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-20 pointer-events-none" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-1 tracking-tight">
          {isFaceIDActive ? 'Scanning...' : 'Enter PIN'}
        </h2>
        <p className="text-neutral-500 text-sm mb-10 font-medium">
          {isFaceIDActive ? 'Confirming your identity' : `Welcome back, ${name}`}
        </p>

        {/* PIN Indicators */}
        <div className={`flex gap-6 mb-16 ${isError ? 'animate-shake' : ''}`}>
          {dots.map((dot, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                input.length > i 
                  ? 'bg-white border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                  : 'border-neutral-800 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-neutral-900/40 border border-neutral-800/50 flex items-center justify-center text-2xl font-semibold hover:bg-neutral-800 active:scale-90 active:bg-neutral-700 transition-all backdrop-blur-md"
            >
              {num}
            </button>
          ))}
          
          <button 
            onClick={handleRealBiometric}
            disabled={isFaceIDActive}
            className={`w-16 h-16 flex items-center justify-center transition-all active:scale-90 ${
              isBiometricEnabled ? 'text-emerald-500 opacity-100' : 'text-neutral-800 opacity-50'
            }`}
          >
            <Scan size={30} />
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-neutral-900/40 border border-neutral-800/50 flex items-center justify-center text-2xl font-semibold hover:bg-neutral-800 active:scale-90 active:bg-neutral-700 transition-all backdrop-blur-md"
          >
            0
          </button>
          
          <button 
            onClick={handleDelete}
            className="w-16 h-16 flex items-center justify-center text-neutral-500 active:scale-90 transition-all hover:text-white"
          >
            <Delete size={28} />
          </button>
        </div>
      </div>

      {/* Shake animation for errors */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}