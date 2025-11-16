const config = {
  appId: 'com.caravanshare.app',
  appName: 'CaravanShare',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    /**
     * 개발 중에는 Vite dev 서버에 붙어서 빠르게 확인할 수 있습니다.
     * 실제 배포 빌드에서는 이 값을 제거하거나 주석 처리한 뒤
     * `npm run build:pwa` + `npm run cap:sync`로 번들 자산을 포함하세요.
     */
    url: 'http://localhost:5173',
    cleartext: true,
  },
}

export default config

