"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { isLoading, isSuccess, isError } = useQuery({
    queryKey: ["oauth-auth", code],
    queryFn: async () => {
      const response = await fetch(
        `https://api.ridescribe.click/oauth-authentication?code=${code}`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      return response.json();
    },
    enabled: !!code,
    retry: false,
  });

  // No code provided
  if (!code) {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-terracotta/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-terracotta"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
            Connection failed
          </h1>
          <p className="text-stone mb-8">
            We couldn&apos;t connect your Strava account. Please try again.
          </p>
          <a href="/" className="btn-primary">
            Try again
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-sage/20 border-t-sage rounded-full animate-spin" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
            Connecting your Strava account...
          </h1>
          <p className="text-stone">
            Please wait while we complete the connection.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-terracotta/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-terracotta"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
            Connection failed
          </h1>
          <p className="text-stone mb-8">
            We couldn&apos;t connect your Strava account. Please try again.
          </p>
          <a href="/" className="btn-primary">
            Try again
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sage/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
            You&apos;re all set!
          </h1>
          <p className="text-stone">
            Your Strava account is now connected. We&apos;ll automatically
            generate descriptions for your future rides.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-ivory flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <div className="w-10 h-10 border-[3px] border-sage/20 border-t-sage rounded-full animate-spin" />
            </div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
