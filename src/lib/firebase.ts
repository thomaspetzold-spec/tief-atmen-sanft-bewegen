import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAq4j6IKFevjM8xmluUFf4I756f9S9Br2w",
  authDomain: "tief-atmen-sanft-bewegen.firebaseapp.com",
  databaseURL: "https://tief-atmen-sanft-bewegen-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tief-atmen-sanft-bewegen",
  storageBucket: "tief-atmen-sanft-bewegen.firebasestorage.app",
  messagingSenderId: "366877466828",
  appId: "1:366877466828:web:26a498c02a4f5cc4532269",
};

const app = initializeApp(firebaseConfig);

if (import.meta.env.DEV) {
  // @ts-expect-error - Firebase debug token for local development
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

export const db = getDatabase(app); 
