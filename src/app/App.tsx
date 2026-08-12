import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'
import { BootScreen } from '@/shared/components/layout/BootScreen'
import { useUiStore } from '@/shared/store/ui-store'

export function App() {
  const alreadyBooted = useUiStore((s) => s.booted)
  const [booting, setBooting] = useState(!alreadyBooted)

  return (
    <Providers>
      {booting && <BootScreen onDone={() => setBooting(false)} />}
      <RouterProvider router={router} />
    </Providers>
  )
}
