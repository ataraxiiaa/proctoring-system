import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-400 ring-1 ring-white/10 hover:ring-white/20">
              New: Real-time gaze detection enabled.{" "}
              <a href="#" className="font-semibold text-indigo-400">
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Secure the Integrity of Online Examinations
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Our AI-driven proctoring system monitors eye movement, audio cues, and environment anomalies to ensure a fair and secure testing environment for everyone.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:scale-105"
            >
              Get Started
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-white">
              Live Demo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Real-time Analysis</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Instant detection of multiple faces, gaze diversion, and unauthorized devices using edge-optimized AI models.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Smart Audio Monitoring</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Sophisticated noise cancellation and voice recognition to identify secondary conversations and non-ambient noises.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Detailed Reporting</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Comprehensive incident logs with timestamps, video evidence, and integrity scores for post-exam review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
