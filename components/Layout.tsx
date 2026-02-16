
import React from 'react';
import { useUserStore } from '../lib/store';

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { name, avatar } = useUserStore();

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Background Glows for Subtle Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 w-full min-h-screen bg-transparent relative z-10 pt-safe transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
