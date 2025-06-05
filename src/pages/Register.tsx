
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Play, Eye, EyeOff, CheckCircle } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { firstName, lastName, email, company, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !company || !password || !confirmPassword) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i alla fält",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Lösenord matchar inte",
        description: "Kontrollera att lösenorden är identiska",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Svagt lösenord",
        description: "Lösenordet måste vara minst 8 tecken långt",
        variant: "destructive",
      });
      return;
    }

    const { error } = await register(email, password, { firstName, lastName, company });
    
    if (error) {
      if (error.message === "User already registered") {
        toast({
          title: "E-postadressen används redan",
          description: "Det finns redan ett konto med denna e-postadress",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registrering misslyckades",
          description: error.message || "Ett fel uppstod. Försök igen.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Kontot skapat!",
        description: "Kontrollera din e-post för att bekräfta ditt konto",
      });
      navigate("/login");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">ReportFlow</h1>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Skapa ditt konto</h2>
          <p className="text-slate-600">Börja skapa professionella videor av dina finansiella rapporter</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Registrera dig</CardTitle>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>14 dagars gratis provperiod</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Ingen bindningstid</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Förnamn</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Anders"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Efternamn</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Svensson"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anders@företag.se"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Företag</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Nordiska AB"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minst 8 tecken"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Upprepa lösenordet"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  Jag godkänner{" "}
                  <Link to="#" className="text-blue-600 hover:text-blue-700">
                    användarvillkoren
                  </Link>{" "}
                  och{" "}
                  <Link to="#" className="text-blue-600 hover:text-blue-700">
                    integritetspolicyn
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Skapar konto..." : "Skapa konto"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Har du redan ett konto?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Logga in här
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
