// register PWA service worker
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm('새 버전의 CaravanShare가 준비되었습니다. 지금 새로고침할까요?')) {
      window.location.reload()
    }
  },
})
