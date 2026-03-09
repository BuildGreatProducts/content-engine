"use client";

import { Suspense } from "react";
import { AcceptInviteForm } from "@/components/features/auth/accept-invite-form";
import { Skeleton } from "@/components/ui/skeleton";

function AcceptInviteLoading() {
  return (
    <div className="w-full max-w-sm">
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<AcceptInviteLoading />}>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
