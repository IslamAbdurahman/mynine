# Mynine Secure Exam Desktop Browser (Electron .EXE)

Ushbu paket **Mynine IELTS Examination Platform** uchun maxsus xavfsiz Desktop ilovadir.

---

## 🔒 Imkoniyatlar:
1. **Nomzod Kodi (masalan: `TEST1-849201`) orqali kirish**: O'quvchi login/parol kiritmasdan, to'g'ridan-to'g'ri o'ziga berilgan unikal kod bilan imtihonni boshlaydi.
2. **Kiosk / Lockdown Rejimi**: Dastur butun ekranni egallaydi. `Alt + Tab`, `Alt + F4`, `Windows Key`, `Ctrl + Esc`, `Ctrl + Shift + Esc`, `F11`, `F12` tugmalari bloklangan.
3. **Screen Capture Himoyasi**: Skrinshot olish va ekranni yozib olish (OBS, AnyDesk, Telegram) taqiqlanadi.
4. **Teacher Exit Code**: O'qituvchi favqulodda chiqish uchun `Ctrl + Shift + Q` yoki `F8` tugmasini bosib, dasturni yopa oladi.

---

## 🚀 Ishga Tushirish va Test Qilish (Development):

```bash
cd public/desktop
npm install
npm run start
```

---

## 📦 Windows Uchun `.EXE` Fayl Yig'ish (Build):

### 1. Portable .EXE (O'rnatmasdan to'g'ridan-to'g'ri ishlaydigan bitta fayl):
```bash
npm run build:portable
```

### 2. Setup / Installer .EXE:
```bash
npm run build:win
```

Yig'ilgan tayyor `.exe` fayllar `public/desktop/dist/` papkasida paydo bo'ladi.
