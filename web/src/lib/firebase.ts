import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN

let auth: ReturnType<typeof getAuth> | null = null
let googleProvider: GoogleAuthProvider | null = null

if (apiKey && authDomain) {
  const app = initializeApp({ apiKey, authDomain })
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
}

export { auth, googleProvider }

export async function signInWithGooglePopup() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase 미설정: .env의 VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN 필요')
  }
  const cred = await signInWithPopup(auth, googleProvider)
  const idToken = await cred.user.getIdToken()
  return { idToken, user: cred.user }
}
