'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { PieChart, DollarSign, Wallet } from 'lucide-react';

interface ExpenseSummaryProps {
    transactions: Transaction[];
}

export function ExpenseSummary({ transactions }: ExpenseSummaryProps) {
    const summary = useMemo(() => {
        let me = 0;
        let wife = 0;
        let shared = 0;

        transactions.forEach(t => {
            if (t.excluded) return;
            if (t.owner === 'Me') me += t.amount;
            else if (t.owner === 'Wife') wife += t.amount;
            else if (t.owner === 'Shared') shared += t.amount;
        });

        return {
            me,
            wife,
            shared,
            total: me + wife + shared,
            meTotal: me + (shared / 2),
            wifeTotal: wife + (shared / 2)
        };
    }, [transactions]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (transactions.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl mx-auto">
            {/* Me Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-neutral-800 bg-neutral-900/50">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign className="w-24 h-24 text-blue-500" />
                </div>
                <h3 className="text-neutral-400 font-medium mb-1">Minha Parte</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">{formatCurrency(summary.meTotal)}</div>
                <div className="text-xs text-neutral-500 flex flex-col gap-1">
                    <span>Direto: {formatCurrency(summary.me)}</span>
                    <span>+ Metade Compartilhado: {formatCurrency(summary.shared / 2)}</span>
                </div>
            </div>

            {/* Wife Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-neutral-800 bg-neutral-900/50">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="w-24 h-24 text-pink-500" />
                </div>
                <h3 className="text-neutral-400 font-medium mb-1">Parte da Esposa</h3>
                <div className="text-3xl font-bold text-pink-400 mb-2">{formatCurrency(summary.wifeTotal)}</div>
                <div className="text-xs text-neutral-500 flex flex-col gap-1">
                    <span>Direto: {formatCurrency(summary.wife)}</span>
                    <span>+ Metade Compartilhado: {formatCurrency(summary.shared / 2)}</span>
                </div>
            </div>

            {/* Total Shared Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 border border-neutral-800 bg-neutral-900/50">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <PieChart className="w-24 h-24 text-purple-500" />
                </div>
                <h3 className="text-neutral-400 font-medium mb-1">Total Compartilhado</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">{formatCurrency(summary.shared)}</div>
                <div className="text-xs text-neutral-500">
                    Total Fatura: {formatCurrency(summary.total)}
                </div>
            </div>
        </div>
    );
}
