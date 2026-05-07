import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="glass sticky top-4 mx-auto mt-4 flex w-[90%] max-w-7xl items-center justify-between px-8 py-4 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />
          <span className="text-xl font-bold tracking-tight text-white">FileVault</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Security</Link>
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mt-20 flex flex-col items-center text-center">
        <div className="animate-fade-in space-y-6 max-w-3xl">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Secure · Fast · Modern
          </span>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tighter md:text-7xl">
            Store your files <br /> 
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">with confidence.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400 md:text-xl">
            The ultimate vault for your digital assets. Secure, lightning-fast uploads, and a beautiful interface designed for clarity and speed.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <button className="btn btn-primary px-8 py-4 text-lg">Create Free Account</button>
            <button className="btn btn-outline px-8 py-4 text-lg">View Demo</button>
          </div>
        </div>

        {/* Hero Image Mockup */}
        <div className="animate-fade-in relative mt-16 w-full max-w-5xl px-4" style={{ animationDelay: '0.2s' }}>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-2xl" />
          <div className="glass relative overflow-hidden rounded-2xl border-white/10 shadow-2xl">
            <Image 
              src="/hero-mockup.png" 
              alt="FileVault Dashboard Mockup" 
              width={1200} 
              height={675}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Grid (Simple) */}
      <section className="container my-32">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: "Military Grade", desc: "Your files are encrypted with AES-256 before they even leave your browser." },
            { title: "Instant Share", desc: "Generate secure, time-limited links for your files with a single click." },
            { title: "Global CDN", desc: "Blazing fast access to your files from anywhere in the world." }
          ].map((feature, i) => (
            <div key={i} className="glass p-8 transition-transform hover:-translate-y-1">
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="font-bold">FileVault</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 FileVault Inc. Built with Next.js and ❤️
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Twitter</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
