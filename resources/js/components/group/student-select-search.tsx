import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X, Check, UserPlus, Users, Phone, Mail } from 'lucide-react';
import { User } from '@/types';

interface StudentSelectSearchProps {
    mode?: 'single' | 'multiple';
    groupId?: number;
    placeholder?: string;
    selectedStudentId?: string | number | null;
    selectedStudentIds?: number[];
    onSelectSingle?: (student: User | null) => void;
    onSelectMultiple?: (students: User[]) => void;
}

export default function StudentSelectSearch({
    mode = 'single',
    groupId,
    placeholder = "Talabani ismi, telefon yoki emaili orqali qidiring...",
    selectedStudentId,
    selectedStudentIds = [],
    onSelectSingle,
    onSelectMultiple,
}: StudentSelectSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [singleSelectedUser, setSingleSelectedUser] = useState<User | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial matching data on search
    const performSearch = useCallback(async (searchTerm: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm.trim()) params.append('q', searchTerm.trim());
            if (groupId) params.append('group_id', String(groupId));

            const res = await fetch(`/group-search-students?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error fetching students:', e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Handle debounced search input
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (isOpen) {
                performSearch(query);
            }
        }, 200);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [query, isOpen, performSearch]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (student: User) => {
        if (mode === 'single') {
            setSingleSelectedUser(student);
            setIsOpen(false);
            setQuery('');
            if (onSelectSingle) onSelectSingle(student);
        } else {
            const exists = selectedUsers.some(u => u.id === student.id);
            let updated: User[];
            if (exists) {
                updated = selectedUsers.filter(u => u.id !== student.id);
            } else {
                updated = [...selectedUsers, student];
            }
            setSelectedUsers(updated);
            if (onSelectMultiple) onSelectMultiple(updated);
        }
    };

    const handleRemoveMultiple = (studentId: number) => {
        const updated = selectedUsers.filter(u => u.id !== studentId);
        setSelectedUsers(updated);
        if (onSelectMultiple) onSelectMultiple(updated);
    };

    const handleClearSingle = () => {
        setSingleSelectedUser(null);
        if (onSelectSingle) onSelectSingle(null);
    };

    return (
        <div className="relative w-full space-y-2" ref={dropdownRef}>
            {/* Multiple Selected Tags */}
            {mode === 'multiple' && selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 max-h-32 overflow-y-auto">
                    {selectedUsers.map((user) => (
                        <span
                            key={user.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60"
                        >
                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                                {user.name?.[0] || 'U'}
                            </span>
                            <span>{user.name}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveMultiple(user.id)}
                                className="hover:text-red-500 transition-colors p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Single Selected Display Card */}
            {mode === 'single' && singleSelectedUser && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {singleSelectedUser.name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{singleSelectedUser.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {singleSelectedUser.phone || singleSelectedUser.email}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClearSingle}
                        className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                        title="O'zgartirish"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Search Input Box */}
            {(!singleSelectedUser || mode === 'multiple') && (
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            setIsOpen(true);
                            if (results.length === 0) performSearch(query);
                        }}
                        placeholder={placeholder}
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                    {loading && (
                        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 animate-spin" />
                    )}
                </div>
            )}

            {/* Dropdown Results Box */}
            {isOpen && (!singleSelectedUser || mode === 'multiple') && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-1.5 space-y-1">
                    {results.length > 0 ? (
                        results.map((student) => {
                            const isSelected = mode === 'multiple'
                                ? selectedUsers.some(u => u.id === student.id)
                                : singleSelectedUser?.id === student.id;

                            return (
                                <div
                                    key={student.id}
                                    onClick={() => handleSelect(student)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                            {student.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs leading-tight">{student.name}</p>
                                            <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                {student.phone && <span>{student.phone}</span>}
                                                {student.email && <span>• {student.email}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="p-1 rounded-full bg-indigo-600 text-white">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-xs text-gray-400">
                            {loading ? "Qidirilmoqda..." : "Talaba topilmadi. Ism yoki telefon raqamini kiritib qidiring."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
