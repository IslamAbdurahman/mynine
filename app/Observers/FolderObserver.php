<?php

namespace App\Observers;

use App\Models\Folder;
use Illuminate\Support\Facades\Auth;

class FolderObserver
{
    /**
     * Handle the Folder "created" event.
     */
    public function created(Folder $folder): void
    {
        //
    }

    /**
     * Handle the Folder "updated" event.
     */
    public function updating(Folder $folder): void
    {
        //
    }

    /**
     * Handle the Folder "deleted" event.
     */
    public function deleting(Folder $folder): void
    {

        if ($folder->tests()->exists()) {
            throw new \Exception('Cannot delete Folder with associated Tests');
        }

        $authUser = Auth::user();

        // Agar admin bo'lsa -> ruxsat
        if ($authUser->hasRole('Admin')) {
            return;
        }
    }


    /**
     * Handle the Folder "restored" event.
     */
    public function restored(Folder $folder): void
    {
        //
    }

    /**
     * Handle the Folder "force deleted" event.
     */
    public function forceDeleted(Folder $folder): void
    {
        //
    }
}
