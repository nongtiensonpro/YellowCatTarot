'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  preferredModel: string;
  setPreferredModel: (model: string) => void;
  isKeyValid: boolean | null;
  setIsKeyValid: (valid: boolean | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, _setApiKey] = useState<string>('');
  const [preferredModel, setPreferredModel] = useState<string>('gemini-flash-latest');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);

  // Load key from sessionStorage on client mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem('gemini_api_key') || '';
    const savedModel = sessionStorage.getItem('gemini_preferred_model') || 'gemini-flash-latest';
    if (savedKey) {
      _setApiKey(savedKey);
      setIsKeyValid(true); // Giả định ban đầu là đúng
    }
    if (savedModel) {
      setPreferredModel(savedModel);
    }
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

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        preferredModel,
        setPreferredModel: updatePreferredModel,
        isKeyValid,
        setIsKeyValid,
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
