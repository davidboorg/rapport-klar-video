
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Clock, CheckCircle } from 'lucide-react';

export const TechnicalDetails: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vad händer bakom kulisserna?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center space-y-2">
            <Upload className="h-8 w-8 text-blue-600 mx-auto" />
            <h4 className="font-medium">Säker Upload</h4>
            <p className="text-xs text-muted-foreground">
              Din video krypteras och laddas upp säkert till våra servrar
            </p>
          </div>
          <div className="text-center space-y-2">
            <Clock className="h-8 w-8 text-orange-600 mx-auto" />
            <h4 className="font-medium">AI-bearbetning</h4>
            <p className="text-xs text-muted-foreground">
              Avancerad AI analyserar ditt utseende och rörelser
            </p>
          </div>
          <div className="text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
            <h4 className="font-medium">Kvalitetskontroll</h4>
            <p className="text-xs text-muted-foreground">
              Automatisk kvalitetskontroll för professionella resultat
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
