import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  initializeFirestore, 
  Firestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';

// Set Firestore log level to error to avoid noisy connection retry messages
setLogLevel('error');

// Import Firebase configuration from auto-generated config
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey || '',
  authDomain: firebaseConfigData.authDomain || '',
  projectId: firebaseConfigData.projectId || '',
  storageBucket: firebaseConfigData.storageBucket || '',
  messagingSenderId: firebaseConfigData.messagingSenderId || '',
  appId: firebaseConfigData.appId || '',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Use custom Firestore Database ID if specified in config, or default
const databaseId = firebaseConfigData.firestoreDatabaseId || '(default)';

export const db: Firestore = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    experimentalForceLongPolling: true,
  },
  databaseId !== '(default)' ? databaseId : undefined
);

export default app;


