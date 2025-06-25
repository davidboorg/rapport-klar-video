
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, FileText, BarChart3, RefreshCw, AlertCircle, Eye, Edit3 } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
  const hasNumbers = /\d/.test(extractedText);
  const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
  const hasFinancialTerms = /\b(omsättning|intäkter|resultat|vinst|förlust|mkr|msek|miljoner|kvartal|procent|tillväxt|revenue|profit|growth|EBITDA|EBIT)\b/gi.test(extractedText);
  
  // Enhanced quality assessment
  const getQualityScore = () => {
    let score = 0;
    if (extractedText.length > 500) score += 2;
    if (wordCount > 50) score += 2;
    if (hasNumbers) score += 2;
    if (hasFinancialTerms) score += 3; // Höger vikt för finansiella termer
    if (hasSwedishChars) score += 1;
    if (extractedText.length > 1000) score += 1;
    
    // Penalize for potential garbage text
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    if (alphaRatio < 0.5) score -= 2; // Penalty for low alphabetic ratio
    if (alphaRatio < 0.3) score -= 4; // Heavy penalty for garbage text
    
    return Math.max(0, score);
  };

  const qualityScore = getQualityScore();
  const maxScore = 11;
  
  const getQualityLevel = () => {
    if (qualityScore >= 9) return { level: 'Utmärkt', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (qualityScore >= 7) return { level: 'Mycket bra', color: 'bg-green-100 text-green-600', icon: CheckCircle };
    if (qualityScore >= 5) return { level: 'Bra', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
    if (qualityScore >= 3) return { level: 'Godkänd', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle };
    if (qualityScore >= 1) return { level: 'Låg kvalitet', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
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

  // Identifiera specifika problem med texten
  const getTextIssues = () => {
    const issues = [];
    
    if (extractedText.length < 100) {
      issues.push('Texten är mycket kort - kan vara en bildbaserad PDF');
    }
    
    if (wordCount < 20) {
      issues.push('För få ord hittades - PDF:en kan innehålla huvudsakligen bilder');
    }
    
    if (!hasNumbers && extractedText.length > 200) {
      issues.push('Inga siffror hittades - oväntat för en finansiell rapport');
    }
    
    if (!hasFinancialTerms && extractedText.length > 300) {
      issues.push('Inga finansiella termer identifierades');
    }
    
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    if (alphaRatio < 0.5) {
      issues.push('Hög andel specialtecken - kan indikera encoding-problem');
    }
    
    return issues;
  };

  const textIssues = getTextIssues();

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
                    qualityScore >= 7 ? 'bg-green-600' : 
                    qualityScore >= 5 ? 'bg-blue-600' :
                    qualityScore >= 3 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min((qualityScore / maxScore) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Issues and warnings */}
          {textIssues.length > 0 && (
            <div className={`p-4 rounded-lg border ${isGarbage ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`w-5 h-5 ${isGarbage ? 'text-red-600' : 'text-yellow-600'}`} />
                <span className={`font-medium ${isGarbage ? 'text-red-800' : 'text-yellow-800'}`}>
                  {isGarbage ? 'Kritiska problem upptäckta' : 'Kvalitetsvarningar'}
                </span>
              </div>
              <div className={`text-sm ${isGarbage ? 'text-red-700' : 'text-yellow-700'} space-y-1`}>
                {textIssues.map((issue, index) => (
                  <div key={index}>• {issue}</div>
                ))}
                {isGarbage && (
                  <div className="mt-2 font-medium">
                    Rekommendation: Ladda upp en textbaserad PDF eller kontrollera att PDF:en innehåller läsbar text.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extraction success info */}
          {qualityScore >= 7 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Utmärkt textextraktion!</span>
              </div>
              <div className="text-sm text-green-700">
                Texten har extraherat med hög kvalitet och innehåller finansiella data som är lämplig för AI-analys.
              </div>
            </div>
          )}

          {/* Text preview with editing capability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                {isEditing ? 'Redigera extraherad text:' : 'Förhandsvisning av extraherad text:'}
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1"
              >
                {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Visa' : 'Redigera'}
              </Button>
            </div>
            
            {isEditing ? (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Extraherad text kommer att visas här..."
              />
            ) : (
              <div className="min-h-[300px] p-3 bg-gray-50 border rounded-md font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                {extractedText || 'Ingen text extraherad än...'}
              </div>
            )}
            
            {isEditing && (
              <div className="text-xs text-gray-500 mt-1">
                Du kan redigera texten ovan innan den skickas till AI:n för manusgenerering
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => onApprove(isEditing ? editedText : extractedText)}
              disabled={isLoading || (isEditing ? editedText.length < 50 : extractedText.length < 50)}
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
            <strong>Tips för bästa resultat:</strong> Använd textbaserade PDF:er (exporterade från Word, Google Docs, etc.) 
            istället för inskannade dokument. Finansiella rapporter med tydlig struktur och siffror ger bäst resultat.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTextPreview;
