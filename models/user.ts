import { ref, get } from 'firebase/database';
import { doc, getDoc, DocumentReference, collection, query, where, getDocs } from 'firebase/firestore';
import { rtdb, db } from '@/lib/firebase';

export interface UserData {
  id: string;
  Avatar: string[];
  Badges: DocumentReference[];
  DisplayName: string;
  Friends: DocumentReference[];
  Username: string;
  XP: number;
  Points: number;
}

/**
 * Fetches the current user's ID from rtdb and returns their Firestore document
 * @returns Promise resolving to the user document data and ID
 * @throws Error if user ID cannot be retrieved or user document not found
 */
export async function getCurrentUser(): Promise<UserData> {
  let userId: string;

  // Get user ID from rtdb
  try {
    const currentIdRef = ref(rtdb, 'userid');
    const snapshot = await get(currentIdRef);

    if (!snapshot.exists()) {
      throw new Error('No user ID found in database');
    }

    userId = snapshot.val();
  } catch (err: any) {
    console.error('Failed to fetch user ID:', err);
    throw new Error(err.message || 'Failed to fetch user ID');
  }

  // Get user document from Firestore
  try {
    const userDocRef = doc(db, 'User', userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      throw new Error('User document not found');
    }

    return {
      id: userDocSnapshot.id,
      ...userDocSnapshot.data(),
    } as UserData;
  } catch (err: any) {
    console.error('Failed to fetch user document:', err);
    throw new Error(err.message || 'Failed to fetch user document');
  }
}

/**
 * Fetches user data by ID, username, or document reference
 */
export async function getUserData(userId: string): Promise<UserData>;
export async function getUserData(username: string, byUsername: true): Promise<UserData>;
export async function getUserData(ref: DocumentReference): Promise<UserData>;
export async function getUserData(
  input: string | DocumentReference,
  byUsername?: boolean
): Promise<UserData> {
  try {
    let userDocSnapshot;

    if (input instanceof DocumentReference) {
      // By document reference
      userDocSnapshot = await getDoc(input);
    } else if (byUsername) {
      // By username
      const q = query(collection(db, 'User'), where('Username', '==', input));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error(`User with username "${input}" not found`);
      }

      userDocSnapshot = snapshot.docs[0];
    } else {
      // By user ID
      const userDocRef = doc(db, 'User', input);
      userDocSnapshot = await getDoc(userDocRef);
    }

    if (!userDocSnapshot.exists()) {
      throw new Error('User document not found');
    }

    return {
      id: userDocSnapshot.id,
      ...userDocSnapshot.data(),
    } as UserData;
  } catch (err: any) {
    console.error('Failed to fetch user data:', err);
    throw new Error(err.message || 'Failed to fetch user data');
  }
}
