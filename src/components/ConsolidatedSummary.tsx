import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { CategoryPieChart } from './CategoryPieChart';
import { LayoutDashboard, Wallet, TrendingUp } from 'lucide-react';
import { shouldIncludeInTotal } from '@/lib/utils';

interface ConsolidatedSummaryProps {
    monthsData: Record<string, Transaction[]>;
    recurExp: Transaction[];
    onClose: () => void;
}

export function ConsolidatedSummary({ monthsData, recurExp, onClose }: ConsolidatedSummaryProps) {
    // ... (inside component)

    // 1. Aggregate ALL transactions into a single list
    const allTransactions = useMemo(() => {
        let compiled: Transaction[] = [];

        // Add monthly transactions
        Object.entries(monthsData).forEach(([monthName, transactions]) => {
            const valid = transactions.filter(shouldIncludeInTotal);
            compiled = [...compiled, ...valid];
        });

        const numberOfMonths = Object.keys(monthsData).length;
        if (numberOfMonths > 0) {
            const recurringValid = recurExp.filter(shouldIncludeInTotal);
            // We replicate them for the compiled list to weigh properly in the Pie Chart.
            for (let i = 0; i < numberOfMonths; i++) {
                compiled = [...compiled, ...recurringValid];
            }
        }

        return compiled;
    }, [monthsData, recurExp]);

    const totalSpent = useMemo(() => {
        return allTransactions.reduce((sum, t) => sum + t.amount, 0);
    }, [allTransactions]);

    const categoryBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        allTransactions.forEach(t => {
            if (t.amount <= 0) return;
            let cat = t.customCategory || t.category;
            if (!cat || cat.trim() === '' || cat.trim() === '-') cat = 'Sem Categoria';
            map[cat] = (map[cat] || 0) + t.amount;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [allTransactions]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">Resumo Anual Consolidado</h2>
                    <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20">
                        {Object.keys(monthsData).length} Meses
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-sm text-neutral-400 hover:text-white underline"
                >
                    Voltar para Meses
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-neutral-400 font-medium">Total Gasto</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatCurrency(totalSpent)}</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="text-neutral-400 font-medium">Categorias</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{categoryBreakdown.length}</div>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-neutral-400 font-medium">Média Mensal</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {Object.keys(monthsData).length > 0
                            ? formatCurrency(totalSpent / Object.keys(monthsData).length)
                            : formatCurrency(0)
                        }
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <CategoryPieChart transactions={allTransactions} />

                {/* Breakdown Table */}
                <div className="w-full bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden self-start">
                    <div className="p-4 bg-neutral-900/80 border-b border-neutral-800 font-semibold text-neutral-200">
                        Detalhamento por Categoria
                    </div>
                    <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-900/50 text-neutral-400 sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="p-3 text-left font-medium">Categoria</th>
                                    <th className="p-3 text-right font-medium">Valor Total</th>
                                    <th className="p-3 text-right font-medium">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {categoryBreakdown.map(([cat, val]) => (
                                    <tr key={cat} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="p-3 text-neutral-300">{cat}</td>
                                        <td className="p-3 text-right text-white font-mono">{formatCurrency(val)}</td>
                                        <td className="p-3 text-right text-neutral-500 text-xs">
                                            {((val / totalSpent) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
