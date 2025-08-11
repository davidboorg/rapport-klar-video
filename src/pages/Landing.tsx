import { Rocket, FileText, Brain, Video, Headphones, CheckCircle, Star, ArrowRight } from "lucide-react";
import { ModernButton } from "@/components/ui/modern-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Link } from "react-router-dom";
import QuickPodcastTest from "@/components/dev/QuickPodcastTest";

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    title: "One Upload. Endless Output.",
    desc: "Drop in your board deck or report – our AI takes it from there. No manuals, no fuss.",
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-400" />,
    title: "Built-in Intelligence. Based in Europe.",
    desc: "Secure, GDPR-compliant AI that understands nuance and turns data into clarity.",
  },
  {
    icon: <Video className="w-8 h-8 text-pink-400" />,
    title: "Investor-Ready Video. Instantly.",
    desc: "Branded, polished, and straight to the point. Your story, told like it matters.",
  },
  {
    icon: <Headphones className="w-8 h-8 text-green-400" />,
    title: "Boardroom Audio Briefings. On Demand.",
    desc: "From static PDFs to smart podcasts tailored for decision-makers.",
  },
];

const testimonials = [
  {
    name: "Anna Svensson",
    title: "CFO, NordicTech",
    quote: "ReportFlow transformed our quarterly reporting. The AI-generated videos and podcasts are a game changer for our investor relations.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1cd?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Johan Eriksson",
    title: "Chairman, FinBoard",
    quote: "The board loves the audio summaries. We save hours every month and get to the point faster.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
];

const stats = [
  { label: "Reports Processed", value: "10,000+", icon: <FileText className="w-6 h-6" /> },
  { label: "Hours Saved", value: "50,000+", icon: <CheckCircle className="w-6 h-6" /> },
  { label: "Companies Trust Us", value: "500+", icon: <Star className="w-6 h-6" /> },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Global Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ReportFlow
            </h1>
            <span className="text-xs text-slate-400 font-medium">AI-Powered</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <ModernButton variant="glass" size="sm">
              Sign In
            </ModernButton>
          </Link>
          <Link to="/register">
            <ModernButton size="sm">
              Get Started
            </ModernButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transform Reports
              </span>
              <br />
              <span className="text-white">Into Media</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AI-powered scripts, podcasts, and videos for investor relations and board management.
              <br />
              <span className="text-blue-200 font-semibold">All in one click. 100% EU-compliant.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <ModernButton size="xl" className="group">
                <Rocket className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </ModernButton>
            </Link>
            <ModernButton variant="glass" size="xl">
              <Video className="w-6 h-6 mr-3" />
              Watch Demo
            </ModernButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex items-center justify-center text-blue-400">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Three simple steps to transform your reports into engaging media
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FileText className="w-12 h-12" />, title: "Upload", desc: "Drop your PDF report", step: "01" },
              { icon: <Brain className="w-12 h-12" />, title: "AI Magic", desc: "Our AI analyzes & creates", step: "02" },
              { icon: <Video className="w-12 h-12" />, title: "Media Ready", desc: "Get videos & podcasts", step: "03" }
            ].map((item, index) => (
              <ModernCard key={index} variant="glass" className="text-center p-8 relative">
                <div className="absolute -top-4 left-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {item.step}
                </div>
                <div className="text-blue-400 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose ReportFlow?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for the modern enterprise with cutting-edge AI and European data protection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ModernCard key={index} variant="glass" className="p-8 text-center h-full">
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-300">
              See what our customers are saying about ReportFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <ModernCard key={index} variant="glass" className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-slate-200 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.title}</p>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ModernCard variant="gradient" className="p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Reporting?
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies already using ReportFlow to create professional videos and podcasts from their financial reports.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <ModernButton size="xl" className="group">
                  <Rocket className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </ModernButton>
              </Link>
              <p className="text-sm text-slate-400">
                ✓ 14-day free trial &nbsp;&nbsp;✓ No credit card required &nbsp;&nbsp;✓ EU compliant
              </p>
            </div>
          </ModernCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} ReportFlow. All rights reserved. Made with ❤️ in Europe.
          </p>
        </div>
      </footer>
    <QuickPodcastTest />
    </div>
  );
}
