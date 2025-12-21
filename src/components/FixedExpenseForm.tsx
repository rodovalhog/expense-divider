'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Transaction, Owner, DEFAULT_CATEGORIES } from '@/types';
// Note: We'll use a simple ID generator here as well, duplicating logic or exporting it would be better.
// For now, simple Math.random is sufficient for client-side only.

interface FixedExpenseFormProps {
    onAddTransaction: (t: Transaction) => void;
    onAddRecurringTransaction?: (t: Transaction) => void;
}

export function FixedExpenseForm({ onAddTransaction, onAddRecurringTransaction }: FixedExpenseFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
    const [owner, setOwner] = useState<Owner>('Shared');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [isRecurring, setIsRecurring] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const newTransaction: Transaction = {
            id: Math.random().toString(36).substring(2, 15),
            date: date.split('-').reverse().join('/'), // Convert YYYY-MM-DD to DD/MM/YYYY
            cardName: isRecurring ? 'Recorrente' : 'Manual Entry',
            cardLastFour: 'N/A',
            category: category,
            description: description,
            installment: '',
            amount: parseFloat(amount.replace(',', '.')), // Basic parsing
            owner: owner,
            sourceFile: 'Manual',
            source: 'Manual'
        };

        if (isRecurring && onAddRecurringTransaction) {
            onAddRecurringTransaction(newTransaction);
        } else {
            onAddTransaction(newTransaction);
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory(DEFAULT_CATEGORIES[0]);
        setIsRecurring(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <div className="flex justify-center my-8">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-all border border-neutral-700 hover:border-blue-500/50 group"
                >
                    <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Adicionar Despesa Fixa (Manual)</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto my-8 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl animate-in items-center">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Adicionar Despesa Fixa</h3>
                <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Descrição</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="ex: Aluguel, Luz"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Valor (R$)</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Data</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Categoria</label>
                        <select
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {DEFAULT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Responsável</label>
                        <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                            {([{ value: 'Me', label: 'Eu' }, { value: 'Wife', label: 'Esposa' }, { value: 'Shared', label: 'Comum' }]).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setOwner(opt.value as Owner)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${owner === opt.value ? 'bg-neutral-700 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-neutral-800/50 rounded-lg border border-neutral-800">
                    <input
                        type="checkbox"
                        id="recurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500 bg-neutral-700"
                    />
                    <label htmlFor="recurring" className="text-sm text-neutral-300 cursor-pointer select-none">
                        Transação Recorrente (Aplicar em todos os meses)
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                >
                    Adicionar Despesa
                </button>
            </form>
        </div>
    );
}
