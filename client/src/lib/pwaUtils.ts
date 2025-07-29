let deferredPrompt: any = null;

export interface PWAInstallPrompt {
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallPrompt {
  const canInstall = deferredPrompt !== null;

  const install = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('PWA install prompt is not available');
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }
    
    deferredPrompt = null;
  };

  const dismiss = (): void => {
    deferredPrompt = null;
  };

  return {
    canInstall,
    install,
    dismiss,
  };
}

// Initialize PWA install prompt listener
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful');
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

export function shareBotURL(botId: string, botName: string): void {
  const url = `${window.location.origin}/chat/${botId}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Chat with ${botName}`,
      text: `Check out this AI chatbot: ${botName}`,
      url: url,
    }).catch(console.error);
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(url).then(() => {
      console.log('Bot URL copied to clipboard');
    }).catch(console.error);
  }
}

export function getEmbedCode(botId: string): string {
  const embedUrl = `${window.location.origin}/embed/${botId}`;
  return `<iframe src="${embedUrl}" width="400" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);"></iframe>`;
}
