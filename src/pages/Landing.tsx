import { Rocket, FileText, Brain, Video, Headphones, CheckCircle, Users, Building2 } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    title: "One Upload. Endless Output.",
    desc: "Drop in your board deck or report – our AI takes it from there. No manuals, no fuss.",
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    title: "Built-in Intelligence. Based in Europe.",
    desc: "Secure, GDPR-compliant AI that understands nuance and turns data into clarity.",
  },
  {
    icon: <Video className="w-8 h-8 text-pink-500" />,
    title: "Investor-Ready Video. Instantly.",
    desc: "Branded, polished, and straight to the point. Your story, told like it matters.",
  },
  {
    icon: <Headphones className="w-8 h-8 text-green-500" />,
    title: "Boardroom Audio Briefings. On Demand.",
    desc: "From static PDFs to smart podcasts tailored for decision-makers.",
  },
];

const testimonials = [
  {
    name: "Anna Svensson",
    title: "CFO, NordicTech",
    quote: "ReportFlow transformed our quarterly reporting. The AI-generated videos and podcasts are a game changer for our investor relations.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Johan Eriksson",
    title: "Chairman, FinBoard",
    quote: "The board loves the audio summaries. We save hours every month and get to the point faster.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

export default function Landing() {
  return (
    <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 min-h-screen text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
        </div>
        <div className="z-10 text-center max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="uppercase tracking-widest font-bold text-lg text-yellow-300">AI-First Reporting</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ReportFlow
            </span>
            <br />
            <span className="text-white">Turns Reports Into Media</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-8 font-medium">
            AI-powered scripts, podcasts, and videos for investor relations and board management.<br />
            <span className="text-blue-200">All in one click. 100% EU-compliant.</span>
          </p>
          <div className="flex justify-center">
            <a href="/register">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                Get Started
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">How it Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <FileText className="w-16 h-16 text-blue-400 mb-2" />
              <span className="font-semibold text-lg">Upload PDF</span>
            </div>
            <span className="text-4xl text-blue-300">→</span>
            <div className="flex flex-col items-center">
              <Brain className="w-16 h-16 text-purple-400 mb-2" />
              <span className="font-semibold text-lg">AI Magic</span>
            </div>
            <span className="text-4xl text-blue-300">→</span>
            <div className="flex flex-col items-center">
              <Video className="w-16 h-16 text-pink-400 mb-2" />
              <span className="font-semibold text-lg">Video</span>
            </div>
            <span className="text-4xl text-blue-300">+</span>
            <div className="flex flex-col items-center">
              <Headphones className="w-16 h-16 text-green-400 mb-2" />
              <span className="font-semibold text-lg">Podcast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why ReportFlow?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
                {f.icon}
                <h3 className="text-xl font-bold mt-4 mb-2">{f.title}</h3>
                <p className="text-slate-200">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What our users say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-8 flex flex-col items-center shadow-lg">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-4 border-blue-500" />
                <p className="italic text-lg mb-4">"{t.quote}"</p>
                <div className="font-bold">{t.name}</div>
                <div className="text-blue-200">{t.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to transform your reporting?</h2>
        <div className="flex justify-center">
          <a href="/register">
            <button className="px-10 py-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              <Rocket className="w-7 h-7" />
              Get Started Now
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400">
        &copy; {new Date().getFullYear()} ReportFlow. All rights reserved.
      </footer>
    </div>
  );
}
