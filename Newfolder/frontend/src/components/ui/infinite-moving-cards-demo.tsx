import React, { useState, useEffect } from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";

// Type for a review
interface Review {
  quote: string;
  name: string;
  title: string;
}

const InfiniteMovingCardsDemo: React.FC<{ slug: string }> = ({ slug }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ quote: "", name: "", title: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      });
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.quote && form.name && form.title && !submitting) {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setForm({ quote: "", name: "", title: "" });
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="mb-10 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-lg shadow p-6 flex flex-col gap-5">
        <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">Add Your Review</h3>
        <textarea name="quote" value={form.quote} onChange={handleChange} placeholder="Your review" className="border border-green-200 focus:border-green-500 rounded p-3 min-h-[70px] resize-y text-base bg-gray-50 dark:bg-zinc-800" required />
        <div className="flex flex-col sm:flex-row gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="border border-green-200 focus:border-green-500 rounded p-3 text-base bg-gray-50 dark:bg-zinc-800 flex-1" required />
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title (e.g. Honey Lover)" className="border border-green-200 focus:border-green-500 rounded p-3 text-base bg-gray-50 dark:bg-zinc-800 flex-1" required />
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-6 py-2 transition text-base shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
      <div className="h-[28rem] w-full max-w-full flex flex-col items-center justify-center overflow-x-hidden">
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">Public Reviews</h2>
        {loading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500 text-base">No reviews yet.</div>
        ) : reviews.length === 1 ? (
          <div className="flex justify-center w-full">
            <div className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-white/90 dark:bg-zinc-900/90 shadow-lg shadow-green-200/60 dark:shadow-green-800/40 px-8 py-6 md:w-[450px]">
              <blockquote>
                <span className="relative z-20 text-sm leading-[1.6] font-normal text-neutral-800 dark:text-gray-100">
                  {reviews[0].quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                      {reviews[0].name}
                    </span>
                    <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                      {reviews[0].title}
                    </span>
                  </span>
                </div>
              </blockquote>
            </div>
          </div>
        ) : (
          <InfiniteMovingCards items={reviews} direction="right" speed="slow" className="w-full max-w-full" />
        )}
      </div>
    </div>
  );
};

export default InfiniteMovingCardsDemo; 