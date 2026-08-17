const { app, BrowserWindow, globalShortcut, dialog, ipcMain, session } = require('electron');
const path = require('path');

// Server Configuration
const SERVER_URL = 'https://mynine.uz';
const TEACHER_PIN = '9999'; // Default teacher emergency exit PIN

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        fullscreen: true,
        kiosk: true,              // True Lockdown Kiosk Mode
        alwaysOnTop: true,        // Stay above all other applications
        frame: false,             // No title bar / window controls
        skipTaskbar: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: true,
            autoplayPolicy: 'no-user-gesture-required' // Allow seamless audio playback in Listening
        }
    });

    // Protect window from being screen captured / recorded (OBS, AnyDesk, Screen share)
    try {
        mainWindow.setContentProtection(true);
    } catch (e) {
        console.warn('Content protection not supported on this platform:', e);
    }

    // Load initial candidate launcher splash
    mainWindow.loadFile(path.join(__dirname, 'splash', 'index.html'));

    // Prevent opening new windows (popups / external links)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith(SERVER_URL)) {
            mainWindow.loadURL(url);
        }
        return { action: 'deny' };
    });

    // Guard navigation to ensure student stays within mynine.uz
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(SERVER_URL) && !url.startsWith('file://')) {
            event.preventDefault();
            console.log('[Lockdown] Blocked external navigation to:', url);
        }
    });

    // Automatically return to Candidate Code Splash screen when exam is submitted or user lands on Home
    mainWindow.webContents.on('did-navigate', (event, url) => {
        try {
            if (url.startsWith('file://')) return;
            const parsedUrl = new URL(url);
            if (
                parsedUrl.origin === SERVER_URL && 
                (parsedUrl.pathname === '/' || parsedUrl.pathname === '' || parsedUrl.pathname === '/login')
            ) {
                console.log('[Lockdown] Exam submitted/ended. Resetting to Candidate Code screen for next student.');
                session.defaultSession.clearStorageData();
                mainWindow.loadFile(path.join(__dirname, 'splash', 'index.html'));
            }
        } catch (e) {
            console.error('Error handling navigation:', e);
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Register Global Keyboard Hooks to Lock Down the Desktop
function registerSecurityShortcuts() {
    const blockedShortcuts = [
        'Alt+Tab',
        'Alt+F4',
        'CommandOrControl+Shift+I', // DevTools
        'CommandOrControl+Alt+I',
        'F12',
        'F11',
        'CommandOrControl+R',       // Refresh
        'CommandOrControl+Shift+R',
        'CommandOrControl+W',       // Close Tab
        'CommandOrControl+Q',
        'CommandOrControl+N',       // New Window
        'CommandOrControl+P',       // Print
        'CommandOrControl+O'
    ];

    blockedShortcuts.forEach(shortcut => {
        try {
            globalShortcut.register(shortcut, () => {
                // Intercept and do nothing (swallow key event)
                return false;
            });
        } catch (err) {
            // Ignore unregistered shortcuts on non-supported OS
        }
    });

    // Teacher Emergency Exit Shortcut: Ctrl+Shift+Q or F8
    globalShortcut.register('CommandOrControl+Shift+Q', promptTeacherExit);
    globalShortcut.register('F8', promptTeacherExit);
}

// Teacher Exit Prompt
async function promptTeacherExit() {
    if (!mainWindow) return;

    const { response, checkboxChecked } = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Bekor qilish', 'Chiqish (Dasturni Yopish)'],
        defaultId: 0,
        cancelId: 0,
        title: 'O\'qituvchi Nazorati (Teacher Exit)',
        message: 'Dasturdan chiqishni xohlaysizmi?',
        detail: 'Faqat nazoratchi yoki o\'qituvchi ruxsati bilan dasturni yopish mumkin.'
    });

    if (response === 1) {
        // Safe app quit
        app.isQuitting = true;
        app.quit();
    }
}

// IPC Handlers
ipcMain.handle('app:version', () => app.getVersion());

ipcMain.on('exam:open', (event, code) => {
    if (!mainWindow) return;
    const targetUrl = `${SERVER_URL}/mock-student/enter?code=${encodeURIComponent(code)}`;
    mainWindow.loadURL(targetUrl).catch((err) => {
        console.error('Failed to load exam URL:', err);
        dialog.showErrorBox(
            'Ulanishda Xatolik',
            'Mynine serveriga ulanib bo\'lmadi. Internet aloqasini tekshiring va qaytadan urinib ko\'ring.'
        );
        mainWindow.loadFile(path.join(__dirname, 'splash', 'index.html'));
    });
});

ipcMain.on('exam:retry', () => {
    if (!mainWindow) return;
    mainWindow.loadFile(path.join(__dirname, 'splash', 'index.html'));
});

ipcMain.on('exam:request-exit', () => {
    promptTeacherExit();
});

// App Lifecycle
app.whenReady().then(() => {
    // Clear cache/cookies on startup for clean exam session
    session.defaultSession.clearCache();

    createWindow();
    registerSecurityShortcuts();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    // Unregister all global shortcuts
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
