import React, { useState, useEffect } from 'react';
import { Save, DollarSign, X } from 'lucide-react';
import { Owner } from '@/types';

interface IncomeConfigurationProps {
    incomes: Record<Owner, number>;
    onSave: (newIncomes: Record<Owner, number>) => void;
    onClose: () => void;
}

export function IncomeConfiguration({ incomes, onSave, onClose }: IncomeConfigurationProps) {
    const [localIncomes, setLocalIncomes] = useState<{ Me: string; Wife: string }>({
        Me: '',
        Wife: ''
    });

    useEffect(() => {
        setLocalIncomes({
            Me: (incomes.Me || 0).toString(),
            Wife: (incomes.Wife || 0).toString()
        });
    }, [incomes]);

    const handleSave = () => {
        onSave({
            ...incomes, // Preserve 'Shared' keys etc if they exist
            Me: parseFloat(localIncomes.Me.replace(',', '.')) || 0,
            Wife: parseFloat(localIncomes.Wife.replace(',', '.')) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Definir Rendas</h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-neutral-400">
                        Informe a renda mensal de cada pessoa para calcular a divisão proporcional de gastos.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-400">Minha Renda (Me)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={localIncomes.Me}
                                    onChange={(e) => setLocalIncomes(prev => ({ ...prev, Me: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-pink-400">Renda da Esposa (Wife)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={localIncomes.Wife}
                                    onChange={(e) => setLocalIncomes(prev => ({ ...prev, Wife: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-transparent border border-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
