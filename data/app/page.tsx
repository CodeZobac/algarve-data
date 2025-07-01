"use client";

import AuthButton from "./components/AuthButton";
import AuthenticatedLink from "./components/AuthenticatedLink";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Restaurant Data
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Access your restaurant dashboard
            </p>
          </div>
          
          <div className="space-y-6">
            <AuthButton />
            <AuthenticatedLink />
          </div>
        </div>
      </div>
    </div>
  );
}
