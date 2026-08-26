import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router'

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.CLERK_PUBLISHABLE_KEY;

function Root() {
  const isValidKey = PUBLISHABLE_KEY && (PUBLISHABLE_KEY.startsWith("pk_test_") || PUBLISHABLE_KEY.startsWith("pk_live_"));

  if (!isValidKey) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#090a0f] p-6 text-white text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Clerk Credentials Required</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            To enable user authentication and messaging, please set <code className="rounded bg-white/10 px-1.5 py-0.5 text-blue-300 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> and <code className="rounded bg-white/10 px-1.5 py-0.5 text-blue-300 font-mono text-xs">CLERK_SECRET_KEY</code> in your environment settings.
          </p>
          {PUBLISHABLE_KEY && (
            <p className="text-xs text-red-400 mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              The provided publishable key is invalid. It must start with &quot;pk_test_&quot; or &quot;pk_live_&quot;.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)