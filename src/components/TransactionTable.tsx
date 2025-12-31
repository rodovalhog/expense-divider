'use client';

import React, { useMemo, useState } from 'react';
import { Transaction, Owner } from '@/types';
import { cn } from '@/lib/utils';
import { User, Users, Heart, Tag, Trash2, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/types';

interface TransactionTableProps {
    transactions: Transaction[];
    onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
    onRemoveTransaction: (id: string) => void;
}

const OWNERS: { value: Owner; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'Me', label: 'Eu', icon: User, color: 'text-blue-400' },
    { value: 'Wife', label: 'Esposa', icon: Heart, color: 'text-pink-400' },
    { value: 'Shared', label: 'Compartilhado', icon: Users, color: 'text-purple-400' },
];

export function TransactionTable({ transactions, onUpdateTransaction, onRemoveTransaction }: TransactionTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);

    const sortedTransactions = useMemo(() => {
        if (!sortConfig) return transactions;
        return [...transactions].sort((a, b) => {
            // Handle optional values safely
            const valA = sortConfig.key === 'category' ? (a.customCategory || a.category) : (a[sortConfig.key] ?? '');
            const valB = sortConfig.key === 'category' ? (b.customCategory || b.category) : (b[sortConfig.key] ?? '');

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [transactions, sortConfig]);

    const handleSort = (key: keyof Transaction) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-900 border-b border-neutral-800">
                        <tr>
                            <th className="p-4 font-medium text-neutral-400 cursor-pointer hover:text-white" onClick={() => handleSort('date')}>Data</th>
                            <th className="p-4 font-medium text-neutral-400 cursor-pointer hover:text-white" onClick={() => handleSort('description')}>Descrição</th>
                            <th className="p-4 font-medium text-neutral-400 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>Categoria</th>
                            <th className="p-4 font-medium text-neutral-400 text-right cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>Valor</th>
                            <th className="p-4 font-medium text-neutral-400 text-center">Responsável</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {sortedTransactions.map((t, index) => {
                            const showDivider = index === 0 || t.sourceFile !== sortedTransactions[index - 1].sourceFile;
                            return (
                                <React.Fragment key={t.id}>
                                    {showDivider && t.sourceFile && (
                                        <tr className="bg-neutral-800/80">
                                            <td colSpan={5} className="py-2 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                                Fonte: {t.sourceFile.replace(/\.csv$/i, '')}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className={cn(
                                        "group transition-colors",
                                        t.excluded
                                            ? "bg-neutral-900/50 opacity-50 hover:bg-neutral-900"
                                            : t.owner === 'Me'
                                                ? "bg-blue-500/5 hover:bg-blue-500/10"
                                                : t.owner === 'Wife'
                                                    ? "bg-pink-500/5 hover:bg-pink-500/10"
                                                    : "bg-purple-500/5 hover:bg-purple-500/10"
                                    )}>
                                        <td className="p-4 text-neutral-300 font-mono text-xs whitespace-nowrap">
                                            <div className={cn(t.excluded && "line-through decoration-neutral-600")}>{t.date}</div>
                                            {t.source === 'Manual' && <span className="text-[10px] bg-neutral-800 text-neutral-500 px-1 rounded">Manual</span>}
                                        </td>
                                        <td className="p-4 text-neutral-200 font-medium">
                                            <div className={cn(t.excluded && "line-through decoration-neutral-600")}>{t.description}</div>
                                            <div className="text-xs text-neutral-500">{t.cardName} {t.installment ? `• ${t.installment}` : ''}</div>
                                        </td>
                                        <td className="p-4 text-neutral-400 text-xs">
                                            {!t.excluded ? (
                                                <div className="relative group/cat">
                                                    <select
                                                        className="appearance-none bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg px-2 py-1 pr-6 focus:outline-none focus:border-blue-500 cursor-pointer w-32 truncate"
                                                        value={t.customCategory || t.category}
                                                        onChange={(e) => onUpdateTransaction(t.id, { customCategory: e.target.value })}
                                                    >
                                                        <option value={t.category}>{t.category} (Original)</option>
                                                        {DEFAULT_CATEGORIES.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    <Tag className="w-3 h-3 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            ) : (
                                                <span className="italic">Ignorado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-neutral-200 font-mono whitespace-nowrap">
                                            <span className={cn(t.excluded && "line-through decoration-neutral-600")}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-1 items-center">
                                                {!t.excluded && OWNERS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => onUpdateTransaction(t.id, { owner: opt.value })}
                                                        title={opt.label}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all duration-200 ease-in-out border border-transparent",
                                                            t.owner === opt.value
                                                                ? `bg-neutral-800 ${opt.color} border-neutral-700`
                                                                : "text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50"
                                                        )}
                                                    >
                                                        <opt.icon className="w-4 h-4" />
                                                    </button>
                                                ))}

                                                <div className="w-px h-4 bg-neutral-800 mx-1" />

                                                <button
                                                    onClick={() => onUpdateTransaction(t.id, { excluded: !t.excluded })}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        t.excluded ? "text-yellow-500 hover:bg-yellow-500/10" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                                                    )}
                                                    title={t.excluded ? "Incluir no cálculo" : "Ignorar no cálculo"}
                                                >
                                                    {t.excluded ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>

                                                <button
                                                    onClick={() => onRemoveTransaction(t.id)}
                                                    className="p-2 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                                                    title="Excluir Permanentemente"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                        {sortedTransactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-500">
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
