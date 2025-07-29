import { useState, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall, isPWAInstalled } from "@/lib/pwaUtils";
import { Card, CardContent } from "@/components/ui/card";

export default function PWAInstallButton() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { canInstall, install, dismiss } = usePWAInstall();

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    
    const handleInstallAvailable = () => {
      if (!isInstalled) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    try {
      await install();
      setShowPrompt(false);
      setIsInstalled(true);
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !canInstall) {
    return null;
  }

  return (
    <Card className="pwa-install-prompt fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 shadow-lg border-purple-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-white" size={24} />
            <div>
              <p className="font-semibold text-sm text-white">Install AI Bot Hub</p>
              <p className="text-xs text-gray-200">Pin this app to your home screen</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleInstall}
              size="sm"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs"
            >
              <Download size={12} className="mr-1" />
              Install
            </Button>
            <Button 
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-20 text-xs"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
