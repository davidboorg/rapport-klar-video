
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Building2 } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (projectData: ProjectFormData) => void;
  loading?: boolean;
}

export interface ProjectFormData {
  name: string;
  description: string;
  industry: string;
  report_type: string;
  fiscal_year: number;
  company_logo_url?: string;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    industry: '',
    report_type: '',
    fiscal_year: new Date().getFullYear(),
    company_logo_url: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreateProject({
      ...formData,
      company_logo_url: logoPreview || undefined
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLogoPreview(logoUrl);
        setFormData(prev => ({ ...prev, company_logo_url: logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      report_type: '',
      fiscal_year: new Date().getFullYear(),
      company_logo_url: ''
    });
    setLogoPreview(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Report Video</DialogTitle>
          <DialogDescription>
            Set up a new project for your quarterly report video
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Logo */}
          <div className="space-y-2">
            <Label>Company Logo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-sm"
                />
                <p className="text-xs text-slate-600 mt-1">
                  PNG, JPG or SVG (max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g. Q4 2024 Financial Report"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={formData.report_type} onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                  <SelectItem value="H1">H1</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscal-year">Fiscal Year</Label>
              <Input
                id="fiscal-year"
                type="number"
                min="2020"
                max="2030"
                value={formData.fiscal_year}
                onChange={(e) => setFormData(prev => ({ ...prev, fiscal_year: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this report..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
