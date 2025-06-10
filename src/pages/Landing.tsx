
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Upload, Settings, Download, CheckCircle, ArrowRight, Users, Shield, TrendingUp, UserCheck, Star, Crown } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ReportFlow</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">About</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <UserCheck className="w-4 h-4 mr-2" />
            AI-Powered IR Video Generation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Transform Your 
            <span className="text-blue-600"> Quarterly Reports</span> into Professional Videos
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            CEOs and CFOs create personal AI avatars that present quarterly numbers and annual reports. 
            Build your personal brand and communicate authentically with investors and stakeholders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Upload Your Report
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              See CEO Demo
              <Play className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How to Create Your AI Report Videos</h2>
            <p className="text-xl text-slate-600">From quarterly report to professional presentation in minutes</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Upload Your Report</h3>
                <p className="text-slate-600">Drag and drop your quarterly report - AI extracts key metrics automatically</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. AI Generates Script</h3>
                <p className="text-slate-600">Professional script created from your financial data and key highlights</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Your Avatar Presents</h3>
                <p className="text-slate-600">Your personal AI avatar delivers the presentation with your voice</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">4. Download & Share</h3>
                <p className="text-slate-600">Your avatar presents on LinkedIn, website, investor meetings</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Personal Brand Building for Executives</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Authentic Representation</h3>
                    <p className="text-slate-600">Real people from your company - not generic AI</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Unlimited Customization</h3>
                    <p className="text-slate-600">Different versions for investors, media, employees</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Multiple Presenters</h3>
                    <p className="text-slate-600">CEO, CFO, IR director - entire leadership team can have avatars</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Higher Engagement</h3>
                    <p className="text-slate-600">Personal touch creates trust and stronger connections</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">50+</h3>
                    <p className="text-slate-600">Leaders have created their avatars</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">3x</h3>
                    <p className="text-slate-600">Higher engagement vs traditional reports</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Star className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">95%</h3>
                    <p className="text-slate-600">Of users prefer personal avatars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-white" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Investment for Your Organization</h2>
            <p className="text-xl text-slate-600">Professional avatar creation and report generation</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-blue-200 transition-colors relative">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Professional</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">$200-600</div>
                  <p className="text-slate-600">per month + setup</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">1-2 avatars per organization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Unlimited report generations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Brand customization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Standard support</span>
                  </li>
                </ul>
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-slate-600 mb-2"><strong>Setup:</strong></p>
                  <p className="text-sm text-slate-600">Avatar creation: $300-400 per avatar</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Choose Professional</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">$600-1000</div>
                  <p className="text-slate-600">per month + premium setup</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Unlimited avatars</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Premium customization & templates</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Advanced brand integration</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Dedicated success manager</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Priority support & training</span>
                  </li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 mb-2"><strong>Premium Setup:</strong></p>
                  <p className="text-sm text-blue-800">Avatar creation: $400-600 per avatar</p>
                  <p className="text-sm text-blue-800">+50% customization options</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Choose Enterprise</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Financial Communications?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join global leaders who already use their AI avatars to communicate financial results authentically and professionally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4">
                Create Your Avatar Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              Book Strategy Call
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
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">ReportFlow</h3>
              </div>
              <p className="text-slate-400">Create personal AI avatars for authentic financial communication.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Avatar Creation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Generation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ReportFlow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
