import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'
import { isIOS, isIOSStandalone } from '@/utils/device'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function upsertUserProfile(user: User, displayName?: string) {
  const userRef = doc(db, 'users', user.uid)
  const existing = await getDoc(userRef)

  await setDoc(
    userRef,
    {
      email: user.email,
      displayName: displayName ?? user.displayName ?? 'User',
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
}

async function safeUpsertUserProfile(user: User, displayName?: string) {
  try {
    await upsertUserProfile(user, displayName)
  } catch (err) {
    console.error('Could not save user profile (login still succeeded):', err)
  }
}

export async function setAuthPersistence(rememberMe: boolean) {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence,
  )
}

/** Only iOS needs redirect — popup works on Chrome desktop & Android. */
export function shouldUseGoogleRedirect(): boolean {
  return isIOSStandalone() || isIOS()
}

export async function completeRedirectSignIn() {
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      await safeUpsertUserProfile(result.user)
    }
    return result
  } catch {
    return null
  }
}

export async function signInWithGoogle(rememberMe: boolean) {
  await setAuthPersistence(rememberMe)

  if (shouldUseGoogleRedirect()) {
    await signInWithRedirect(auth, googleProvider)
    return null
  }

  const result = await signInWithPopup(auth, googleProvider)
  await safeUpsertUserProfile(result.user)
  return result
}

export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  await setAuthPersistence(rememberMe)
  const result = await signInWithEmailAndPassword(auth, email.trim(), password)
  await safeUpsertUserProfile(result.user)
  return result
}

export async function registerWithEmail(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  await setAuthPersistence(rememberMe)
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const name = email.split('@')[0] || 'User'
  await updateProfile(result.user, { displayName: name })
  await safeUpsertUserProfile(result.user, name)
  return result
}

export async function logOut() {
  await signOut(auth)
}
