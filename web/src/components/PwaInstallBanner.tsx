import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt'

export default function PwaInstallBanner() {
  const { isInstallable, promptInstall } = usePwaInstallPrompt()

  if (!isInstallable) return null

  return (
    <div className="bg-[#0F766E] text-white text-sm px-4 py-2 flex items-center justify-between shadow-md">
      <span>CaravanShare를 앱으로 설치하면 더 편리하게 사용할 수 있어요.</span>
      <button
        type="button"
        className="ml-4 px-3 py-1.5 rounded-full bg-white text-[#0F766E] text-xs sm:text-sm font-medium hover:bg-teal-50 transition-colors shadow-sm"
        onClick={() => { void promptInstall() }}
      >
        앱 설치하기
      </button>
    </div>
  )
}
