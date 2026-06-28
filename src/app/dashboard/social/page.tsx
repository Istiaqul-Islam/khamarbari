"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocialPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/marketplace");
  }, [router]);

  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>Redirecting to Marketplace...</p>
    </div>
  );
}
