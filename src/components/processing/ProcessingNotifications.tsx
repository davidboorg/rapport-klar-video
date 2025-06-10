
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface ProcessingNotificationsProps {
  projectId: string;
  isProcessing: boolean;
  currentStep?: string;
  progress: number;
}

const ProcessingNotifications: React.FC<ProcessingNotificationsProps> = ({
  projectId,
  isProcessing,
  currentStep,
  progress
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if browser supports notifications
    setBrowserSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Load notification preference
    const enabled = localStorage.getItem(`notifications_${projectId}`) === 'true';
    setNotificationsEnabled(enabled);
  }, [projectId]);

  const requestNotificationPermission = async () => {
    if (!browserSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem(`notifications_${projectId}`, 'true');
        
        toast.success('Notifications enabled!', {
          description: 'You\'ll receive updates when processing completes.'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const toggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem(`notifications_${projectId}`, enabled.toString());
    
    if (enabled && permission !== 'granted') {
      requestNotificationPermission();
    } else {
      toast.info(enabled ? 'Notifications enabled' : 'Notifications disabled');
    }
  };

  // Send browser notification
  const sendNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (!notificationsEnabled || permission !== 'granted' || document.hasFocus()) {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `processing_${projectId}`,
        requireInteraction: true,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Monitor processing progress for notifications
  useEffect(() => {
    if (!isProcessing || !notificationsEnabled) return;

    // Send notification for major milestones
    if (progress === 25) {
      sendNotification('Processing Update', 'Report analysis 25% complete');
    } else if (progress === 50) {
      sendNotification('Processing Update', 'Video generation 50% complete');
    } else if (progress === 75) {
      sendNotification('Processing Update', 'Almost done! 75% complete');
    } else if (progress === 100) {
      sendNotification('Processing Complete!', 'Your video is ready for viewing', {
        requireInteraction: true
      });
    }
  }, [progress, isProcessing, notificationsEnabled, projectId]);

  if (!browserSupported) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {notificationsEnabled ? (
            <Bell className="w-4 h-4 text-blue-600" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Browser Notifications</p>
            <p className="text-xs text-gray-600">
              Get notified when processing completes
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={toggleNotifications}
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {permission === 'default' && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            className="w-full"
          >
            Enable Notifications
          </Button>
        )}

        <div className="space-y-2 text-xs text-gray-600">
          <p>• Milestone progress updates</p>
          <p>• Completion notifications</p>
          <p>• Error alerts</p>
          <p>• Only when tab is inactive</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingNotifications;
