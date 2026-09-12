import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
  title?: string;
  theme?: 'light' | 'dark' | 'system';
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, title }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {title && (
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
      )}
      {/* Outer Phone Hardware Frame */}
      <div className="relative w-[375px] h-[812px] bg-slate-900 dark:bg-black rounded-[50px] p-3 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex-shrink-0 transition-all duration-300 transform hover:scale-[1.02]">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 inset-x-0 mx-auto w-40 h-7 bg-slate-900 dark:bg-black rounded-b-3xl z-50"></div>
        
        {/* Power Button */}
        <div className="absolute top-32 right-[-2px] w-1 h-16 bg-slate-800 dark:bg-slate-700 rounded-l-none rounded-r-md"></div>
        {/* Volume Buttons */}
        <div className="absolute top-32 left-[-2px] w-1 h-12 bg-slate-800 dark:bg-slate-700 rounded-r-none rounded-l-md"></div>
        <div className="absolute top-48 left-[-2px] w-1 h-12 bg-slate-800 dark:bg-slate-700 rounded-r-none rounded-l-md"></div>

        {/* Inner Screen Area */}
        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[40px] overflow-hidden relative border-4 border-slate-900 dark:border-black">
          {children}
        </div>
      </div>
    </div>
  );
};
