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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mock.data.map((item, index) => {
                    const globalIndex = (mock.current_page - 1) * mock.per_page + index + 1;

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-md transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    <Link href={`/mock/${item.id}`}>{item.name}</Link>
                                </h3>
                                <span className="text-xs text-gray-500">#{globalIndex}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {item.test.folder.name} / {item.test.name}
                            </h3>

                            {/* Comment */}
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.comment || t('no_comment')}</p>

                            <div>
                                <div>
                                    <span>{t('started_at')}</span> : {format(item.started_at, 'yyyy-MMM-dd HH:mm')}
                                </div>
                                <div>
                                    <span>{t('finished_at')}</span> : {format(item.finished_at, 'yyyy-MMM-dd HH:mm')}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mt-3 flex items-center gap-2">
                                {item.active == 1 ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <MinusCircle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-700 dark:text-gray-300">{item.active == 1 ? t('active') : t('inactive')}</span>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleUpdateClick(item)}
                                    className={`${baseButton} flex-1 rounded-md bg-green-600 hover:bg-green-700 focus:ring-green-300`}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => handleDeleteClick(item)}
                                    className={`${baseButton} flex-1 rounded-md bg-red-600 hover:bg-red-700 focus:ring-red-300`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${item.slug}`);
                                        toast.success(t('link_copied'));
                                    }}
                                    className={`${baseButton} flex-1 rounded-md bg-blue-600 hover:bg-blue-700 focus:ring-blue-300`}
                                >
                                    {t('common.code')}
                                    <Copy />
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
