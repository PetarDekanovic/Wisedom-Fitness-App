import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// Jitsi Meet External API typings
export interface JitsiMeetAPI {
  dispose: () => void;
  addEventListener: (event: string, callback: (data: any) => void) => void;
  removeEventListener: (event: string, callback: (data: any) => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
}

export interface JitsiMeetProps {
  /**
   * The name of the room to join. Must be unique for the meeting session.
   */
  roomName: string;
  /**
   * The display name of the local participant inside the meeting room.
   */
  displayName?: string;
  /**
   * The email of the local participant (used for gravatar or identification).
   */
  email?: string;
  /**
   * The meeting subject (displayed at the top of the meeting interface).
   */
  subject?: string;
  /**
   * JSON Web Token (JWT) for authentication (optional, used in some Jitsi deployments).
   */
  jwt?: string;
  /**
   * Overwrite Jitsi configuration parameters.
   */
  configOverwrite?: Record<string, any>;
  /**
   * Overwrite Jitsi UI interface configuration parameters.
   */
  interfaceConfigOverwrite?: Record<string, any>;
  /**
   * Callback fired when the Jitsi IFrame API has loaded and initialized successfully.
   */
  onApiReady?: (api: JitsiMeetAPI) => void;
  /**
   * Callback fired when a participant joins the conference.
   */
  onVideoConferenceJoined?: (participant: { id: string; displayName: string }) => void;
  /**
   * Callback fired when the local participant leaves the conference.
   */
  onVideoConferenceLeft?: () => void;
  /**
   * Callback fired when the Jitsi meeting signals it is ready to close/hang up.
   */
  onReadyToClose?: () => void;
  /**
   * Callback fired when the local audio mute status changes.
   */
  onAudioMuteStatusChanged?: (data: { muted: boolean }) => void;
  /**
   * Callback fired when the local video mute status changes.
   */
  onVideoMuteStatusChanged?: (data: { muted: boolean }) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        roomName: string;
        width?: string | number;
        height?: string | number;
        parentNode: HTMLElement;
        configOverwrite?: Record<string, any>;
        interfaceConfigOverwrite?: Record<string, any>;
        jwt?: string;
        userInfo?: {
          displayName?: string;
          email?: string;
        };
      }
    ) => JitsiMeetAPI;
  }
}

const JITSI_SCRIPT_URL = 'https://meet.jit.si/external_api.js';
const JITSI_DOMAIN = 'meet.jit.si';

/**
 * JitsiMeet component embeds the official Jitsi Meet WebRTC platform
 * using the Jitsi Meet IFrame API.
 * 
 * Note: Browser security policies require an HTTPS connection (or localhost)
 * to successfully acquire permissions for camera and microphone media devices.
 */
export const JitsiMeet: React.FC<JitsiMeetProps> = ({
  roomName,
  displayName,
  email,
  subject,
  jwt,
  configOverwrite = {},
  interfaceConfigOverwrite = {},
  onApiReady,
  onVideoConferenceJoined,
  onVideoConferenceLeft,
  onReadyToClose,
  onAudioMuteStatusChanged,
  onVideoMuteStatusChanged,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetAPI | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [scriptError, setScriptError] = useState<boolean>(false);

  // 1. Dynamic Script Loader with deduplication
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    // Check if the script is already being injected by another component
    const existingScript = document.querySelector(`script[src="${JITSI_SCRIPT_URL}"]`);
    if (existingScript) {
      const handleLoad = () => setScriptLoaded(true);
      const handleError = () => setScriptError(true);

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    // Otherwise, create and append a new script element
    const script = document.createElement('script');
    script.src = JITSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);

    document.body.appendChild(script);

    return () => {
      // In a production application, we don't necessarily want to remove the script from the body
      // on unmount to cache it for subsequent uses, but we do clean up any event listeners.
    };
  }, []);

  // 2. Initialize Jitsi Meet IFrame API instance when script is loaded and container is available
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.JitsiMeetExternalAPI) return;

    // Clean up any existing instances just in case
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }

    // Prepare default configuration overrides for clean, premium appearance
    const mergedConfigOverwrite = {
      startWithAudioMuted: true, // Start muted for a polite entrance
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false, // Bypass prejoin page to jump straight to wisdom-sharing
      disableDeepLinking: true, // Prevent prompting mobile users to download native apps
      toolbarButtons: [
        'camera',
        'microphone',
        'fullscreen',
        'hangup',
        'chat',
        'toggle-camera',
        'videoquality',
        'select-background'
      ],
      ...configOverwrite,
    };

    const mergedInterfaceConfigOverwrite = {
      SHOW_JITSI_WATERMARK: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND: '#09090b', // Deep zinc/black color for premium zen aesthetic
      ...interfaceConfigOverwrite,
    };

    try {
      const options = {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        configOverwrite: mergedConfigOverwrite,
        interfaceConfigOverwrite: mergedInterfaceConfigOverwrite,
        jwt,
        userInfo: {
          displayName,
          email,
        },
      };

      // Create new external Jitsi Meet API instance
      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
      apiRef.current = api;

      // Programmatically set subject once meeting is loaded
      if (subject) {
        api.executeCommand('subject', subject);
      }

      // 3. Register Event Listeners
      const joinedHandler = (data: any) => {
        if (onVideoConferenceJoined) onVideoConferenceJoined(data);
      };

      const leftHandler = () => {
        if (onVideoConferenceLeft) onVideoConferenceLeft();
      };

      const closeHandler = () => {
        if (onReadyToClose) onReadyToClose();
      };

      const audioMuteHandler = (data: any) => {
        if (onAudioMuteStatusChanged) onAudioMuteStatusChanged(data);
      };

      const videoMuteHandler = (data: any) => {
        if (onVideoMuteStatusChanged) onVideoMuteStatusChanged(data);
      };

      api.addEventListener('videoConferenceJoined', joinedHandler);
      api.addEventListener('videoConferenceLeft', leftHandler);
      api.addEventListener('readyToClose', closeHandler);
      api.addEventListener('audioMuteStatusChanged', audioMuteHandler);
      api.addEventListener('videoMuteStatusChanged', videoMuteHandler);

      // Pass the API instance up if requested
      if (onApiReady) {
        onApiReady(api);
      }

      // Cleanup function to dispose of iframe API and clear memory/RTC connections
      return () => {
        if (apiRef.current) {
          apiRef.current.removeEventListener('videoConferenceJoined', joinedHandler);
          apiRef.current.removeEventListener('videoConferenceLeft', leftHandler);
          apiRef.current.removeEventListener('readyToClose', closeHandler);
          apiRef.current.removeEventListener('audioMuteStatusChanged', audioMuteHandler);
          apiRef.current.removeEventListener('videoMuteStatusChanged', videoMuteHandler);
          apiRef.current.dispose();
          apiRef.current = null;
        }
      };
    } catch (err) {
      console.error('Failed to initialize Jitsi Meet External API:', err);
      setScriptError(true);
    }
  }, [
    scriptLoaded,
    roomName,
    displayName,
    email,
    subject,
    jwt,
    configOverwrite,
    interfaceConfigOverwrite,
    onApiReady,
    onVideoConferenceJoined,
    onVideoConferenceLeft,
    onReadyToClose,
    onAudioMuteStatusChanged,
    onVideoMuteStatusChanged,
  ]);

  if (scriptError) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/5 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <h4 className="text-sm font-black uppercase tracking-wider text-red-500">Transmission Error</h4>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          Could not establish connection with Jitsi Media Server. Check your internet connectivity or try again.
        </p>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-zinc-950/20 rounded-3xl text-center space-y-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading Sanctuary Room</h4>
        <p className="text-[10px] text-zinc-500 max-w-xs">
          Calibrating secure audio-visual alignment, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800">
      {/* 
        This is the iframe parent container. Dimensions are fully fluid (100% width and height).
        Always ensure camera/microphone permissions are allowed in frame configuration.
      */}
      <div 
        ref={containerRef} 
        id="jitsi-container" 
        className="w-full h-full flex-1"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};
