
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white mb-4">Sidan hittades inte</h2>
          <p className="text-xl text-slate-200 mb-8">
            Tyvärr kunde vi inte hitta sidan du letade efter. Den kanske har flyttats eller inte längre existerar.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 w-full">
              <Home className="w-5 h-5 mr-2" />
              Tillbaka till startsidan
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-white/30 text-white hover:bg-white/10 w-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Gå tillbaka
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
