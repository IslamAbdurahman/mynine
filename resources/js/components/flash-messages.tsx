import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function FlashMessages() {
    const { props } = usePage<SharedData>();
    const { flash, errors } = props;
    const { t } = useTranslation();

    useEffect(() => {
        if (flash.success) {
            toast.success(t(flash.success));
        }

        if (flash.error) {
            toast.error(t(flash.error));
        }

        if (flash.warning) {
            toast.warning(t(flash.warning));
        }

        if (flash.info) {
            toast.info(t(flash.info));
        }

        // Also handle validation errors from forms if they are passed as flash-like errors
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            // If it's a general error key, we show it
            if (errors.error) {
                // If errors.error is an array, take the first one
                const errorMessage = Array.isArray(errors.error) ? errors.error[0] : errors.error;
                toast.error(t(errorMessage));
            } else if (errorKeys.length === 1) {
                // Handle cases where validation errors for specific fields are returned
                // and we want to show the first one as a toast.
                const firstErrorKey = errorKeys[0];
                const firstErrorMessage = Array.isArray(errors[firstErrorKey]) ? errors[firstErrorKey][0] : errors[firstErrorKey];
                
                // Only toast if it's not a standard field error (optional strategy)
                // For now, let's keep it safe and only toast if we specifically want to.
            }
        }
    }, [flash, errors, t]);

    return null;
}
