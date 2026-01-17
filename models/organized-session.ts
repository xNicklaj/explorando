import { doc, getDoc, DocumentReference, Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ChatMessage {
  User: DocumentReference;
  Message: string;
  Datetime: Timestamp;
}

export interface OrganizedSessionData {
  id: string;
  Activity: DocumentReference;
  Subscribers: DocumentReference[];
  Chat: ChatMessage[];
  Datetime: Timestamp;
}

/**
 * Fetches organized session data by session ID
 */
export async function getOrganizedSessionById(sessionId: string): Promise<OrganizedSessionData> {
  try {
    const sessionDocRef = doc(db, 'OrganizedSession', sessionId);
    const sessionDocSnapshot = await getDoc(sessionDocRef);

    if (!sessionDocSnapshot.exists()) {
      throw new Error('OrganizedSession document not found');
    }

    const data = sessionDocSnapshot.data();
    return {
      id: sessionDocSnapshot.id,
      ...(data || {}),
    } as OrganizedSessionData;
  } catch (err: any) {
    console.error('Failed to fetch organized session:', err);
    throw new Error(err.message || 'Failed to fetch organized session');
  }
}

/**
 * Fetches organized session data by document reference
 */
export async function getOrganizedSessionByRef(
  sessionRef: DocumentReference | any
): Promise<OrganizedSessionData> {
  try {
    const sessionDocSnapshot = await getDoc(sessionRef);

    if (!sessionDocSnapshot.exists()) {
      throw new Error('OrganizedSession document not found');
    }

    const data = sessionDocSnapshot.data();
    return {
      id: sessionDocSnapshot.id,
      ...(data || {}),
    } as OrganizedSessionData;
  } catch (err: any) {
    console.error('Failed to fetch organized session by reference:', err);
    throw new Error(err.message || 'Failed to fetch organized session by reference');
  }
}

/**
 * Creates a new organized session
 */
export async function createOrganizedSession(
  data: Omit<OrganizedSessionData, 'id'>
): Promise<string> {
  try {
    const sessionsRef = collection(db, 'OrganizedSession');
    const docRef = await addDoc(sessionsRef, data);
    return docRef.id;
  } catch (err: any) {
    console.error('Failed to create organized session:', err);
    throw new Error(err.message || 'Failed to create organized session');
  }
}
