
export interface Avatar {
  id: string;
  user_id: string;
  heygen_avatar_id: string | null;
  name: string;
  status: string;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WizardData {
  avatarName?: string;
  avatarId?: string;
  videoFile?: File;
  voiceSettings?: object;
  customizations?: object;
}

export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
}

export type ProcessingPhase = 'uploading' | 'processing' | 'completed' | 'error';
