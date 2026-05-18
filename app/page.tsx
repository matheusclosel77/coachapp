export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-card-border px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">
            Coach<span className="text-accent">App</span>
          </span>
          <div className="flex items-center gap-4">
            <button className="text-sm text-muted transition-colors hover:text-foreground">
              Sign in
            </button>
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover">
              Get started
            </button>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full border border-card-border bg-card px-4 py-1.5 text-sm text-muted">
            Personal coaching, simplified
          </p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
            Train smarter with{" "}
            <span className="text-accent">Coach App</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted">
            Track workouts, set goals, and get guidance from your coach — all in
            one place built for athletes and trainers alike.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="w-full rounded-full bg-accent px-8 py-3 text-base font-medium text-background transition-colors hover:bg-accent-hover sm:w-auto">
              Start coaching
            </button>
            <button className="w-full rounded-full border border-card-border px-8 py-3 text-base font-medium transition-colors hover:border-muted sm:w-auto">
              Learn more
            </button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-card-border bg-card p-6 text-left"
            >
              <span className="mb-3 block text-2xl">{feature.icon}</span>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-card-border px-6 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} Coach App. All rights reserved.
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📋",
    title: "Workout plans",
    description: "Custom programs tailored to your goals and schedule.",
  },
  {
    icon: "📊",
    title: "Progress tracking",
    description: "Visualize gains with charts, PRs, and session history.",
  },
  {
    icon: "💬",
    title: "Coach messaging",
    description: "Stay connected with real-time feedback and check-ins.",
  },
];
