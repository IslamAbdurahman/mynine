import DeleteItemModal from '@/components/delete-item-modal';
import CreateMockModal from '@/components/mock/create-mock-modal';
import UpdateMockModal from '@/components/mock/update-mock-modal';
import { baseButton } from '@/components/ui/baseButton';
import { Auth, Mock, type MockPaginate, SearchData, Test } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle, Copy, MinusCircle, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface MockTableProps extends MockPaginate {
    searchData: SearchData;
    tests: Test[];
}

const MockTable = ({ tests, searchData, ...mock }: MockTableProps) => {
    const { t } = useTranslation(); // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedMock, setSelectedMock] = useState<Mock | null>(null);

    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');

    const handleUpdateClick = (mockData: Mock) => {
        setSelectedMock(mockData); // Set the selected mock data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (mockData: Mock) => {
        setSelectedMock(mockData); // Set the selected mock for deletion
        setOpenDelete(true); // Open the delete modal
    };

    const { delete: deleteMock, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError); // Log to see if errors are populated

        deleteMock(route('mock.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('deleted_successfully')); // Success message
            },
            onError: (err) => {
                // Display a friendly error message if available
                const errorMessage = err?.error || t('delete_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            },
        });
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('mock')}</h2>
                <CreateMockModal tests={tests} />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mock.data.map((item, index) => {
                    const globalIndex = (mock.current_page - 1) * mock.per_page + index + 1;
                    const isActive = item.active == 1;

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col justify-between rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
                        >
                            {/* Header */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 opacity-70">
                                        #{globalIndex}
                                    </span>
                                    {isActive ? (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                            <CheckCircle className="mr-1 h-3 w-3" /> {t('active')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            <MinusCircle className="mr-1 h-3 w-3" /> {t('inactive')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="line-clamp-1 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    <Link href={`/mock/${item.id}`}>{item.name}</Link>
                                </h3>
                                <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold text-blue-600/70">{item.test?.folder?.name}</span>
                                    <span className="mx-2 opacity-30">/</span>
                                    <span className="truncate">{item.test?.name}</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-6 flex-grow">
                                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic">
                                    {item.comment || t('no_comment')}
                                </p>
                            </div>

                            {/* Dates */}
                            <div className="mb-6 space-y-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-gray-500">{t('started_at')}</span>
                                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {format(new Date(item.started_at), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-gray-500">{t('finished_at')}</span>
                                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {format(new Date(item.finished_at), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => handleUpdateClick(item)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors hover:bg-green-600 hover:text-white dark:bg-green-900/10"
                                    title={t('edit')}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:bg-red-900/10"
                                    title={t('delete')}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${item.slug}`);
                                        toast.success(t('link_copied'));
                                    }}
                                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-wider">{t('copy_link')}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {selectedMock && open && <UpdateMockModal tests={tests} mock={selectedMock} open={open} setOpen={setOpen} />}

            {selectedMock && openDelete && <DeleteItemModal item={selectedMock} open={openDelete} setOpen={setOpenDelete} onDelete={handleDelete} />}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div>
                    {t('showing', {
                        from: mock.from,
                        to: mock.to,
                        total: mock.total,
                    })}
                </div>
                <div className="flex gap-1">
                    {mock.links.map((link, index) => (
                        <Link
                            key={index}
                            href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}`}
                            className={`rounded-md px-3 py-1 text-sm transition ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : !link.url
                                      ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MockTable;
