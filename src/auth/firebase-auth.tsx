import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
import { FirebaseError } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { firebaseAuth, firestore, missingFirebaseConfig } from "../lib/firebase";

type AuthMode = "sign-in" | "sign-up" | "reset-password";

type FirebaseAuthContextValue = {
  user: User;
  db: Firestore;
  signOutUser: () => Promise<void>;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth precisa ser usado dentro de FirebaseAuthGate.");
  }
  return context;
}

export function FirebaseAuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    if (!firebaseAuth) {
      setCheckingSession(false);
      return;
    }

    return onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser);
        setSessionError("");
        setCheckingSession(false);
      },
      (error: Error) => {
        setSessionError(error.message);
        setCheckingSession(false);
      },
    );
  }, []);

  const signOutUser = async () => {
    if (!firebaseAuth) {
      setSignOutError("O Firebase não está configurado.");
      return;
    }
    try {
      await signOut(firebaseAuth);
      setSignOutError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível sair da conta.";
      setSignOutError(message);
    }
  };

  if (missingFirebaseConfig.length > 0 || !firebaseAuth || !firestore) {
    return <FirebaseConfigurationNotice missingKeys={missingFirebaseConfig} />;
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <p role="status" className="text-sm text-gray-600">Verificando sessão do Firebase...</p>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <p role="alert" className="max-w-md rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">
          Não foi possível verificar a sessão: {sessionError}
        </p>
      </main>
    );
  }

  if (!user) {
    return <FirebaseAuthScreen auth={firebaseAuth} />;
  }

  return (
    <FirebaseAuthContext.Provider value={{ user, db: firestore, signOutUser }}>
      {signOutError && (
        <p role="alert" className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-md rounded-xl bg-red-700 p-3 text-sm text-white shadow-lg">
          Não foi possível sair da conta: {signOutError}
        </p>
      )}
      {children}
    </FirebaseAuthContext.Provider>
  );
}

function FirebaseConfigurationNotice({ missingKeys }: { missingKeys: string[] }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl text-gray-900">Configure o Firebase</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          O app está sem a configuração local completa. Copie <code>.env.example</code> para <code>.env.local</code>,
          preencha os dados do app Web do Firebase e reinicie o servidor de desenvolvimento.
        </p>
        {missingKeys.length > 0 && (
          <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-gray-500">
            {missingKeys.map((key) => <li key={key}><code>{key}</code></li>)}
          </ul>
        )}
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          Ative também o provedor Email/Senha no Firebase Authentication e publique as regras de segurança do Firestore.
          Não coloque uma chave de conta de serviço no frontend.
        </p>
      </section>
    </main>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
  }

  const messages: Record<string, string> = {
    "auth/invalid-email": "Informe um endereço de email válido.",
    "auth/missing-password": "Informe sua senha.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Este email já possui uma conta.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
    "auth/network-request-failed": "Falha de rede. Verifique sua conexão e tente novamente.",
    "auth/operation-not-allowed": "Ative o provedor Email/Senha no Firebase Authentication.",
    "auth/user-not-found": "Não existe uma conta com este email.",
  };

  return messages[error.code] ?? error.message;
}

function FirebaseAuthScreen({ auth }: { auth: Auth }) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    if (mode === "sign-up") return "Criar conta";
    if (mode === "reset-password") return "Redefinir senha";
    return "Entrar no UlifeConecta";
  }, [mode]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (mode === "sign-up") {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
      } else if (mode === "reset-password") {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMessage("Se houver uma conta com esse email, você receberá instruções para redefinir a senha.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-3 text-xl text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Acesse a comunidade acadêmica.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" && (
            <label className="flex flex-col gap-1.5 text-sm text-gray-700">
              Nome (opcional)
              <span className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </span>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            Email
            <span className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </span>
          </label>

          {mode !== "reset-password" && (
            <label className="flex flex-col gap-1.5 text-sm text-gray-700">
              Senha
              <span className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="password"
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </span>
            </label>
          )}

          {errorMessage && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-red-600 px-4 py-3 text-sm text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Aguarde..." : mode === "sign-up" ? "Criar conta" : mode === "reset-password" ? "Enviar instruções" : "Entrar"}
          </button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-3 text-sm">
          {mode === "sign-in" && (
            <>
              <button type="button" onClick={() => switchMode("reset-password")} className="text-gray-500 hover:text-red-600">
                Esqueci minha senha
              </button>
              <p className="text-gray-500">
                Ainda não tem conta?{" "}
                <button type="button" onClick={() => switchMode("sign-up")} className="text-red-600 hover:text-red-700">Cadastre-se</button>
              </p>
            </>
          )}
          {mode === "sign-up" && (
            <p className="text-gray-500">
              Já tem conta?{" "}
              <button type="button" onClick={() => switchMode("sign-in")} className="text-red-600 hover:text-red-700">Entrar</button>
            </p>
          )}
          {mode === "reset-password" && (
            <button type="button" onClick={() => switchMode("sign-in")} className="text-red-600 hover:text-red-700">
              Voltar ao login
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
