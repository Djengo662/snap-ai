import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4QbkJFL4LKge62BTOIaDIepemaNpJdOA",
  authDomain: "snapai-fc951.firebaseapp.com",
  projectId: "snapai-fc951",
  storageBucket: "snapai-fc951.firebasestorage.app",
  messagingSenderId: "669836915298",
  appId: "1:669836915298:web:f6bfc67959abeee04a973b",
  measurementId: "G-NFDZVN64WH",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female" | "other";
  goal?: "lose" | "maintain" | "gain";
  dailyCalorieTarget?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  onboardingComplete: boolean;
}

export interface MealEntry {
  id: string;
  uid: string;
  imageBase64?: string;
  imageUrl?: string;
  foods: FoodItem[];
  totalCalories: number;
  macros: Macros;
  aiProvider: "claude" | "gpt" | "gemini";
  createdAt: Timestamp;
  date: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  amount: string;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const calcDailyCalories = (
  age: number,
  weight: number,
  height: number,
  gender: "male" | "female" | "other",
  goal: "lose" | "maintain" | "gain",
): number => {
  const bmr =
    gender === "female"
      ? 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
      : 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;

  const tdee = Math.round(bmr * 1.375);

  return goal === "lose" ? tdee - 500 : goal === "gain" ? tdee + 300 : tdee;
};

export const createUserProfile = async (
  uid: string,
  email: string,
): Promise<void> => {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    await setDoc(ref, {
      uid,
      email,
      createdAt: Timestamp.now(),
      onboardingComplete: false,
    } satisfies Partial<UserProfile>);
  }
};

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

export const saveMealEntry = async (
  entry: Omit<MealEntry, "id">,
): Promise<string> => {
  const ref = await addDoc(collection(db, "meals"), entry);

  return ref.id;
};

export const getMealsForDate = async (
  uid: string,
  date: string,
): Promise<MealEntry[]> => {
  const q = query(
    collection(db, "meals"),
    where("uid", "==", uid),
    where("date", "==", date),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MealEntry);
};

export const getRecentMeals = async (
  uid: string,
  days = 7,
): Promise<MealEntry[]> => {
  const since = new Date();

  since.setDate(since.getDate() - days);

  const q = query(
    collection(db, "meals"),
    where("uid", "==", uid),
    where("createdAt", ">=", Timestamp.fromDate(since)),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MealEntry);
};

const SALT = "snapai_v1_";

const xorEncrypt = (text: string, key: string) => {
  return btoa(
    text
      .split("")
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
      )
      .join(""),
  );
};

const xorDecrypt = (encoded: string, key: string): string => {
  try {
    const text = atob(encoded);
    return text
      .split("")
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
      )
      .join("");
  } catch {
    return "";
  }
};

export const saveApiKey = (
  provider: "claude" | "gpt" | "gemini",
  key: string,
): void => {
  const encrypted = xorEncrypt(key, SALT + provider);

  localStorage.setItem(`snapai_key_${provider}`, encrypted);
};

export const loadApyKey = (provider: "claude" | "gpt" | "gemini"): string => {
  const stored = localStorage.getItem(`snapai_key_${provider}`);

  if (!stored) return "";

  return xorDecrypt(stored, SALT + provider);
};

export const clearApiKey = (provider: "claude" | "gpt" | "gemini"): void => {
  localStorage.removeItem(`snapai_key_${provider}`);
};

export const saveSelectedProvider = (
  provider: "claude" | "gpt" | "gemini",
): void => {
  localStorage.setItem("snapai_provider", provider);
};

export const loadSelectedProvider = (): "claude" | "gpt" | "gemini" => {
  return (localStorage.getItem("snapai_provider") as any) ?? "claude";
};
