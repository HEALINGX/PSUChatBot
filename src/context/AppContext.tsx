import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

interface AppProviderProps {
  children: ReactNode
}

type ThemeMode = 'light' | 'dark'

type AppContextType = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default function AppProvider({ children }: AppProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('theme-mode')
    return savedMode === 'dark' ? 'dark' : 'light'
  })

  const setMode = (mode: ThemeMode) => {
    setThemeMode(mode)
    localStorage.setItem('theme-mode', mode)
  }

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', next)
      return next
    })
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
        },
      }),
    [themeMode],
  )

  return (
    <AppContext.Provider value={{ themeMode, setThemeMode: setMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}