
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, FileText, BarChart3 } from 'lucide-react';

interface PDFTextPreviewProps {
  extractedText: string;
  fileName: string;
  onApprove: (text: string) => void;
  onReject: () => void;
  isLoading?: boolean;
}

const PDFTextPreview: React.FC<PDFTextPreviewProps> = ({
  extractedText,
  fileName,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const wordCount = extractedText.split(/\s+/).length;
  const hasNumbers = /\d/.test(extractedText);
  const hasFinancialTerms = /\b(omsättning|resultat|vinst|förlust|mkr|msek|miljoner|kvartal|procent|tillväxt)\b/gi.test(extractedText);
  
  // Quality assessment
  const getQualityScore = () => {
    let score = 0;
    if (extractedText.length > 500) score += 2;
    if (wordCount > 50) score += 2;
    if (hasNumbers) score += 2;
    if (hasFinancialTerms) score += 2;
    if (extractedText.length > 1000) score += 1;
    if (wordCount > 100) score += 1;
    return score;
  };

  const qualityScore = getQualityScore();
  const maxScore = 10;
  
  const getQualityLevel = () => {
    if (qualityScore >= 8) return { level: 'Utmärkt', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (qualityScore >= 6) return { level: 'Bra', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
    if (qualityScore >= 4) return { level: 'Godkänd', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle };
    return { level: 'Låg kvalitet', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
  };

  const quality = getQualityLevel();
  const QualityIcon = quality.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Extraherad text från {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{extractedText.length}</div>
              <div className="text-sm text-gray-600">Tecken</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{wordCount}</div>
              <div className="text-sm text-gray-600">Ord</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{hasNumbers ? '✓' : '✗'}</div>
              <div className="text-sm text-gray-600">Siffror</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{hasFinancialTerms ? '✓' : '✗'}</div>
              <div className="text-sm text-gray-600">Finanstermer</div>
            </div>
          </div>

          {/* Quality assessment */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <QualityIcon className="w-6 h-6" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Textkvalitet:</span>
                <Badge className={quality.color}>{quality.level}</Badge>
                <span className="text-sm text-gray-600">({qualityScore}/{maxScore} poäng)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(qualityScore / maxScore) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quality warnings */}
          {qualityScore < 6 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Kvalitetsvarning</span>
              </div>
              <div className="text-sm text-yellow-700 space-y-1">
                {extractedText.length < 500 && <div>• Texten är för kort (behöver minst 500 tecken)</div>}
                {wordCount < 50 && <div>• För få ord hittades</div>}
                {!hasNumbers && <div>• Inga siffror hittades i texten</div>}
                {!hasFinancialTerms && <div>• Inga finansiella termer hittades</div>}
                <div className="mt-2 font-medium">Rekommendation: Ladda upp en PDF med tydligare text eller fler finansiella data.</div>
              </div>
            </div>
          )}

          {/* Text preview */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Förhandsvisning av extraherad text (kan redigeras vid behov):
            </label>
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[300px] font-mono text-sm"
              placeholder="Extraherad text kommer att visas här..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Denna text kommer att skickas till AI:n för att generera manus
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => onApprove(extractedText)}
              disabled={isLoading || extractedText.length < 100}
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isLoading ? 'Genererar manus...' : 'Godkänn och skapa manus'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onReject}
              disabled={isLoading}
            >
              Ladda upp ny PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTextPreview;
