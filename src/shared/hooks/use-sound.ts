import { useUiStore } from '@/shared/store/ui-store'
import * as sounds from '@/shared/lib/sounds'

/**
 * Wrapper fino: garante que o toggle do store esteja aplicado mesmo antes da
 * rehidratacao do persist ter rodado.
 */
export function useSound() {
  const enabled = useUiStore((s) => s.sound)

  const guard =
    (fn: () => void) =>
    () => {
      if (enabled) fn()
    }

  return {
    playClick: guard(sounds.playClick),
    playNav: guard(sounds.playNav),
    playCheck: guard(sounds.playCheck),
    playUncheck: guard(sounds.playUncheck),
    playRelapse: guard(sounds.playRelapse),
    playRecord: guard(sounds.playRecord),
  }
}
