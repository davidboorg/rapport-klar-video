
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Avatar } from '../types';
import { useNavigate } from 'react-router-dom';

interface CompletionPreviewProps {
  avatar: Avatar;
  avatarName: string;
}

export const CompletionPreview: React.FC<CompletionPreviewProps> = ({ 
  avatar,
  avatarName,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Avatar Skapad!</h4>
                <p className="text-sm text-green-700">
                  "{avatarName}" är nu tillgänglig i ditt avatar-bibliotek
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/avatars')} variant="outline" className="border-green-300">
              Visa Avatar
            </Button>
          </div>

          {/* Next Steps */}
          <div className="border-t border-green-200 pt-4">
            <h5 className="font-medium text-green-900 mb-2">Nästa steg:</h5>
            <div className="text-sm text-green-700 space-y-1">
              <p>✓ Avatar skapad och sparad</p>
              <p>→ Ladda upp din kvartalsrapport för att skapa en personlig video</p>
            </div>
            <Button 
              onClick={() => navigate('/projects')} 
              className="mt-3 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              Skapa Kvartalsrapport
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
