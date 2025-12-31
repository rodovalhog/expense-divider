'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    forcedTheme?: Theme;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: 'dark',
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'vite-ui-theme',
    forcedTheme,
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(forcedTheme || defaultTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (forcedTheme) return; // Ignore storage if forced
        const storedTheme = localStorage.getItem(storageKey) as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, [storageKey, forcedTheme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove existing classes
        root.classList.remove('light', 'dark');

        // Determine active theme
        let activeTheme = theme;
        if (forcedTheme) {
            activeTheme = forcedTheme;
        }

        if (activeTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(activeTheme);
        // Force style for body if needed, but root class should suffice for Tailwind
    }, [theme, forcedTheme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
}
