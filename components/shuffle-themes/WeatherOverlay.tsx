'use client';

import React from 'react';

interface WeatherOverlayProps {
  weather: 'wind' | 'sun' | 'fog' | null;
  reduceMotion?: boolean;
}

export default function WeatherOverlay({ weather, reduceMotion = false }: WeatherOverlayProps) {
  if (!weather) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-10">
      {/* 🌬️ SUNNY THEME: Radial Golden Glow */}
      {weather === 'sun' && (
        <div
          className={`absolute inset-0 mix-blend-screen transition-opacity duration-1000 ${
            reduceMotion ? '' : 'animate-[pulse_4s_ease-in-out_infinite]'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255,209,102,0.18) 0%, transparent 70%)',
          }}
        />
      )}

      {/* 🌬️ WINDY THEME: Drifting wind lines */}
      {weather === 'wind' && (
        <div className="absolute inset-0">
          {!reduceMotion && (
            <>
              {/* Wind Line 1 */}
              <div
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent w-40 left-[-160px] animate-[fogDrift_6s_linear_infinite]"
                style={{ top: '25%', animationName: 'windDrift', animationDuration: '4.5s' }}
              />
              {/* Wind Line 2 */}
              <div
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent w-60 left-[-240px] animate-[fogDrift_6s_linear_infinite]"
                style={{ top: '60%', animationName: 'windDrift', animationDuration: '6s', animationDelay: '1.5s' }}
              />
              {/* Wind Line 3 */}
              <div
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-36 left-[-150px] animate-[fogDrift_6s_linear_infinite]"
                style={{ top: '80%', animationName: 'windDrift', animationDuration: '3.8s', animationDelay: '0.8s' }}
              />

              <style jsx global>{`
                @keyframes windDrift {
                  0% { left: -250px; opacity: 0; transform: translateY(0); }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { left: 100%; opacity: 0; transform: translateY(15px); }
                }
              `}</style>
            </>
          )}
        </div>
      )}

      {/* 🌬️ FOGGY THEME: Blur + drifting fog overlay */}
      {weather === 'fog' && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            reduceMotion ? '' : 'animate-fog-drift'
          }`}
          style={{
            background: 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.03) 75%, transparent 75%, transparent)',
            backgroundSize: '40px 40px',
            backdropFilter: reduceMotion ? 'blur(2px)' : 'blur(4px)',
          }}
        />
      )}
    </div>
  );
}
