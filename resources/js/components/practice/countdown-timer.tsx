import { useEffect, useState } from "react";

export function CountdownTimer({
                                   finishedAt,
                                   onExpire,
                               }: {
    finishedAt: string | null;
    onExpire?: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!finishedAt) return;

        const target = new Date(finishedAt).getTime();

        const updateTimeLeft = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                onExpire?.(); // 🔥 call when expired
                return false;
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

    return <span>{timeLeft}</span>;
}
