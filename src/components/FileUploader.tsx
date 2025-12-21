'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseInvoiceCSV } from '@/lib/parser';
import { Transaction } from '@/types';

interface FileUploaderProps {
    onDataLoaded: (transactions: Transaction[], fileName?: string) => void;
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFiles = useCallback(async (files: FileList | File[]) => {
        setIsProcessing(true);
        setError(null);
        const allTransactions: Transaction[] = [];
        let firstFileName: string | undefined;

        try {
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                    throw new Error(`File ${file.name} is not a CSV.`);
                }
                const transactions = await parseInvoiceCSV(file);
                allTransactions.push(...transactions);
                if (!firstFileName) firstFileName = file.name;
            }
            onDataLoaded(allTransactions, firstFileName);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error processing files');
        } finally {
            setIsProcessing(false);
        }
    }, [onDataLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div
                className={cn(
                    "relative group cursor-pointer transition-all duration-300 ease-out",
                    "border-2 border-dashed rounded-2xl p-10 text-center",
                    isDragOver
                        ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                        : "border-neutral-700 hover:border-blue-400 hover:bg-neutral-800/50 bg-neutral-900/50"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".csv"
                    className="hidden"
                    onChange={handleChange}
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-full bg-neutral-800 transition-transform duration-300",
                        isDragOver ? "scale-110" : "group-hover:scale-110"
                    )}>
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        ) : (
                            <Upload className="w-8 h-8 text-neutral-400 group-hover:text-blue-400" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-neutral-200">
                            {isProcessing ? 'Processando...' : 'Carregar Faturas'}
                        </h3>
                        <p className="text-sm text-neutral-400">
                            Arraste e solte arquivos CSV aqui, ou clique para selecionar
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="absolute -bottom-16 left-0 right-0 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center justify-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
