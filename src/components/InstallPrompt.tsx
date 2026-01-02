'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Check if user has already declined recently (optional logic, skipping for now to always show if possible)
            // Only show if mobile width to avoid annoyance on desktop? Or show consistent UI?
            // The user request said "entrar na aplicação pelo celular", so let's target mobile.
            if (window.innerWidth < 768) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-slide-up sm:animate-none">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-full">
                        <Download className="w-8 h-8 text-indigo-400" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Instalar Aplicativo</h3>
                        <p className="text-neutral-400 text-sm">
                            Instale o Divisor de Despesas para um acesso mais rápido e melhor experiência.
                        </p>
                    </div>

                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        Instalar Agora
                    </button>

                    <button
                        onClick={() => setShowPrompt(false)}
                        className="text-neutral-500 text-sm hover:text-neutral-300"
                    >
                        Agora não
                    </button>
                </div>
            </div>
        </div>
    );
}
