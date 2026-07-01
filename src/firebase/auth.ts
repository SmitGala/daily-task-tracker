import {
  GoogleAuthProvider,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  auth,
  browserSessionPersistence,
  db,
  indexedDBLocalPersistence,
} from './config'
import { shouldUseAuthRedirect } from '@/utils/device'
import { getAuthErrorMessage, isIgnorableRedirectError } from '@/utils/authErrors'

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

async function safeUpsertUserProfile(user: User) {
  try {
    await upsertUserProfile(user)
  } catch (err) {
    console.error('Could not save user profile (login still succeeded):', err)
  }
}

export async function setAuthPersistence(rememberMe: boolean) {
  await setPersistence(
    auth,
    rememberMe ? indexedDBLocalPersistence : browserSessionPersistence,
  )
}

export async function completeRedirectSignIn() {
  const result = await getRedirectResult(auth)
  if (result?.user) {
    await safeUpsertUserProfile(result.user)
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
  await safeUpsertUserProfile(result.user)
  return result
}

export async function logOut() {
  await signOut(auth)
}

export { shouldUseAuthRedirect, isIgnorableRedirectError, getAuthErrorMessage }
