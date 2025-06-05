
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Play, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i alla fält",
        variant: "destructive",
      });
      return;
    }

    const { error } = await login(email, password);
    
    if (error) {
      if (error.message === "Invalid login credentials") {
        toast({
          title: "Felaktiga uppgifter",
          description: "E-postadressen eller lösenordet är felaktigt",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inloggning misslyckades",
          description: error.message || "Ett fel uppstod. Försök igen.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Välkommen tillbaka!",
        description: "Du har loggats in framgångsrikt",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ReportFlow</h1>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Välkommen tillbaka</h2>
          <p className="text-slate-600">Logga in på ditt konto för att fortsätta</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Logga in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din@epost.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ditt lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-600">
                    Kom ihåg mig
                  </label>
                </div>
                <Link to="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Glömt lösenord?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Loggar in..." : "Logga in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Har du inget konto?{" "}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Registrera dig här
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          Genom att logga in godkänner du våra{" "}
          <Link to="#" className="text-blue-600 hover:text-blue-700">
            Användarvillkor
          </Link>{" "}
          och{" "}
          <Link to="#" className="text-blue-600 hover:text-blue-700">
            Integritetspolicy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
