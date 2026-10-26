import './App.css'
import { useAuth } from '@clerk/clerk-react'
import { ThemeProvider } from './Context/ThemeContext'
import { WallpaperProvider } from './Context/WallpaperContext'
import { Navigate, Route, Routes } from 'react-router'
import ChatPage from './Pages/ChatPage'
import AuthPage from './Pages/AuthPage'
import PageLoader from './Components/PageLoader'
import { useAuthStore } from './Store/UseAuthStore.js'
import { useChatStore } from './Store/UseChatStore.js'
import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const socket = useAuthStore((state) => state.socket);
  const getConversations = useChatStore((state) => state.getConversations);

  useEffect(() =>{
    if(!isLoaded) return;

    if(isSignedIn) checkAuth();
    else clearAuth();
  }, [isLoaded, isSignedIn, checkAuth, clearAuth]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleEmergencyAlert = (alert) => {
      const senderName = alert.senderName || 'A member';
      const message = alert.text || 'An emergency alert was sent.';
      const hasLocation = Number.isFinite(alert.location?.latitude) &&
        Number.isFinite(alert.location?.longitude);
      const mapUrl = hasLocation
        ? `https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`
        : null;

      toast.custom((notification) => (
        <div
          role="status"
          className="relative w-[min(92vw,24rem)] rounded-2xl border border-red-500/40 bg-background p-4 text-foreground shadow-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-red-500">Emergency SOS from {senderName}</p>
          <p className="mt-1 text-sm">{message}</p>
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Open shared location
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => toast.dismiss(notification.id)}
            className="absolute right-3 top-3 rounded px-2 py-1 text-xs text-muted hover:text-foreground"
            aria-label="Dismiss emergency alert"
          >
            Dismiss
          </button>
        </div>
      ), { duration: 15000, position: 'top-center' });

      getConversations();
    };

    socket.on('emergencyAlert', handleEmergencyAlert);
    return () => socket.off('emergencyAlert', handleEmergencyAlert);
  }, [socket, getConversations]);


  if (!isLoaded || (isSignedIn && isCheckingAuth)) {
    return <PageLoader/>;
  }

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route
            path="/"
            element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} />} />
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
