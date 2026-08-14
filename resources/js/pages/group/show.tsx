import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { BreadcrumbItem, Group, User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Users2,
    UserPlus,
    Trash2,
    ArrowLeft,
    GraduationCap,
    CheckCircle2,
    Phone,
    Mail,
    Award,
    Calendar,
    Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function GroupShow() {
    const { group, availableStudents = [], isAdmin } = usePage<{
        group: Group & { students: (User & { attempts_count: number; last_attempt?: any })[] };
        availableStudents: User[];
        isAdmin: boolean;
    }>().props;

    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('sidebar.dashboard') || 'Boshqaruv paneli', href: route('dashboard') },
        { title: t('sidebar.groups') || 'Guruhlar', href: route('group.index') },
        { title: group.name, href: route('group.show', group.id) },
    ];

    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) {
            toast.error('Talabani tanlang');
            return;
        }

        router.post(route('group.students.add', group.id), {
            user_id: selectedStudentId,
        }, {
            onSuccess: () => {
                setIsAddStudentOpen(false);
                setSelectedStudentId('');
                toast.success("Talaba guruhga qo'shildi!");
            }
        });
    };

    const handleRemoveStudent = (student: User) => {
        if (confirm(`"${student.name}"ni ushbu guruhdan chiqarishni tasdiqlaysizmi?`)) {
            router.delete(route('group.students.remove', [group.id, student.id]), {
                onSuccess: () => toast.success("Talaba guruhdan chiqarildi"),
            });
        }
    };

    const filteredStudents = group.students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={group.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header with Group Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <span 
                                className="w-4 h-4 rounded-full shadow-xs" 
                                style={{ backgroundColor: group.color || '#4f46e5' }} 
                            />
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                {group.name}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                {group.students.length} ta o'quvchi
                            </span>
                        </div>
                        {group.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {group.description}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 pt-1">
                            O'qituvchi: <span className="font-semibold text-gray-700 dark:text-gray-300">{group.teacher?.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('group.index')}>
                            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-bold">
                                <ArrowLeft className="h-4 w-4" />
                                Guruhlarga qaytish
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setIsAddStudentOpen(true)}
                            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            Talaba qo'shish
                        </Button>
                    </div>
                </div>

                {/* Search Bar for Group Students */}
                <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Guruhdagi talabani qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs"
                        />
                    </div>
                </div>

                {/* Students Table / Grid */}
                {filteredStudents.length > 0 ? (
                    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-4">Talaba</th>
                                        <th className="py-3 px-4">Telefon / Email</th>
                                        <th className="py-3 px-4 text-center">Topshirgan Testlar</th>
                                        <th className="py-3 px-4 text-center">Oxirgi Natija</th>
                                        <th className="py-3 px-4 text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                        {student.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-[10px] text-gray-400">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                                                <p>{student.phone || '-'}</p>
                                                <p className="text-[10px] text-gray-400">{student.email}</p>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                                                {student.attempts_count || 0} ta
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {student.last_attempt ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                                        <Award className="h-3 w-3" />
                                                        {(student.last_attempt as any)?.score ? `Band ${(student.last_attempt as any).score}` : 'Topshirgan'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('user.show', student.id)}>
                                                        <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-semibold">
                                                            Profil
                                                        </Button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRemoveStudent(student)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                        title="Guruhdan chiqarish"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                        <Users2 className="h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Guruhda talabalar yo'q</h3>
                        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                            Ushbu guruhga o'quvchilaringizni qo'shing va ularning mock imtihonlarini nazorat qiling.
                        </p>
                        <Button
                            onClick={() => setIsAddStudentOpen(true)}
                            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                            Talaba qo'shish
                        </Button>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-indigo-600" />
                            Guruhga Talaba Qo'shish
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddStudent} className="space-y-4 py-2">
                        {availableStudents.length > 0 ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    Mavjud Talabalar Ro'yxatidan Tanlang:
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
                                    required
                                >
                                    <option value="">-- Talabani tanlang --</option>
                                    {availableStudents.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.phone || s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs">
                                Guruhga qo'shish uchun boshqa bo'sh talabalar topilmadi. Avval Foydalanuvchilar bo'limida yangi talaba yarating.
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddStudentOpen(false)}
                                className="h-10 rounded-xl"
                            >
                                Bekor qilish
                            </Button>
                            <Button
                                type="submit"
                                disabled={availableStudents.length === 0 || !selectedStudentId}
                                className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                Qo'shish
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
