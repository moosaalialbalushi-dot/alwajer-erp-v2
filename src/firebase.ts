import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyCWH51Q_KH-mHdPw74m15KTM6tPecsdU2c",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "gen-lang-client-0268646532.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "gen-lang-client-0268646532",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "gen-lang-client-0268646532.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "800165136969",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:800165136969:web:6894971cbe6bdf2d2b0d98",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || "G-YY1KGDB86S",
};

const firestoreDatabaseId: string =
  import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app, firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST   = 'list',
  GET    = 'get',
  WRITE  = 'write',
  UPLOAD = 'upload',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId:        auth.currentUser?.uid,
      email:         auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous:   auth.currentUser?.isAnonymous,
      tenantId:      auth.currentUser?.tenantId,
      providerInfo:  auth.currentUser?.providerData.map((provider) => ({
        providerId:  provider.providerId,
        displayName: provider.displayName,
        email:       provider.email,
        photoUrl:    provider.photoURL,
      })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firebase Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
