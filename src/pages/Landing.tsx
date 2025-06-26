
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Rocket, Sparkles, FileText, Brain, Video, Headphones, CheckCircle, Users, Building2 } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    title: "Effortless Upload",
    desc: "Upload your financial report or board document in seconds. No technical skills required.",
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    title: "AI-Powered Analysis",
    desc: "Our EU-based AI extracts, summarizes, and transforms your data securely and accurately.",
  },
  {
    icon: <Video className="w-8 h-8 text-pink-500" />,
    title: "Executive Video",
    desc: "Generate professional, branded video presentations for investors and stakeholders.",
  },
  {
    icon: <Headphones className="w-8 h-8 text-green-500" />,
    title: "Board Podcast",
    desc: "Create strategic audio briefings for board members and management teams.",
  },
];

const testimonials = [
  {
    name: "Anna Svensson",
    title: "CFO, NordicTech",
    quote: "ReportFlow transformed our quarterly reporting. The AI-generated videos and podcasts are a game changer for our investor relations.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Johan Eriksson",
    title: "Chairman, FinBoard",
    quote: "The board loves the audio summaries. We save hours every month and get to the point faster.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];

const Landing = () => {
  return (
    <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
        </div>
        <div className="z-10 text-center max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
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
          <Link to="/register">
            <Button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
              <Rocket className="w-6 h-6" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
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
      <section className="py-20 px-6 bg-gradient-to-br from-blue-950/50 via-indigo-950/50 to-purple-950/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why ReportFlow?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-200">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What our users say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full mb-4 border-4 border-blue-500" 
                  />
                  <p className="italic text-lg mb-4 text-slate-200">"{testimonial.quote}"</p>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-blue-200">{testimonial.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to transform your reporting?</h2>
        <Link to="/register">
          <Button className="px-10 py-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <Rocket className="w-7 h-7" />
            Get Started Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} ReportFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
