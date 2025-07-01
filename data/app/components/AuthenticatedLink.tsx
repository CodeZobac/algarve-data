"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { createHash } from "crypto";

function generateHash(secret: string) {
  const hash = createHash('sha256');
  hash.update(secret);
  return hash.digest('hex').slice(0, 16);
}

export default function AuthenticatedLink() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const secret = process.env.NEXT_PUBLIC_HASH_SECRET || 'default-secret';
  const hash = generateHash(secret);

  return (
    <div className="text-center space-y-4">
      <Link
        href={`/restaurants/${hash}`}
        className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:text-white transition-colors"
      >
        Go to Restaurant Dashboard
      </Link>
      <Link
        href={`/tours`}
        className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:text-white transition-colors"
      >
        Go to Tours Page
      </Link>
    </div>
  );
}
