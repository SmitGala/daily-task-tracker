interface FirebaseErrorLike {
  code?: string
  message?: string
}

export function isIgnorableRedirectError(err: unknown): boolean {
  const code = (err as FirebaseErrorLike)?.code
  return (
    code === 'auth/no-auth-event' ||
    code === 'auth/redirect-cancelled-by-user' ||
    code === 'auth/cancelled-popup-request'
  )
}

export function getAuthErrorMessage(err: unknown): string {
  const code = (err as FirebaseErrorLike)?.code
  const message = (err as FirebaseErrorLike)?.message

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This site is not authorized in Firebase. Add your Netlify domain under Authentication → Settings → Authorized domains.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Try email/password login instead.'
    case 'auth/redirect-operation-pending':
      return 'Sign-in is already in progress. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.'
    case 'auth/missing-or-invalid-nonce':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
      return 'Wrong email or password. Please try again.'
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'
    default:
      return message ?? 'Failed to sign in. Please try again.'
  }
}
