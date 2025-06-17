
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Upload, CheckCircle, ArrowRight, Users, Shield, TrendingUp, Clock, Zap, Star, Crown, X, FileText, Headphones, Video } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ReportFlow</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-700 transition-colors">Features</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-700 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-slate-600 hover:text-blue-700 transition-colors">Success Stories</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-700 hover:bg-blue-800">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Maximum Impact */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto text-center max-w-6xl">
          {/* Social Proof Banner */}
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Trusted by 100+ Nordic executives and board members
          </Badge>
          
          {/* Primary Headlines */}
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Stop Wasting Hours on
            <span className="text-blue-700 block">Financial Briefings</span>
          </h1>
          
          <p className="text-2xl text-slate-700 mb-8 leading-relaxed max-w-4xl mx-auto">
            AI transforms your reports into podcasts and videos that executives actually consume
          </p>
          
          {/* Power Statement */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12 max-w-4xl mx-auto">
            <p className="text-xl font-medium text-slate-800 mb-6">
              From 3-hour board meetings to 30-minute strategic sessions.<br/>
              From unread investor reports to engaging presentations that drive action.
            </p>
            
            {/* Dual Value Proposition */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">For Board Members</h3>
                <p className="text-slate-600">Arrive informed, not overwhelmed</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">For Public Companies</h3>
                <p className="text-slate-600">Investor communications that actually get watched</p>
              </div>
            </div>
          </div>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/market-selection">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-xl px-12 py-6">
                Transform Your Next Report
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-xl px-12 py-6 border-2">
              <Play className="mr-3 w-6 h-6" />
              Watch 2-Minute Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">The Old Way vs The ReportFlow Way</h2>
            <p className="text-xl text-slate-600">See the dramatic transformation in how executives consume financial information</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Traditional Way */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 mb-2">Traditional Way</h3>
                  <p className="text-red-700">Inefficient and time-consuming</p>
                </div>
                <ul className="space-y-4">
                  {[
                    "40-page quarterly reports that nobody reads",
                    "3-hour board meetings spent on data briefings",
                    "Executives arriving unprepared to strategic discussions",
                    "$25,000 video production costs and 6-week timelines",
                    "Investor communications that get ignored"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <span className="text-red-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* ReportFlow Way */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">ReportFlow Way</h3>
                  <p className="text-green-700">Efficient and engaging</p>
                </div>
                <ul className="space-y-4">
                  {[
                    "10-minute AI podcasts consumed during commute",
                    "30-minute board meetings focused on decisions", 
                    "Executives arriving fully briefed and ready",
                    "Professional videos generated in 10 minutes for $200",
                    "Engaging content that investors actually watch"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-green-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Transformation Metrics */}
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[
              { metric: "2.5 hours", label: "Saved per board meeting", icon: Clock },
              { metric: "90%", label: "Reduction in prep time", icon: TrendingUp },
              { metric: "10x", label: "Higher investor engagement", icon: Users },
              { metric: "95%", label: "Cost reduction vs traditional", icon: Star }
            ].map((item, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-md">
                <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 mb-2">{item.metric}</div>
                <p className="text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Market Sections */}
      <section className="py-20 px-6 bg-white" id="features">
        <div className="container mx-auto max-w-7xl">
          {/* Board Management Section */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-purple-100 text-purple-800">Board Management</Badge>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Revolutionary Board Meeting Efficiency</h2>
                <p className="text-xl text-slate-600 mb-8">Board members managing 5-15 companies get personalized podcast briefings instead of document stacks</p>
                
                <Card className="bg-purple-50 border-purple-200 mb-8">
                  <CardContent className="p-6">
                    <p className="text-purple-800 italic mb-4">
                      "As a board member, I used to spend weekends reading through monthly reports from 8 companies. Now I listen to AI-generated podcasts during my morning run and arrive at meetings ready for strategic discussions, not status updates."
                    </p>
                    <p className="font-semibold text-purple-900">- Lars Andersson, Board Member</p>
                  </CardContent>
                </Card>

                <ul className="space-y-3">
                  {[
                    "Portfolio dashboard for multiple companies",
                    "AI podcasts optimized for mobile listening",
                    "Strategic decision summaries, not just numbers",
                    "Cross-company trend analysis and insights"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-8 rounded-2xl">
                <div className="text-center">
                  <Headphones className="w-24 h-24 text-purple-600 mx-auto mb-6" />
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-purple-800">Company A - Monthly Report</h4>
                      <p className="text-sm text-purple-600">8-minute strategic briefing ready</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-purple-800">Company B - Q1 Results</h4>
                      <p className="text-sm text-purple-600">12-minute analysis available</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-purple-800">Portfolio Insights</h4>
                      <p className="text-sm text-purple-600">Cross-company trends identified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IR & Public Company Section */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 rounded-2xl">
                <div className="text-center">
                  <Video className="w-24 h-24 text-blue-600 mx-auto mb-6" />
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-blue-800">Q4 2024 Results</h4>
                      <p className="text-sm text-blue-600">Professional video generated</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-blue-800">Investor Briefing</h4>
                      <p className="text-sm text-blue-600">Personal avatar presentation</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-blue-800">Social Media Clips</h4>
                      <p className="text-sm text-blue-600">Multiple formats ready</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-800">Investor Relations</Badge>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Investor Relations That Actually Engage</h2>
                <p className="text-xl text-slate-600 mb-8">Transform quarterly reports into professional videos with your personal AI avatar</p>
                
                <Card className="bg-blue-50 border-blue-200 mb-8">
                  <CardContent className="p-6">
                    <p className="text-blue-800 italic mb-4">
                      "Our investor videos now get 5x more views than traditional reports. ReportFlow lets me personally present our results even when I'm traveling globally."
                    </p>
                    <p className="font-semibold text-blue-900">- Maria Källström, CFO</p>
                  </CardContent>
                </Card>

                <ul className="space-y-3">
                  {[
                    "Personal executive avatars for consistent branding",
                    "Professional video production in minutes",
                    "Multiple format output: Video, audio, social media",
                    "Enterprise-grade quality and compliance"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Powered by Cutting-Edge AI</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "OpenAI GPT-4", desc: "Intelligent financial analysis and script generation", icon: "🧠" },
              { name: "ElevenLabs", desc: "Professional voice cloning and narration", icon: "🎤" },
              { name: "HeyGen", desc: "Personal avatar creation and video generation", icon: "👤" }
            ].map((tech, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{tech.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{tech.name}</h3>
                <p className="text-slate-600">{tech.desc}</p>
              </Card>
            ))}
          </div>
          <p className="text-xl text-slate-700 font-medium">
            Your expertise + AI efficiency = Professional results
          </p>
        </div>
      </section>

      {/* Results & Testimonials */}
      <section className="py-20 px-6 bg-white" id="testimonials">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">ReportFlow customers report:</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { metric: "85%", label: "Reduction in board meeting preparation time" },
                { metric: "4x", label: "Higher investor presentation engagement" },
                { metric: "90%", label: "Of executives prefer AI briefings over document reading" },
                { metric: "95%", label: "Would recommend to other board members" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-700 mb-2">{stat.metric}</div>
                  <p className="text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Game-changing for board efficiency. I can manage twice as many board positions effectively.",
              "Our investor relations have never been more engaging. Professional quality that rivals expensive agencies.",
              "Finally, board meetings focused on strategy instead of spreadsheet reviews."
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white">
                <CardContent className="p-0">
                  <p className="text-slate-700 italic mb-4">"{testimonial}"</p>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Value */}
      <section className="py-20 px-6 bg-slate-50" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Professional results at a fraction of traditional costs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Board Management</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-2">From 5,000 SEK</div>
                  <p className="text-slate-600">per month</p>
                  <p className="text-sm text-purple-600 mt-2">Cost of one traditional board meeting = 6 months of ReportFlow</p>
                </div>
                <Link to="/market-selection">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Board Transformation</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Public Company IR</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">From 15,000 SEK</div>
                  <p className="text-slate-600">per month</p>
                  <p className="text-sm text-blue-600 mt-2">Cost of one professional video = Full year of unlimited content</p>
                </div>
                <Link to="/market-selection">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Transform IR Communications</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Value Calculator */}
          <Card className="bg-green-50 border-green-200 max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-6">Calculate Your Savings</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-green-700">48 hours</div>
                  <p className="text-green-600">Traditional board prep time per year</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700">0 hours</div>
                  <p className="text-green-600">ReportFlow prep time</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700">6 days</div>
                  <p className="text-green-600">Full workdays saved per year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 bg-blue-700">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-orange-100 text-orange-800 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Limited beta access for Nordic executives
          </Badge>
          
          <h2 className="text-5xl font-bold text-white mb-6">
            Join the Financial Communication Revolution
          </h2>
          
          <p className="text-xl text-blue-100 mb-12">
            Transform how your organization handles financial briefings and investor communications
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/market-selection">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 text-xl px-12 py-6">
                Start Your Free Transform
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700 text-xl px-12 py-6">
              Book Executive Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700 text-xl px-12 py-6">
              Download ROI Calculator
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, text: "SOC 2 compliant security" },
              { icon: CheckCircle, text: "GDPR compliant data handling" },
              { icon: TrendingUp, text: "99.9% uptime guarantee" },
              { icon: Star, text: "Enterprise-grade encryption" }
            ].map((signal, index) => (
              <div key={index} className="flex items-center space-x-2 text-blue-100">
                <signal.icon className="w-5 h-5" />
                <span className="text-sm">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">ReportFlow</h3>
              </div>
              <p className="text-slate-400">Revolutionizing financial communication with AI-powered efficiency.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Board Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nordic Focus</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Executive Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ReportFlow AB. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
