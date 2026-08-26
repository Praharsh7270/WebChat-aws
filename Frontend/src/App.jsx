import './App.css'
import { useAuth } from '@clerk/clerk-react'
import { ThemeProvider } from './Context/ThemeContext'
import { WallpaperProvider } from './Context/WallpaperContext'
import { Navigate, Route, Routes } from 'react-router'
import ChatPage from './Pages/ChatPage'
import AuthPage from './Pages/AuthPage'
import PageLoader from './Components/PageLoader'
import { useAuthStore } from './Store/UseAuthStore.js'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() =>{
    if(!isLoaded) return;

    if(isSignedIn) checkAuth();
    else clearAuth();
  }, [isLoaded, isSignedIn, checkAuth, clearAuth]);


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
