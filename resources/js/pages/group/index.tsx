import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { BreadcrumbItem, Group, GroupPaginate, User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Plus,
    Users2,
    GraduationCap,
    MoreVertical,
    Trash2,
    Edit3,
    ArrowRight,
    Search,
    BookOpen,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';

import StudentSelectSearch from '@/components/group/student-select-search';

export default function GroupIndex() {
    const { groups, teachers, isAdmin, filters } = usePage<{
        groups: GroupPaginate;
        teachers: User[];
        isAdmin: boolean;
        filters: any;
    }>().props;

    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('sidebar.dashboard') || 'Boshqaruv paneli', href: route('dashboard') },
        { title: t('sidebar.groups') || 'Guruhlar', href: route('group.index') },
    ];

    // Search filter state
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedTeacherId, setSelectedTeacherId] = useState(filters?.teacher_id || '');

    // Create Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        description: '',
        color: '#4f46e5',
        student_ids: [] as number[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('group.index'), {
            search: searchTerm,
            teacher_id: selectedTeacherId,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('group.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Guruh muvaffaqiyatli yaratildi!');
            },
            onError: () => {
                toast.error('Xatolik yuz berdi. Maydonlarni tekshiring.');
            }
        });
    };

    const handleDelete = (group: Group) => {
        if (confirm(`"${group.name}" guruhini o'chirishni tasdiqlaysizmi?`)) {
            router.delete(route('group.destroy', group.id), {
                onSuccess: () => toast.success('Guruh o\'chirildi'),
            });
        }
    };

    const colorPresets = ['#4f46e5', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#9333ea', '#db2777'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.groups') || 'Guruhlar'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header with Title and Create Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                            <Users2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            {t('sidebar.groups') || 'Guruhlar'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Talabalarni guruhlarga ajrating va ularning natijalarini birgalikda kuzatib boring
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Yangi Guruh Yaratish</span>
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Guruh nomi bo'yicha qidiruv..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-xs"
                        />
                    </div>

                    {isAdmin && teachers?.length > 0 && (
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="h-10 px-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300"
                        >
                            <option value="">Barcha O'qituvchilar</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}

                    <Button type="submit" variant="secondary" className="h-10 px-4 rounded-xl text-xs font-bold">
                        Qidirish
                    </Button>
                </form>

                {/* Groups Grid */}
                {groups.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {groups.data.map((group) => (
                            <div
                                key={group.id}
                                className="group relative rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Color Indicator & Top Info */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="w-3.5 h-3.5 rounded-full shadow-xs" 
                                                style={{ backgroundColor: group.color || '#4f46e5' }} 
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                {group.students_count || 0} ta o'quvchi
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(group)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                            title="Guruhni o'chirish"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Group Title */}
                                    <div>
                                        <Link 
                                            href={route('group.show', group.id)} 
                                            className="text-lg font-black text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                                        >
                                            {group.name}
                                        </Link>
                                        {group.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                {group.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Info: Teacher & Actions */}
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                            {group.teacher?.name?.[0] || 'T'}
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {group.teacher?.name || "O'qituvchi"}
                                        </span>
                                    </div>

                                    <Link
                                        href={route('group.show', group.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Batafsil
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3">
                            <Users2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Guruhlar topilmadi</h3>
                        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                            Hozircha hech qanday guruh mavjud emas. Yangi guruh yarating va o'quvchilaringizni unga biriktiring.
                        </p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Guruh qo'shish
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black flex items-center gap-2">
                            <Users2 className="h-5 w-5 text-indigo-600" />
                            Yangi Guruh Yaratish
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Guruh Nomi *</Label>
                            <Input
                                type="text"
                                placeholder="Masalan: IELTS Morning Batch 09:00"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 rounded-xl"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Tavsif (Ixtiyoriy)</Label>
                            <Input
                                type="text"
                                placeholder="Guruh maqsadi yoki dars vaqti"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Guruh Rangi</Label>
                            <div className="flex items-center gap-2">
                                {colorPresets.map((c) => (
                                    <button
                                        type="button"
                                        key={c}
                                        onClick={() => setData('color', c)}
                                        className={`w-6 h-6 rounded-full transition-transform ${data.color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-600' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Async Searchable Student Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Talabalarni biriktirish (Ixtiyoriy)</Label>
                            <StudentSelectSearch
                                mode="multiple"
                                placeholder="Talabani qidirib tanlang..."
                                onSelectMultiple={(students) => {
                                    setData('student_ids', students.map(s => s.id));
                                }}
                            />
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="h-10 rounded-xl"
                            >
                                Bekor qilish
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                {processing ? 'Saqlanmoqda...' : 'Saqlash'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
