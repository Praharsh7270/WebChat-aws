import './App.css'
import { useAuth } from '@clerk/clerk-react'
import { ThemeProvider } from './Context/ThemeContext'
import { WallpaperProvider } from './Context/WallpaperContext'
import { Navigate, Route, Routes } from 'react-router'
import ChatPage from './Pages/ChatPage'
import AuthPage from './Pages/AuthPage'

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/chat"} />} />
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
