import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import UpdateUserModal from '@/components/user/update-user-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { User, type UserPaginate, SearchData, Role, Auth } from '@/types';
import { toast } from 'sonner';
import CreateUserModal from '@/components/user/create-user-modal';

interface UserTableProps extends UserPaginate {
    roles: Role[];
    searchData: SearchData;
}

const UserTable = ({ roles, searchData, ...user }: UserTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');

    const handleUpdateClick = (userData: User) => {
        setSelectedUser(userData); // Set the selected user data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (userData: User) => {
        setSelectedUser(userData); // Set the selected user for deletion
        setOpenDelete(true); // Open the delete modal
    };

    const { delete: deleteUser, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {

        deleteUser(`/user/${id}`, {
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
            }
        });
    };

    return (
        <div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('name')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('username')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('telegram_id')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('phone')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('email')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('created_at')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {/*<CreateUserModal />*/}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {user.data.map((item, index) => {
                        const globalIndex = (user.current_page - 1) * user.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/user/${item.id}`}>
                                        {item.name}
                                        ( {item.roles?.map((role) => {
                                        return (
                                            <span key={role.id}>{role.name}</span>
                                        );
                                    })} )
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.username}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.telegram_id}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.phone}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.email}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {new Date(item.created_at).toLocaleString('sv-SE').replace('T', ' ')}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm rounded-md overflow-hidden">
                                        <button
                                            onClick={() => handleUpdateClick(item)}
                                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>

                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}

                                    </div>


                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Place the UpdateUserModal here */}
                    {selectedUser && open && (
                        <UpdateUserModal
                            roles={roles}
                            user={selectedUser}
                            open={open}
                            setOpen={setOpen}
                        />
                    )}

                    {/* Pass selected user to the DeleteUserModal */}
                    {selectedUser && openDelete && (
                        <DeleteItemModal
                            item={selectedUser}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}

                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: user.from,
                            to: user.to,
                            total: user.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {user.links.map((link, index) => (
                            <Link
                                key={index}
                                href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}`}
                                className={`px-3 py-1 rounded-md text-sm transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : !link.url
                                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default UserTable;
