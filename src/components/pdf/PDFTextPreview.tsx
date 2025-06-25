
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, FileText, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [editedText, setEditedText] = useState(extractedText);
  
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
  const hasNumbers = /\d/.test(extractedText);
  const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
  const hasFinancialTerms = /\b(omsättning|resultat|vinst|förlust|mkr|msek|miljoner|kvartal|procent|tillväxt|revenue|profit|growth)\b/gi.test(extractedText);
  
  // Enhanced quality assessment
  const getQualityScore = () => {
    let score = 0;
    if (extractedText.length > 500) score += 2;
    if (wordCount > 50) score += 2;
    if (hasNumbers) score += 2;
    if (hasFinancialTerms) score += 2;
    if (hasSwedishChars) score += 1; // Bonus for Swedish content
    if (extractedText.length > 1000) score += 1;
    
    // Penalize for potential garbage text
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    if (alphaRatio < 0.5) score -= 3; // Penalty for low alphabetic ratio
    if (alphaRatio < 0.3) score -= 5; // Heavy penalty for garbage text
    
    return Math.max(0, score);
  };

  const qualityScore = getQualityScore();
  const maxScore = 10;
  
  const getQualityLevel = () => {
    if (qualityScore >= 8) return { level: 'Utmärkt', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (qualityScore >= 6) return { level: 'Bra', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
    if (qualityScore >= 4) return { level: 'Godkänd', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle };
    if (qualityScore >= 2) return { level: 'Låg kvalitet', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    return { level: 'Mycket dålig', color: 'bg-red-100 text-red-700', icon: AlertCircle };
  };

  const quality = getQualityLevel();
  const QualityIcon = quality.icon;
  
  // Check for potential garbage text
  const isPotentialGarbage = () => {
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    return alphaRatio < 0.4 || wordCount < 20;
  };

  const isGarbage = isPotentialGarbage();

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{extractedText.length}</div>
              <div className="text-sm text-gray-600">Tecken</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{wordCount}</div>
              <div className="text-sm text-gray-600">Ord</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                {hasNumbers ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Siffror</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${hasFinancialTerms ? 'text-green-600' : 'text-red-600'}`}>
                {hasFinancialTerms ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Finanstermer</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${hasSwedishChars ? 'text-green-600' : 'text-gray-400'}`}>
                {hasSwedishChars ? '✓' : '—'}
              </div>
              <div className="text-sm text-gray-600">Svenska tecken</div>
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
                  className={`h-2 rounded-full transition-all duration-300 ${
                    qualityScore >= 6 ? 'bg-green-600' : 
                    qualityScore >= 4 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min((qualityScore / maxScore) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Garbage text warning */}
          {isGarbage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Potentiellt trasig text upptäckt</span>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                <div>• Texten innehåller för många specialtecken eller slumpmässiga tecken</div>
                <div>• Detta kan bero på encoding-problem eller att PDF:en innehåller huvudsakligen bilder</div>
                <div className="mt-2 font-medium">
                  Rekommendation: Ladda upp en textbaserad PDF eller en PDF med bättre textkvalitet.
                </div>
              </div>
            </div>
          )}

          {/* Quality warnings */}
          {qualityScore < 6 && !isGarbage && (
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
                <div className="mt-2 font-medium">
                  Du kan fortfarande försöka generera manus, men resultatet kan bli sämre.
                </div>
              </div>
            </div>
          )}

          {/* Text preview with editing capability */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Förhandsvisning av extraherad text (kan redigeras vid behov):
            </label>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Extraherad text kommer att visas här..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Du kan redigera texten ovan innan den skickas till AI:n för manusgenerering
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => onApprove(editedText)}
              disabled={isLoading || editedText.length < 50}
              className="flex-1"
              variant={isGarbage ? "destructive" : "default"}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isLoading ? 'Genererar manus...' : 
               isGarbage ? 'Försök ändå (ej rekommenderat)' : 
               'Godkänn och skapa manus'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onReject}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Ladda upp ny PDF
            </Button>
          </div>

          {/* Help text */}
          <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded">
            <strong>Tips:</strong> För bästa resultat, använd textbaserade PDF:er (exporterade från Word, Google Docs, etc.) 
            istället för inskannade dokument eller PDF:er med mycket grafik.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTextPreview;
