import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CyberBackground } from '../common/CyberBackground';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#050811] text-slate-100 relative overflow-hidden">
      {/* Animated Cyber Particles & Ambient Grid Background */}
      <CyberBackground />

      {/* Main SOC Dashboard Application UI */}
      <div className="flex min-h-screen w-full relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
