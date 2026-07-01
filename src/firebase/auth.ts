import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'
import { shouldUseAuthRedirect } from '@/utils/device'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function upsertUserProfile(user: User) {
  const userRef = doc(db, 'users', user.uid)
  const existing = await getDoc(userRef)

  await setDoc(
    userRef,
    {
      email: user.email,
      displayName: user.displayName ?? 'User',
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
}

export async function setAuthPersistence(rememberMe: boolean) {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence,
  )
}

export async function completeRedirectSignIn() {
  const result = await getRedirectResult(auth)
  if (result?.user) {
    await upsertUserProfile(result.user)
  }
  return result
}

export async function signInWithGoogle(rememberMe: boolean) {
  await setAuthPersistence(rememberMe)

  if (shouldUseAuthRedirect()) {
    await signInWithRedirect(auth, googleProvider)
    return null
  }

  const result = await signInWithPopup(auth, googleProvider)
  await upsertUserProfile(result.user)
  return result
}

export async function logOut() {
  await signOut(auth)
}

export { shouldUseAuthRedirect }
