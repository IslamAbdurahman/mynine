// components/MobileSearchModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SearchData, Worker, Branch, Firm } from '@/types';
import SearchForm from '@/components/search-form';
import { useTranslation } from 'react-i18next';

interface Props {
    data: SearchData;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    workers?: Worker[];
    firms?: Firm[];
    branches?: Branch[];
}

const MobileSearchModal = ({ data, setData, handleSubmit, workers, firms, branches }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const { t } = useTranslation(); // Hook to access translations

    return (
        <>
            {/* Button to open modal - only visible on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden bg-blue-600 text-white px-4 py-1 rounded-md"
            >
                {t('filter')}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 lg:hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-h-[90vh] overflow-y-auto p-4 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 text-gray-700 dark:text-white hover:text-red-600"
                        >
                            <X size={24} />
                        </button>

                        <h1 className={'mb-3 text-2xl text-center'}>{t('filter')}</h1>

                        {/* Your search form */}
                        <SearchForm
                            handleSubmit={(e) => {
                                handleSubmit(e);
                                setIsOpen(false); // Close modal after submit
                            }}
                            data={data}
                            setData={setData}
                            workers={workers}
                            firms={firms}
                            branches={branches}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileSearchModal;
