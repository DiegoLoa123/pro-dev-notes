import type { ReactNode } from 'react';

interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({
  header,
  sidebar,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5">
        {header}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
            {sidebar}
          </aside>
          <main className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}