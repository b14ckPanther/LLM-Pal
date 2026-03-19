import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingChatPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] p-3 lg:flex">
        <div className="mb-3 h-9 rounded-lg bg-[var(--bg-active)] animate-pulse" />
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <section className="flex flex-1 flex-col bg-[var(--bg-surface)]">
        <div className="h-12 border-b border-[var(--border)]" />
        <div className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-1/2" />
            </div>
            <Skeleton className="h-16 w-4/5" />
          </div>
        </div>
        <div className="h-20 border-t border-[var(--border)]" />
      </section>
    </main>
  );
}
