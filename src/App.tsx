import { AnimatePresence, motion } from 'motion/react'
import { ThemeProvider } from './hooks/useTheme'
import { HarProvider, useHar } from './hooks/useHar'
import { Landing } from './components/landing/Landing'
import { Workspace } from './components/Workspace'

function Shell() {
  const { entries } = useHar()
  const inWorkspace = entries.length > 0

  return (
    <div className="grain-bg mesh-bg min-h-[100dvh] text-foreground">
      <AnimatePresence mode="wait">
        {inWorkspace ? (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          >
            <Workspace />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Landing />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HarProvider>
        <Shell />
      </HarProvider>
    </ThemeProvider>
  )
}
