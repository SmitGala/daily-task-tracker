import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle(rememberMe: boolean) {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence,
  )
  const result = await signInWithPopup(auth, googleProvider)
  const { user } = result

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

  return result
}

export async function logOut() {
  await signOut(auth)
}
