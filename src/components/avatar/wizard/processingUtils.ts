
import { ProcessingPhase } from './types';
import { ReactNode } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const formatTimeRemaining = (minutes: number): string => {
  if (minutes === 0) return 'Färdig!';
  if (minutes < 1) return 'Mindre än 1 minut kvar';
  return `${minutes} ${minutes === 1 ? 'minut' : 'minuter'} kvar`;
};

export const getPhaseIcon = (currentPhase: ProcessingPhase): ReactNode => {
  switch (currentPhase) {
    case 'uploading':
      return <Upload className="h-6 w-6 text-blue-600 animate-pulse" />;
    case 'processing':
      return <Clock className="h-6 w-6 text-orange-600 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-6 w-6 text-red-600" />;
  }
};

export const getPhaseTitle = (currentPhase: ProcessingPhase): string => {
  switch (currentPhase) {
    case 'uploading':
      return 'Laddar upp video...';
    case 'processing':
      return 'Skapar din avatar...';
    case 'completed':
      return 'Avatar skapad!';
    case 'error':
      return 'Ett fel uppstod';
  }
};

export const getPhaseDescription = (currentPhase: ProcessingPhase, estimatedTimeRemaining: number): string => {
  switch (currentPhase) {
    case 'uploading':
      return 'Din video laddas upp säkert till våra servrar';
    case 'processing':
      return `AI-modellen analyserar och skapar din avatar. Beräknad tid kvar: ${estimatedTimeRemaining} ${estimatedTimeRemaining === 1 ? 'minut' : 'minuter'}`;
    case 'completed':
      return 'Din professionella avatar är nu redo och sparad i ditt avatar-bibliotek';
    case 'error':
      return 'Kontakta support om problemet kvarstår';
  }
};
