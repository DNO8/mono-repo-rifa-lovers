export function StreamingPageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-dark animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-bg-dark/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-bg-card rounded"></div>
              <div className="h-4 w-48 bg-bg-card rounded"></div>
            </div>
            <div className="h-10 w-32 bg-bg-card rounded"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Sidebar Skeleton */}
          <aside className="space-y-4">
            <div className="p-4 bg-bg-card border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-bg-dark rounded"></div>
                <div className="h-5 w-24 bg-bg-dark rounded"></div>
                <div className="h-5 w-8 bg-bg-dark rounded"></div>
              </div>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="size-8 bg-bg-dark rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-bg-dark rounded"></div>
                      <div className="h-3 w-20 bg-bg-dark rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Skeleton */}
          <section className="flex items-center justify-center">
            <div className="relative">
              <div className="w-96 h-96 border-4 border-primary rounded-full bg-bg-dark"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="h-8 w-32 bg-bg-card rounded mx-auto"></div>
                  <div className="h-6 w-48 bg-bg-card rounded mx-auto"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar Skeleton */}
          <aside className="space-y-4">
            <div className="p-4 bg-bg-card border-border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-bg-dark rounded"></div>
                <div className="h-5 w-20 bg-bg-dark rounded"></div>
                <div className="h-5 w-8 bg-bg-dark rounded"></div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-bg-dark rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 w-32 bg-bg-dark rounded"></div>
                        <div className="h-3 w-24 bg-bg-dark rounded"></div>
                        <div className="h-3 w-28 bg-bg-dark rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
