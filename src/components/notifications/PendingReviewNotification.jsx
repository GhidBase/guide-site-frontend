import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";

export default function PendingReviewNotification({ visible, onDismiss }) {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        setIsVisible(visible);
        if (visible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onDismiss) {
                    onDismiss();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 bg-(--primary) text-amber-50 rounded shadow-lg border border-(--primary)/50 backdrop-blur-sm">
                <Clock size={20} className="shrink-0" />
                <div className="flex flex-col items-start leading-0 gap-y-1">
                    <span className="text-base font-semibold leading-none m-0 p-0 block">
                        Your review is pending
                    </span>
                    <span className="text-sm opacity-90 leading-none mt-2 p-0 block">
                        Changes submitted for review
                    </span>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        if (onDismiss) {
                            onDismiss();
                        }
                    }}
                    className="ml-2 cursor-pointer hover:opacity-80"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
