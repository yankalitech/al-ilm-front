// Thème de l'appli : mode clair / sombre / comme le téléphone, et couleur d'accent.
// Le choix est enregistré sur le téléphone (AsyncStorage) et s'applique à tous les écrans.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export const ACCENTS = [
  { id: 'bleu', label: 'Bleu', color: '#4A90E2' },
  { id: 'vert', label: 'Vert', color: '#2E9E6A' },
  { id: 'or', label: 'Or', color: '#C29A3B' },
  { id: 'bordeaux', label: 'Bordeaux', color: '#B04A5A' },
  { id: 'violet', label: 'Violet', color: '#7C5CC4' },
] as const;

export type AccentId = (typeof ACCENTS)[number]['id'];

export interface ThemeColors {
  primary: string; // couleur d'accent choisie
  onPrimary: string; // texte posé sur la couleur d'accent
  background: string;
  surface: string; // cartes, barres
  surfaceAlt: string; // éléments en retrait (champs, puces)
  text: string;
  textSecondary: string;
  placeholder: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  overlay: string; // fond des fenêtres modales
  pattern: string; // couleur du motif de fond
  patternOpacity: number;
}

const DARK = {
  background: '#1E2A36',
  surface: '#2A3846',
  surfaceAlt: '#223040',
  text: '#FFFFFF',
  textSecondary: '#BDC3C7',
  placeholder: '#7F8C8D',
  border: '#3D4D5E',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  overlay: 'rgba(0,0,0,0.6)',
  patternOpacity: 0.16,
};

const LIGHT = {
  background: '#F5F1E8', // parchemin, s'accorde au thème des livres
  surface: '#FFFFFF',
  surfaceAlt: '#EFE9DC',
  text: '#1F2933',
  textSecondary: '#52606D',
  placeholder: '#9AA5B1',
  border: '#E2DACB',
  success: '#1E8E4E',
  error: '#C0392B',
  warning: '#D68910',
  overlay: 'rgba(0,0,0,0.45)',
  patternOpacity: 0.22,
};

interface ThemeValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  accent: AccentId;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentId) => void;
}

const STORAGE_KEY = 'app_theme';

const ThemeContext = createContext<ThemeValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentId>('bleu');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (saved?.mode) setModeState(saved.mode);
        if (saved?.accent && ACCENTS.some((a) => a.id === saved.accent)) setAccentState(saved.accent);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next: { mode: ThemeMode; accent: AccentId }) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    persist({ mode: next, accent });
  }, [accent, persist]);

  const setAccent = useCallback((next: AccentId) => {
    setAccentState(next);
    persist({ mode, accent: next });
  }, [mode, persist]);

  const isDark = mode === 'system' ? system !== 'light' : mode === 'dark';

  const value = useMemo<ThemeValue>(() => {
    const primary = ACCENTS.find((a) => a.id === accent)?.color ?? ACCENTS[0].color;
    const base = isDark ? DARK : LIGHT;
    return {
      colors: { ...base, primary, onPrimary: '#FFFFFF', pattern: primary },
      isDark,
      mode,
      accent,
      setMode,
      setAccent,
    };
  }, [isDark, mode, accent, setMode, setAccent]);

  // Évite un flash de la mauvaise couleur au démarrage
  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return value;
};

// Styles dépendant du thème : const styles = useThemedStyles(createStyles)
export function useThemedStyles<T>(factory: (colors: ThemeColors, isDark: boolean) => T): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => factory(colors, isDark), [factory, colors, isDark]);
}
