'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { TransactionTable } from '@/components/TransactionTable';
import { ExpenseSummary } from '@/components/ExpenseSummary';
import { FixedExpenseForm } from '@/components/FixedExpenseForm';
import { MonthSelector } from '@/components/MonthSelector';
import { Transaction } from '@/types';
import { LayoutDashboard, Sparkles, FileText, X, Pencil, Check } from 'lucide-react';

import { CategoryPieChart } from '@/components/CategoryPieChart';
import { RecurringExpensesList } from '@/components/RecurringExpensesList';
import { parseInvoiceCSV } from '@/lib/parser';

export default function Home() {
  // State: keyed by month name
  const [monthsData, setMonthsData] = useState<Record<string, Transaction[]>>({});
  const [recurExp, setRecurExp] = useState<Transaction[]>([]); // Recurring Expenses
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // State: Ordered list of months for display
  const [monthOrder, setMonthOrder] = useState<string[]>([]);

  // Compute totals for each month
  const monthTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const recurringTotal = recurExp.reduce((sum, t) => t.excluded ? sum : sum + t.amount, 0);

    Object.keys(monthsData).forEach(month => {
      const monthTotal = monthsData[month].reduce((sum, t) => t.excluded ? sum : sum + t.amount, 0);
      totals[month] = monthTotal + recurringTotal;
    });
    return totals;
  }, [monthsData, recurExp]);

  // Computed transactions for current view: Specific + Recurring
  const currentTransactions = useMemo(() => {
    if (!selectedMonth) return [];
    const monthTx = monthsData[selectedMonth] || [];
    return [...recurExp, ...monthTx];
  }, [monthsData, selectedMonth, recurExp]);

  const handleAddMonth = useCallback((name: string) => {
    if (monthsData[name]) return; // Prevent duplicates
    setMonthsData(prev => ({ ...prev, [name]: [] }));
    setMonthOrder(prev => [...prev, name]); // Append new month to end
    setSelectedMonth(name);
  }, [monthsData]);

  const handleDeleteMonth = useCallback((name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${name} e todos os seus dados?`)) {
      setMonthsData(prev => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
      });
      setMonthOrder(prev => prev.filter(m => m !== name));
      if (selectedMonth === name) {
        setSelectedMonth(null);
      }
    }
  }, [selectedMonth]);

  const handleImportMonth = useCallback(async (file: File) => {
    try {
      const fileName = file.name.replace(/\.csv$/i, '');
      const transactions = await parseInvoiceCSV(file);

      if (monthsData[fileName]) {
        // Combine if exists? Or Alert? User intent "Create New Month"
        // Let's just alert if it exists, or auto-append
        if (!window.confirm(`O mês "${fileName}" já existe. Deseja adicionar os itens a ele?`)) {
          return;
        }
        setMonthsData(prev => ({
          ...prev,
          [fileName]: [...(prev[fileName] || []), ...transactions]
        }));
      } else {
        setMonthsData(prev => ({ ...prev, [fileName]: transactions }));
        setMonthOrder(prev => [...prev, fileName]);
      }
      setSelectedMonth(fileName);
    } catch (e) {
      alert('Erro ao processar arquivo: ' + (e as Error).message);
    }
  }, [monthsData]);

  const handleReorderMonths = useCallback((newOrder: string[]) => {
    setMonthOrder(newOrder);
  }, []);

  const handleDataLoaded = useCallback((newTransactions: Transaction[], fileName?: string) => {
    if (!selectedMonth) return;

    if (fileName) {
      const cleanName = fileName.replace(/\.csv$/i, '');
      // Rename if name is different and doesn't exist yet
      if (cleanName !== selectedMonth && !monthOrder.includes(cleanName)) {
        setMonthOrder(prev => prev.map(m => m === selectedMonth ? cleanName : m));
        setSelectedMonth(cleanName);

        setMonthsData(prev => {
          const data = prev[selectedMonth] || [];
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [selectedMonth]: unused, ...rest } = prev;
          return { ...rest, [cleanName]: [...data, ...newTransactions] };
        });
        return;
      }
    }

    setMonthsData((prev) => ({
      ...prev,
      [selectedMonth]: [...(prev[selectedMonth] || []), ...newTransactions]
    }));
  }, [selectedMonth, monthOrder]);

  const handleUpdateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    if (!selectedMonth) return;

    // Check if it's a recurring transaction
    if (recurExp.some(t => t.id === id)) {
      setRecurExp(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return;
    }

    setMonthsData((prev) => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, [selectedMonth, recurExp]);

  const handleAddTransaction = useCallback((newTransaction: Transaction) => {
    if (!selectedMonth) return;
    setMonthsData((prev) => ({
      ...prev,
      [selectedMonth]: [...(prev[selectedMonth] || []), newTransaction]
    }));
  }, [selectedMonth]);

  const handleAddRecurringTransaction = useCallback((newTransaction: Transaction) => {
    setRecurExp(prev => [...prev, newTransaction]);
  }, []);

  const handleDeleteRecurring = useCallback((id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta despesa recorrente de todos os meses?')) {
      setRecurExp(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const handleRemoveTransaction = useCallback((id: string) => {
    // Check if it's recurring
    if (recurExp.some(t => t.id === id)) {
      if (window.confirm('Esta é uma despesa recorrente. Remover de todos os meses?')) {
        setRecurExp(prev => prev.filter(t => t.id !== id));
      }
      return;
    }

    // Otherwise remove from current selected month
    if (!selectedMonth) return;

    // Optional: confirm
    // if (!window.confirm('Remover esta transação?')) return; 

    setMonthsData((prev) => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].filter(t => t.id !== id)
    }));
  }, [selectedMonth, recurExp]);

  // Derive list of unique source files for the current view
  const activeFiles = useMemo(() => {
    if (!selectedMonth) return [];
    const files = new Set<string>();
    // Only check current month's transactions, not recurring (unless recurring tracks sourceFile too?)
    // Recurring usually don't come from CSVs in this flow, or if they do, we might want to keep them separate?
    // Let's stick to modifying the month's data.
    const monthTx = monthsData[selectedMonth] || [];
    monthTx.forEach(t => {
      if (t.sourceFile) files.add(t.sourceFile);
    });
    return Array.from(files);
  }, [monthsData, selectedMonth]);

  const handleRemoveFile = useCallback((fileName: string) => {
    if (!selectedMonth) return;
    if (window.confirm(`Tem certeza que deseja remover todas as transações do arquivo "${fileName}"?`)) {
      setMonthsData((prev) => ({
        ...prev,
        [selectedMonth]: prev[selectedMonth].filter(t => t.sourceFile !== fileName)
      }));
    }
  }, [selectedMonth]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleRenameMonth = useCallback(() => {
    if (!selectedMonth || !tempTitle.trim() || tempTitle === selectedMonth) {
      setIsEditingTitle(false);
      return;
    }

    if (monthsData[tempTitle]) {
      alert('Já existe um mês com esse nome.');
      return;
    }

    setMonthsData(prev => {
      const { [selectedMonth]: data, ...rest } = prev;
      return { ...rest, [tempTitle]: data };
    });
    setMonthOrder(prev => prev.map(m => m === selectedMonth ? tempTitle : m));
    setSelectedMonth(tempTitle);
    setIsEditingTitle(false);
  }, [selectedMonth, monthsData, tempTitle]);

  const startEditing = () => {
    setTempTitle(selectedMonth || '');
    setIsEditingTitle(true);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                  Divisor de Despesas
                </h1>
                <p className="text-neutral-500">Simplifique suas finanças compartilhadas</p>
              </div>
            </div>
          </div>

          {/* Global Recurring Expenses */}
          <RecurringExpensesList
            expenses={recurExp}
            onDelete={handleDeleteRecurring}
          />

          {/* Top Tabs */}
          <MonthSelector
            months={monthOrder}
            selectedMonth={selectedMonth}
            monthTotals={monthTotals}
            onSelectMonth={setSelectedMonth}
            onAddMonth={handleAddMonth}
            onDeleteMonth={handleDeleteMonth}
            onReorderMonths={handleReorderMonths}
            onImportFile={handleImportMonth}
          />
        </header>

        {/* Main Content Area */}
        <div className="w-full">
          {!selectedMonth ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-900/30 text-center animate-in fade-in zoom-in duration-500">
              <div className="p-6 bg-neutral-800/50 rounded-full mb-4">
                <LayoutDashboard className="w-12 h-12 text-neutral-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-300 mb-2">Nenhum Mês Selecionado</h2>
              <p className="text-neutral-500 max-w-md">
                Crie um novo mês nas abas acima para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-neutral-400">Painel de</span>
                      <input
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 text-white text-2xl font-bold rounded px-2 py-1 focus:outline-none focus:border-blue-500 min-w-[200px]"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameMonth()}
                      />
                      <button onClick={handleRenameMonth} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
                      <h2 className="text-2xl font-bold text-white">Painel de {selectedMonth}</h2>
                      <Pencil className="w-4 h-4 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <span className="text-sm text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  {currentTransactions.length} Itens
                </span>
              </div>

              <section>
                <FileUploader onDataLoaded={handleDataLoaded} />

                {/* Active Files List */}
                {activeFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 px-4">
                    {activeFiles.map(file => (
                      <div key={file} className="flex items-center gap-2 bg-neutral-800/60 border border-neutral-700 rounded-lg pl-3 pr-2 py-1.5 text-sm text-neutral-300">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>{file.replace(/\.csv$/i, '')}</span>
                        <button
                          onClick={() => handleRemoveFile(file)}
                          className="p-1 hover:bg-neutral-700 rounded-md text-neutral-500 hover:text-red-400 transition-colors"
                          title="Remover arquivo e suas transações"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <FixedExpenseForm
                  onAddTransaction={handleAddTransaction}
                  onAddRecurringTransaction={handleAddRecurringTransaction}
                />
              </section>

              {currentTransactions.length > 0 && (
                <section className="space-y-8">
                  <ExpenseSummary transactions={currentTransactions} />

                  <CategoryPieChart transactions={currentTransactions} />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <h2 className="text-xl font-semibold text-white">Transações</h2>
                    </div>
                    <TransactionTable
                      transactions={currentTransactions}
                      onUpdateTransaction={handleUpdateTransaction}
                      onRemoveTransaction={handleRemoveTransaction}
                    />
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
