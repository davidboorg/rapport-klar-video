
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Palette } from "lucide-react";

interface BrandConfig {
  company_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
}

interface BrandCustomizationProps {
  brandConfig: BrandConfig;
  onBrandConfigChange: (config: BrandConfig) => void;
}

const BrandCustomization = ({ brandConfig, onBrandConfigChange }: BrandCustomizationProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(brandConfig.logo_url || null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLogoPreview(logoUrl);
        onBrandConfigChange({
          ...brandConfig,
          logo_url: logoUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBrandConfig = (updates: Partial<BrandConfig>) => {
    onBrandConfigChange({
      ...brandConfig,
      ...updates
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Varumärkesanpassning
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company-name">Företagsnamn</Label>
          <Input
            id="company-name"
            value={brandConfig.company_name}
            onChange={(e) => updateBrandConfig({ company_name: e.target.value })}
            placeholder="Ditt företagsnamn"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Företagslogo</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <Upload className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mb-2"
              />
              <p className="text-xs text-slate-600">
                Rekommenderat: PNG eller SVG, max 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primär färg</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primary-color"
                value={brandConfig.primary_color}
                onChange={(e) => updateBrandConfig({ primary_color: e.target.value })}
                className="w-12 h-10 rounded border"
              />
              <Input
                value={brandConfig.primary_color}
                onChange={(e) => updateBrandConfig({ primary_color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Sekundär färg</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="secondary-color"
                value={brandConfig.secondary_color}
                onChange={(e) => updateBrandConfig({ secondary_color: e.target.value })}
                className="w-12 h-10 rounded border"
              />
              <Input
                value={brandConfig.secondary_color}
                onChange={(e) => updateBrandConfig({ secondary_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Förhandsvisning</Label>
          <div className="p-4 rounded-lg border" style={{ 
            background: `linear-gradient(135deg, ${brandConfig.primary_color}, ${brandConfig.secondary_color})` 
          }}>
            <div className="bg-white rounded p-3 text-center">
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="h-8 mx-auto mb-2" />
              )}
              <h3 className="font-semibold" style={{ color: brandConfig.primary_color }}>
                {brandConfig.company_name || "Ditt Företag"}
              </h3>
              <p className="text-sm text-slate-600">Kvartalsrapport Q3 2024</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandCustomization;
