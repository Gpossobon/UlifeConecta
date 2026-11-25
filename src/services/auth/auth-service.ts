import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";

export type AuthAction = "sign-in" | "sign-up" | "reset-password";

export function observeAuthState(
  auth: Auth,
  onUser: (user: User | null) => void,
  onError: (error: Error) => void,
) {
  return onAuthStateChanged(auth, onUser, onError);
}

export async function signOutUser(auth: Auth) {
  await signOut(auth);
}

export async function performAuthAction(
  auth: Auth,
  action: AuthAction,
  values: { email: string; password: string; name: string },
) {
  await setPersistence(auth, browserLocalPersistence);
  const email = values.email.trim();

  if (action === "sign-up") {
    const credential = await createUserWithEmailAndPassword(auth, email, values.password);
    if (values.name.trim()) {
      await updateProfile(credential.user, { displayName: values.name.trim() });
    }
    return;
  }

  if (action === "reset-password") {
    await sendPasswordResetEmail(auth, email);
    return;
  }

  await signInWithEmailAndPassword(auth, email, values.password);
}
