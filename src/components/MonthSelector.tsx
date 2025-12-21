'use client';

import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MonthSelectorProps {
    months: string[];
    selectedMonth: string | null;
    monthTotals?: Record<string, number>;
    onSelectMonth: (month: string) => void;
    onAddMonth: (month: string) => void;
    onDeleteMonth: (month: string) => void;
    onReorderMonths: (months: string[]) => void;
    onImportFile?: (file: File) => void;
}

interface SortableTabProps {
    id: string;
    isSelected: boolean;
    total?: number;
    onSelect: () => void;
    onDelete: () => void;
}

function SortableTab({ id, isSelected, total, onSelect, onDelete }: SortableTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onSelect}
            className={cn(
                "group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all select-none border",
                isSelected
                    ? "bg-blue-600/10 border-blue-500/50 text-blue-400 z-10"
                    : "bg-neutral-800/50 border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            )}
        >
            <div className="flex flex-col items-start leading-none gap-1">
                <span>{id}</span>
                {total !== undefined && (
                    <span className="text-[10px] opacity-70 font-mono">
                        {formatCurrency(total)}
                    </span>
                )}
            </div>
            {isSelected && (
                <button
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="ml-1 p-0.5 hover:bg-red-500/20 rounded text-red-500 opacity-60 hover:opacity-100 transition-all self-center"
                    title="Excluir Mês"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}

export function MonthSelector({
    months,
    selectedMonth,
    monthTotals,
    onSelectMonth,
    onAddMonth,
    onDeleteMonth,
    onReorderMonths,
    onImportFile
}: MonthSelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newMonthName, setNewMonthName] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = months.indexOf(active.id as string);
            const newIndex = months.indexOf(over.id as string);
            onReorderMonths(arrayMove(months, oldIndex, newIndex));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMonthName.trim()) {
            onAddMonth(newMonthName.trim());
            setNewMonthName('');
            setIsAdding(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImportFile) {
            onImportFile(file);
        }
        if (e.target) e.target.value = '';
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                    Meses
                </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={months}
                        strategy={horizontalListSortingStrategy}
                    >
                        {months.map((month) => (
                            <SortableTab
                                key={month}
                                id={month}
                                isSelected={selectedMonth === month}
                                total={monthTotals ? monthTotals[month] : undefined}
                                onSelect={() => onSelectMonth(month)}
                                onDelete={() => onDeleteMonth(month)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                />

                {isAdding ? (
                    <form onSubmit={handleCreate} className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                        <input
                            type="text"
                            autoFocus
                            placeholder="ex: Jan 2024"
                            className="w-32 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newMonthName}
                            onChange={(e) => setNewMonthName(e.target.value)}
                            onBlur={() => !newMonthName && setIsAdding(false)}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all text-sm font-medium whitespace-nowrap"
                            title="Importar CSV para criar novo mês"
                        >
                            <Upload className="w-4 h-4" />
                            Novo Mês
                        </button>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="p-2 rounded-lg border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all"
                            title="Adicionar manualmente"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
