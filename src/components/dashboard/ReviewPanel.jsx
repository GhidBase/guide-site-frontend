import { useEffect, useState } from "react";
import { currentAPI } from "@/config/api";
import ReviewDiff from "./ReviewDiff";

export default function ReviewPanel() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [reviewMessage, setReviewMessage] = useState({});

    useEffect(() => {
        async function fetchReviews() {
            try {
                setLoading(true);
                const response = await fetch(`${currentAPI}/reviews`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }

                const data = await response.json();
                setReviews(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    async function handleAccept(reviewId) {
        try {
            setActionLoading(reviewId);
            const response = await fetch(
                `${currentAPI}/reviews/${reviewId}/accept`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({}),
                },
            );

            if (!response.ok) {
                throw new Error("Failed to accept review");
            }

            setReviews((current) => current.filter((r) => r.id !== reviewId));
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleRefuse(reviewId) {
        const message = reviewMessage[reviewId];
        if (!message) {
            setError("Please provide a review message");
            return;
        }
        setError("");

        try {
            setActionLoading(reviewId);
            const response = await fetch(
                `${currentAPI}/reviews/${reviewId}/refuse`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ message }),
                },
            );

            if (!response.ok) {
                throw new Error("Failed to refuse review");
            }

            setReviews((current) => current.filter((r) => r.id !== reviewId));
            setReviewMessage({ ...reviewMessage, [reviewId]: "" });
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) {
        return <div className="text-(--text-color)">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return <div className="text-(--text-color)">No pending reviews</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="p-3 bg-(--primary)/20 border border-(--primary) rounded text-(--text-color)">
                    {error}
                </div>
            )}
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="p-4 border border-(--primary) rounded bg-(--surface-background)"
                >
                    <div className="mb-3">
                        <p className="text-(--text-color) font-semibold">
                            User: {review.user?.username || "Unknown"}
                        </p>
                        <p className="text-(--text-color) text-sm">
                            Operation: {review.operation}
                        </p>
                        <p className="text-(--text-color) text-sm">
                            Status: {review.status}
                        </p>
                    </div>

                    <div className="mb-4 rounded border border-(--primary)/20 bg-(--primary)/8 p-3">
                        <p className="mb-3 text-(--text-color) text-sm font-semibold">
                            Proposed Changes
                        </p>
                        <ReviewDiff review={review} />
                    </div>

                    <div className="flex flex-col gap-2 mb-3">
                        <textarea
                            value={reviewMessage[review.id] || ""}
                            onChange={(e) =>
                                setReviewMessage({
                                    ...reviewMessage,
                                    [review.id]: e.target.value,
                                })
                            }
                            placeholder="Review message (required to refuse)"
                            className="px-3 py-2 border border-(--primary) rounded bg-(--surface-background) text-(--text-color) focus:outline-none resize-none"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAccept(review.id)}
                            disabled={actionLoading === review.id}
                            className="px-4 py-2 bg-(--primary) text-amber-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90 text-sm"
                        >
                            {actionLoading === review.id
                                ? "Processing..."
                                : "Accept"}
                        </button>
                        <button
                            onClick={() => handleRefuse(review.id)}
                            disabled={actionLoading === review.id}
                            className="px-4 py-2 bg-(--outline) text-amber-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:opacity-90 text-sm"
                        >
                            {actionLoading === review.id
                                ? "Processing..."
                                : "Refuse"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
