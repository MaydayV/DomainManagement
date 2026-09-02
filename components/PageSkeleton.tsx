export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-8 w-16 bg-slate-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl p-4 border border-slate-200 bg-white">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="h-10 w-full lg:w-80 bg-white border border-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 flex-1 bg-white border border-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-white border border-slate-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse mb-6" />
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
