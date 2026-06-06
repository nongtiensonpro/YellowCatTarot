'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  preferredModel: string;
  setPreferredModel: (model: string) => void;
  isKeyValid: boolean | null;
  setIsKeyValid: (valid: boolean | null) => void;
  preferredCardBack: string;
  setPreferredCardBack: (back: string) => void;
  shuffleTheme: 'classic' | 'wheel-of-fate' | 'soot-sprite';
  setShuffleTheme: (theme: 'classic' | 'wheel-of-fate' | 'soot-sprite') => void;
  pickingTheme: 'classic' | 'reflecting-pool' | 'falling-petals';
  setPickingTheme: (theme: 'classic' | 'reflecting-pool' | 'falling-petals') => void;
  enableSound: boolean;
  setEnableSound: (enable: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  backgroundTheme: 'mystic-night' | 'enchanted-forest' | 'celestial-dawn';
  setBackgroundTheme: (theme: 'mystic-night' | 'enchanted-forest' | 'celestial-dawn') => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, _setApiKey] = useState<string>('');
  const [preferredModel, setPreferredModel] = useState<string>('gemini-flash-latest');
  const [preferredCardBack, setPreferredCardBack] = useState<string>('default');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);

  // Ghibli Themes settings
  const [shuffleTheme, _setShuffleTheme] = useState<'classic' | 'wheel-of-fate' | 'soot-sprite'>('classic');
  const [pickingTheme, _setPickingTheme] = useState<'classic' | 'reflecting-pool' | 'falling-petals'>('classic');
  const [enableSound, _setEnableSound] = useState<boolean>(false); // Mặc định tắt để tránh người dùng giật mình
  const [reduceMotion, _setReduceMotion] = useState<boolean>(false); // Mặc định tắt
  const [backgroundTheme, setBackgroundTheme] = useState<'mystic-night' | 'enchanted-forest' | 'celestial-dawn'>('mystic-night');

  // Load key from sessionStorage on client mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem('gemini_api_key') || '';
    const savedModel = sessionStorage.getItem('gemini_preferred_model') || 'gemini-flash-latest';
    const savedCardBack = sessionStorage.getItem('gemini_preferred_card_back') || 'default';
    if (savedKey) {
      _setApiKey(savedKey);
      setIsKeyValid(true); // Giả định ban đầu là đúng
    }
    if (savedModel) {
      setPreferredModel(savedModel);
    }
    if (savedCardBack) {
      setPreferredCardBack(savedCardBack);
    }

    // Load Ghibli settings
    const savedShuffle = sessionStorage.getItem('gemini_shuffle_theme') as any;
    const savedPicking = sessionStorage.getItem('gemini_picking_theme') as any;
    const savedSound = sessionStorage.getItem('gemini_enable_sound');
    const savedMotion = sessionStorage.getItem('gemini_reduce_motion');

    if (savedShuffle) _setShuffleTheme(savedShuffle);
    if (savedPicking) _setPickingTheme(savedPicking);
    if (savedSound) _setEnableSound(savedSound === 'true');
    if (savedMotion) _setReduceMotion(savedMotion === 'true');
  }, []);

  const setApiKey = (key: string) => {
    _setApiKey(key);
    if (key) {
      sessionStorage.setItem('gemini_api_key', key);
      setIsKeyValid(true);
    } else {
      sessionStorage.removeItem('gemini_api_key');
      setIsKeyValid(null);
    }
  };

  const updatePreferredModel = (model: string) => {
    setPreferredModel(model);
    sessionStorage.setItem('gemini_preferred_model', model);
  };

  const updatePreferredCardBack = (back: string) => {
    setPreferredCardBack(back);
    sessionStorage.setItem('gemini_preferred_card_back', back);
  };

  const updateShuffleTheme = (theme: 'classic' | 'wheel-of-fate' | 'soot-sprite') => {
    _setShuffleTheme(theme);
    sessionStorage.setItem('gemini_shuffle_theme', theme);
  };

  const updatePickingTheme = (theme: 'classic' | 'reflecting-pool' | 'falling-petals') => {
    _setPickingTheme(theme);
    sessionStorage.setItem('gemini_picking_theme', theme);
  };

  const updateEnableSound = (enable: boolean) => {
    _setEnableSound(enable);
    sessionStorage.setItem('gemini_enable_sound', enable ? 'true' : 'false');
  };

  const updateReduceMotion = (reduce: boolean) => {
    _setReduceMotion(reduce);
    sessionStorage.setItem('gemini_reduce_motion', reduce ? 'true' : 'false');
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        preferredModel,
        setPreferredModel: updatePreferredModel,
        isKeyValid,
        setIsKeyValid,
        preferredCardBack,
        setPreferredCardBack: updatePreferredCardBack,
        shuffleTheme,
        setShuffleTheme: updateShuffleTheme,
        pickingTheme,
        setPickingTheme: updatePickingTheme,
        enableSound,
        setEnableSound: updateEnableSound,
        reduceMotion,
        setReduceMotion: updateReduceMotion,
        backgroundTheme,
        setBackgroundTheme,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
