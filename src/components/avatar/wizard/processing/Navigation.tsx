
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isCompleted: boolean;
  isProcessing: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onNext, 
  onPrevious, 
  isCompleted, 
  isProcessing 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between pt-4">
      <Button variant="outline" onClick={onPrevious} disabled={isProcessing}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Föregående
      </Button>
      
      {isCompleted ? (
        <div className="space-x-2">
          <Button onClick={() => navigate('/projects')} variant="outline">
            Skapa Rapport
          </Button>
          <Button onClick={onNext} size="lg">
            Fortsätt till Röst
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onNext}
          disabled={!isCompleted}
          size="lg"
        >
          Fortsätt till Röst
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
