
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Users, Shield, TrendingUp, Clock, Zap, Star, CheckCircle, FileText, Headphones, Video, Mic, Brain, Target, BarChart3, PresentationChart, Building2, UserCheck, Globe, Smartphone, Award, Briefcase } from "lucide-react";

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
            <a href="#platform" className="text-slate-600 hover:text-blue-700 transition-colors">Platform</a>
            <a href="#solutions" className="text-slate-600 hover:text-blue-700 transition-colors">Solutions</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-700 transition-colors">Pricing</a>
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

      {/* Hero Section - Balanced Dual Messaging */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto text-center max-w-7xl">
          {/* Primary Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            AI Content Engine for
            <span className="text-blue-700 block">Financial Communication</span>
          </h1>
          
          {/* Balanced Subheadline */}
          <p className="text-2xl text-slate-700 mb-12 leading-relaxed max-w-5xl mx-auto">
            Transform financial reports into professional videos and podcasts for both investor relations and board management
          </p>

          {/* Dual Value Proposition - 50/50 Split */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
            {/* Left Column - Public Companies */}
            <Card className="border-2 border-blue-200 bg-blue-50 p-8">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-6">
                  <Video className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-blue-800">Professional Investor Content</h3>
                </div>
                <p className="text-xl text-blue-700 mb-6">Transform quarterly reports into engaging investor presentations</p>
                <ul className="space-y-3 text-left">
                  {[
                    "AI-generated videos with executive avatars",
                    "Professional podcast for investor briefings", 
                    "Multi-format content from single report",
                    "Enterprise-grade quality and compliance"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Right Column - Board Management */}
            <Card className="border-2 border-purple-200 bg-purple-50 p-8">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-6">
                  <Headphones className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-purple-800">Efficient Board Communication</h3>
                </div>
                <p className="text-xl text-purple-700 mb-6">Turn monthly reports into strategic board briefings</p>
                <ul className="space-y-3 text-left">
                  {[
                    "AI-generated podcasts for pre-meeting consumption",
                    "Portfolio overview across multiple companies",
                    "Strategic summaries focused on decision-making", 
                    "Mobile-optimized for busy board schedules"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Unified CTA */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-slate-900 mb-6">One Platform, Two Revolutionary Applications</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/market-selection">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-lg px-8 py-4">
                  For Public Companies
                  <Building2 className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/market-selection">
                <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-lg px-8 py-4">
                  For Board Management
                  <Users className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2">
                <Play className="mr-2 w-5 h-5" />
                Explore Both
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Generation Showcase - Central Focus */}
      <section className="py-20 px-6 bg-slate-50" id="platform">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">AI Content Engine Powers Both Markets</h2>
            <p className="text-xl text-slate-600">One Upload → Multiple Professional Formats</p>
          </div>

          {/* Content Transformation Visual */}
          <div className="bg-white rounded-2xl p-12 shadow-lg mb-16">
            <div className="flex flex-col items-center space-y-8">
              {/* Input */}
              <div className="flex items-center space-x-4">
                <FileText className="w-12 h-12 text-slate-600" />
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-slate-800">Financial Report</h4>
                  <p className="text-slate-600">Input</p>
                </div>
              </div>

              {/* AI Processing */}
              <div className="flex items-center space-x-4">
                <ArrowRight className="w-8 h-8 text-blue-600" />
                <Brain className="w-12 h-12 text-blue-600" />
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-blue-800">AI Processing</h4>
                  <p className="text-blue-600">Intelligent analysis & generation</p>
                </div>
                <ArrowRight className="w-8 h-8 text-blue-600" />
              </div>

              {/* Outputs */}
              <div className="grid md:grid-cols-4 gap-6 w-full">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Video className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-blue-800">Professional Video</h5>
                  <p className="text-sm text-blue-600">IR Output</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Headphones className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-purple-800">Strategic Podcast</h5>
                  <p className="text-sm text-purple-600">Board Output</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Smartphone className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-green-800">Social Media</h5>
                  <p className="text-sm text-green-600">Bonus Output</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <BarChart3 className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-orange-800">Executive Summary</h5>
                  <p className="text-sm text-orange-600">Additional Output</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Power */}
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "OpenAI GPT-4", desc: "Intelligent content analysis and script generation", icon: "🧠" },
              { name: "ElevenLabs", desc: "Professional voice cloning and narration", icon: "🎤" },
              { name: "HeyGen", desc: "Executive avatar creation and video production", icon: "👤" },
              { name: "Advanced PDF", desc: "Extract insights from any financial document", icon: "📄" }
            ].map((tech, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow text-center">
                <div className="text-4xl mb-4">{tech.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{tech.name}</h3>
                <p className="text-slate-600">{tech.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Market Success Stories - Equal Prominence */}
      <section className="py-20 px-6 bg-white" id="solutions">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Dual Market Success Stories</h2>
            <p className="text-xl text-slate-600">Revolutionary results across both market segments</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Public Company Success */}
            <div className="space-y-8">
              <div className="text-center">
                <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">Public Company Success</Badge>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Investor Engagement Revolution</h3>
              </div>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-8">
                  <p className="text-blue-800 italic text-lg mb-6">
                    "Our Q3 earnings video generated 5x more engagement than traditional reports. ReportFlow's AI created professional content that investors actually consume."
                  </p>
                  <p className="font-semibold text-blue-900">- Maria Källström, CFO, Listed Tech Company</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { metric: "340%", label: "Higher investor engagement" },
                  { metric: "95%", label: "Cost reduction vs traditional video" },
                  { metric: "10 min", label: "vs 6 weeks production time" },
                  { metric: "100%", label: "Professional quality maintained" }
                ].map((stat, index) => (
                  <div key={index} className="text-center bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{stat.metric}</div>
                    <p className="text-sm text-blue-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Board Management Success */}
            <div className="space-y-8">
              <div className="text-center">
                <Badge className="mb-4 bg-purple-100 text-purple-800 px-4 py-2">Board Management Success</Badge>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Board Meeting Transformation</h3>
              </div>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-8">
                  <p className="text-purple-800 italic text-lg mb-6">
                    "Managing 8 board positions used to consume my weekends reading reports. Now I listen to AI-generated briefings during commutes and arrive fully prepared for strategic discussions."
                  </p>
                  <p className="font-semibold text-purple-900">- Lars Andersson, Professional Board Member</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { metric: "85%", label: "Reduction in preparation time" },
                  { metric: "30 min", label: "3-hour meetings reduced" },
                  { metric: "Multiple", label: "Portfolio management" },
                  { metric: "Strategic", label: "Focus instead of data review" }
                ].map((stat, index) => (
                  <div key={index} className="text-center bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 mb-1">{stat.metric}</div>
                    <p className="text-sm text-purple-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Engine Features - Unified Platform */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Advanced AI Content Generation for Both Markets</h2>
            <p className="text-xl text-slate-600">Unified platform with market-specific features</p>
          </div>

          {/* Core Engine Capabilities */}
          <Card className="mb-12 p-8 bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Core Engine Capabilities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Brain, title: "Intelligent PDF Analysis", desc: "Advanced data extraction and context awareness" },
                { icon: Video, title: "Multi-format Generation", desc: "Video, audio, and text content creation" },
                { icon: Mic, title: "Professional Scripts", desc: "Context-aware script creation with quality assurance" },
                { icon: UserCheck, title: "Avatar & Voice Cloning", desc: "Personal branding with executive avatars" },
                { icon: Shield, title: "Brand Customization", desc: "Compliance features and brand consistency" },
                { icon: Zap, title: "Real-time Processing", desc: "Fast generation with quality assurance" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <feature.icon className="w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{feature.title}</h4>
                    <p className="text-slate-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market-Specific Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                Public Company Features
              </h3>
              <ul className="space-y-3">
                {[
                  "Quarterly/annual report processing",
                  "Investor presentation templates", 
                  "Executive avatar for consistent branding",
                  "Compliance with financial communication standards",
                  "Integration with investor platforms"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Board Management Features
              </h3>
              <ul className="space-y-3">
                {[
                  "Monthly report briefing generation",
                  "Portfolio dashboard for multiple companies",
                  "Strategic decision-focused summaries",
                  "Mobile podcast optimization", 
                  "Cross-company trend analysis"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder Expertise - Dual Market Credibility */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Built by Someone Who Lives Both Worlds</h2>
          </div>
          
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">David Borg, Founder & CEO</h3>
                <p className="text-lg text-slate-700 mb-6 italic">
                  "As an entrepreneur who sold for 90M SEK and now serves on multiple boards, I understand both the investor relations challenge and the board efficiency problem. ReportFlow's content engine solves both."
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Dual Experience:</h4>
                  {[
                    "CEO/Founder perspective on investor communications",
                    "Board member experience across multiple companies", 
                    "Understanding of both public and private company needs",
                    "Nordic business culture and professional standards expertise"
                  ].map((credential, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">{credential}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto mb-6"></div>
                <Badge className="bg-green-100 text-green-800 px-4 py-2">90M SEK Exit + Active Board Member</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Unified Technology - Shared Innovation */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Same Advanced AI, Different Applications</h2>
            <p className="text-xl text-slate-600">Cutting-edge content generation solving communication challenges in both contexts</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: "Financial Analysis", desc: "AI understands both investor-focused and board-focused content needs" },
              { icon: Award, title: "Professional Quality", desc: "Enterprise-grade output suitable for both investor presentations and board briefings" },
              { icon: Clock, title: "Efficiency Gains", desc: "Revolutionary time savings whether preparing for earnings calls or board meetings" },
              { icon: UserCheck, title: "Personal Touch", desc: "Your voice and presence in both investor relations and board communications" }
            ].map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <benefit.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Market-Appropriate Value */}
      <section className="py-20 px-6 bg-white" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Content Engine Pricing</h2>
            <p className="text-xl text-slate-600">Market-appropriate value for professional content generation</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <Card className="border-2 border-blue-200 p-8">
              <div className="text-center mb-6">
                <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Public Company Content</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">15,000-50,000 SEK</div>
                <p className="text-slate-600">per month</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Unlimited quarterly/annual report processing",
                  "Professional video and podcast generation",
                  "Executive avatar creation and management", 
                  "Enterprise compliance and security features"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/market-selection">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Transform IR Communications</Button>
              </Link>
            </Card>

            <Card className="border-2 border-purple-200 p-8">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Board Management Content</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">5,000-15,000 SEK</div>
                <p className="text-slate-600">per month</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Monthly report processing for multiple companies",
                  "Portfolio management dashboard",
                  "Strategic briefing generation",
                  "Mobile-optimized podcast delivery"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/market-selection">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Optimize Board Meetings</Button>
              </Link>
            </Card>
          </div>

          <Card className="bg-green-50 border-green-200 max-w-4xl mx-auto p-8 text-center">
            <h3 className="text-2xl font-bold text-green-800 mb-4">Enterprise Solutions</h3>
            <p className="text-green-700 mb-6">Custom packages for organizations needing both IR and board management content generation</p>
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
              <Briefcase className="w-4 h-4 mr-2" />
              Schedule Enterprise Consultation
            </Button>
          </Card>
        </div>
      </section>

      {/* Final Call to Action - Balanced Pathways */}
      <section className="py-20 px-6 bg-blue-700">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-5xl font-bold text-white mb-6">
            Choose Your Content Revolution
          </h2>
          
          <p className="text-xl text-blue-100 mb-12">
            ReportFlow: The Complete Financial Content Engine
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-white">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Transform Investor Relations</h3>
              <p className="text-slate-600 text-sm mb-4">Professional AI-generated content that drives engagement and saves costs</p>
              <Link to="/market-selection">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Public Company Demo</Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Optimize Board Meetings</h3>
              <p className="text-slate-600 text-sm mb-4">Strategic briefings that save time and improve decision-making</p>
              <Link to="/market-selection">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Board Management Demo</Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Explore Full Platform</h3>
              <p className="text-slate-600 text-sm mb-4">Comprehensive demo covering both applications</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Full Platform Demo
              </Button>
            </Card>
          </div>

          <div className="bg-white/10 rounded-2xl p-8">
            <p className="text-blue-100 mb-4">Or speak with our team about custom solutions for your specific needs</p>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
              Schedule Executive Consultation
            </Button>
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
              <p className="text-slate-400">AI content engine for financial communication excellence.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Public Company IR</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Board Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Content Engine</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Professional Videos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Strategic Podcasts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nordic Focus</a></li>
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
