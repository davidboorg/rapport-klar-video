import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Building, 
  Mail, 
  Shield, 
  CreditCard, 
  Settings, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Crown
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: user?.company || "",
  });

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      toast({
        title: "Profil uppdaterad",
        description: "Dina ändringar har sparats framgångsrikt",
      });
    }, 1000);
  };

  const subscriptionFeatures = {
    free: [
      "5 videor per månad",
      "Grundläggande mallar", 
      "Standard videokvalitet",
      "E-postsupport"
    ],
    pro: [
      "25 videor per månad",
      "Alla premium mallar",
      "HD videokvalitet", 
      "Varumärkesanpassning",
      "Prioriterad support",
      "API-åtkomst"
    ],
    enterprise: [
      "Obegränsade videor",
      "Anpassade mallar",
      "4K videokvalitet",
      "Fullständig varumärkesanpassning",
      "Dedikerad support",
      "Avancerad API",
      "On-premise deployment"
    ]
  };

  const currentFeatures = subscriptionFeatures[user?.subscription || 'free'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profil & Inställningar</h1>
          <p className="text-slate-600 mt-2">
            Hantera ditt konto och dina prenumerationsuppgifter
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="subscription">Prenumeration</TabsTrigger>
            <TabsTrigger value="security">Säkerhet</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profilinformation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-slate-600">{user?.email}</p>
                    <p className="text-slate-500 text-sm">{user?.company}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Ladda upp bild
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Förnamn</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Efternamn</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Företag</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Avbryt
                      </Button>
                      <Button onClick={handleSave}>
                        Spara ändringar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Redigera profil
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Nuvarande plan
                    </div>
                    <Badge className={`${
                      user?.subscription === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                      user?.subscription === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user?.subscription?.toUpperCase() || 'FREE'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Inkluderade funktioner:</h3>
                      <ul className="space-y-2">
                        {currentFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium mb-2">Månadsanvändning</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Videor skapade</span>
                            <span>8/25</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </div>
                      </div>
                      {user?.subscription !== 'enterprise' && (
                        <Button className="w-full">
                          Uppgradera plan
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Fakturering
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-slate-600">Förfaller 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Uppdatera
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Nästa betalning: 15 februari 2024</span>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Ladda ner faktura
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Lösenord & Säkerhet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Lösenord</h3>
                      <p className="text-sm text-slate-600">Senast ändrat för 3 månader sedan</p>
                    </div>
                    <Button variant="outline">
                      Ändra lösenord
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Tvåfaktorsautentisering</h3>
                      <p className="text-sm text-slate-600">Lägg till extra säkerhet till ditt konto</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <Button variant="outline">
                        Aktivera
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktiva sessioner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Aktuell session</p>
                        <p className="text-sm text-slate-600">Chrome på Mac • Stockholm, Sverige</p>
                        <p className="text-xs text-slate-500">Aktiv nu</p>
                      </div>
                      <Badge variant="secondary">Aktiv</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">iPhone</p>
                        <p className="text-sm text-slate-600">Safari • Stockholm, Sverige</p>
                        <p className="text-xs text-slate-500">Senast aktiv för 2 dagar sedan</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Logga ut
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Data & Integritet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Ladda ner dina data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Ta bort konto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
