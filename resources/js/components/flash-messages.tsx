import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

export default function FlashMessages() {
    const { props } = usePage<SharedData>();
    const { flash, errors } = props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        if (flash.warning) {
            toast.warning(flash.warning);
        }

        if (flash.info) {
            toast.info(flash.info);
        }

        // Also handle validation errors from forms if they are passed as flash-like errors
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            // If it's a general error key, we show it
            if (errors.error) {
                toast.error(errors.error);
            } else if (errorKeys.length === 1) {
                // If there's only one error (e.g., from a field) and no specific flash error,
                // we might want to show it as a toast if it's not handled by InputError locally.
                // But for now, let's focus on session errors and the 'error' validation key used in PracticeController.
            }
        }
    }, [flash, errors]);

    return null;
}
