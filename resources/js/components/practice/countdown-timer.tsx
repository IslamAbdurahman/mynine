import { useEffect, useState } from "react";

interface CountdownTimerProps {
    finishedAt: string | null;
    onExpire?: () => void;
    serverTimeOffset?: number;
}

export function CountdownTimer({
                                   finishedAt,
                                   onExpire,
                                   serverTimeOffset = 0,
                               }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isLowTime, setIsLowTime] = useState<boolean>(false);

    useEffect(() => {
        if (!finishedAt) return;

        const target = new Date(finishedAt).getTime();

        const updateTimeLeft = () => {
            const now = Date.now() + serverTimeOffset;
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                setIsLowTime(true);
                onExpire?.(); // 🔥 call when expired
                return false;
            }

            if (diff <= 180000) { // 3 minutes (180,000 ms)
                setIsLowTime(true);
            } else {
                setIsLowTime(false);
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
                    2,
                    "0"
                )}:${String(seconds).padStart(2, "0")}`
            );
            return true;
        };

        // Run immediately once
        if (!updateTimeLeft()) return;

        const interval = setInterval(() => {
            if (!updateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [finishedAt, onExpire]);

    return (
        <span className={`font-mono transition-all duration-300 ${isLowTime ? 'text-red-500 dark:text-red-400 font-bold animate-pulse' : ''}`}>
            {timeLeft}
        </span>
    );
}
