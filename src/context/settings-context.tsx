
'use client';

import React, { createContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Settings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  showEmailOnInvoice: boolean;
  showPhoneOnInvoice: boolean;
  showGstinOnInvoice: boolean;
  invoiceFooterNote: string;
  invoiceTemplate: 'modern' | 'classic' | 'simple';
  logo?: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (value: Settings | ((val: Settings) => Settings)) => void;
}

const defaultSettings: Settings = {
  storeName: '',
  address: '',
  phone: '',
  email: '',
  gstin: '',
  showEmailOnInvoice: true,
  showPhoneOnInvoice: true,
  showGstinOnInvoice: true,
  invoiceFooterNote: 'Medicines once sold cannot be returned unless expired/damaged.',
  invoiceTemplate: 'modern',
  logo: '',
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('pharmacySettings', defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
