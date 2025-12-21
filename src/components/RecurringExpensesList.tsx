'use client';

import React from 'react';
import { Transaction } from '@/types';
import { Trash2, Repeat, User, Heart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecurringExpensesListProps {
    expenses: Transaction[];
    onDelete: (id: string) => void;
}

const OWNER_ICONS = {
    'Me': { icon: User, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    'Wife': { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    'Shared': { icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export function RecurringExpensesList({ expenses, onDelete }: RecurringExpensesListProps) {
    if (expenses.length === 0) return null;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-green-400" />
                Despesas Recorrentes (Global)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {expenses.map((expense) => {
                    const ownerConfig = OWNER_ICONS[expense.owner];
                    const Icon = ownerConfig.icon;

                    return (
                        <div
                            key={expense.id}
                            className="group relative flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn("p-2 rounded-lg shrink-0", ownerConfig.bg)}>
                                    <Icon className={cn("w-4 h-4", ownerConfig.color)} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-neutral-200 truncate text-sm">
                                        {expense.description}
                                    </span>
                                    <span className="text-xs text-neutral-500 font-mono">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => onDelete(expense.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg text-neutral-600 hover:text-red-500 transition-all"
                                title="Excluir Despesa Recorrente"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
