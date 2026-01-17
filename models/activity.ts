import { doc, getDoc, DocumentReference, GeoPoint, addDoc, collection } from 'firebase/firestore';
import { db, rtdb } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export interface QuizData {
  Ans0: string;
  Ans1: string;
  Ans2: string;
  Correct: number; // 0, 1, or 2
  Question: string;
}

export interface ActivityData {
  id: string;
  Category: DocumentReference;
  Description: string;
  Gallery: string[];
  Imgsrc: string;
  Position: GeoPoint;
  Quiz: QuizData[];
  Title: string;
  XP: number;
}

/**
 * Fetches activity data by activity ID
 */
export async function getActivityById(activityId: string): Promise<ActivityData> {
  try {
    const activityDocRef = doc(db, 'Activity', activityId);
    const activityDocSnapshot = await getDoc(activityDocRef);

    if (!activityDocSnapshot.exists()) {
      throw new Error('Activity document not found');
    }

    return {
      id: activityDocSnapshot.id,
      ...activityDocSnapshot.data(),
    } as ActivityData;
  } catch (err: any) {
    console.error('Failed to fetch activity:', err);
    throw new Error(err.message || 'Failed to fetch activity');
  }
}

/**
 * Fetches activity data by document reference
 */
export async function getActivityByRef(activityRef: DocumentReference | any): Promise<ActivityData> {
  try {
    let activityDocSnapshot;

    // Handle both DocumentReference and serialized reference objects
    if (typeof activityRef === 'object' && activityRef._key?.path?.segments) {
      // It's a serialized DocumentReference - extract the ID from the path
      const segments = activityRef._key.path.segments;
      const activityId = segments[segments.length - 1];
      const activityDocRef = doc(db, 'Activity', activityId);
      activityDocSnapshot = await getDoc(activityDocRef);
    } else if (activityRef instanceof DocumentReference) {
      // It's a proper DocumentReference
      activityDocSnapshot = await getDoc(activityRef);
    } else {
      throw new Error('Invalid activity reference');
    }

    if (!activityDocSnapshot.exists()) {
      throw new Error('Activity document not found');
    }

    return {
      id: activityDocSnapshot.id,
      ...activityDocSnapshot.data(),
    } as ActivityData;
  } catch (err: any) {
    console.error('Failed to fetch activity:', err);
    throw new Error(err.message || 'Failed to fetch activity');
  }
}

/**
 * Creates and pushes a new activity to the database
 */
export async function createActivity(
  data: Omit<ActivityData, 'id'>
): Promise<ActivityData> {
  try {
    const docRef = await addDoc(collection(db, 'Activity'), data);
    return {
      id: docRef.id,
      ...data,
    } as ActivityData;
  } catch (err: any) {
    console.error('Failed to create activity:', err);
    throw new Error(err.message || 'Failed to create activity');
  }
}

/**
 * Checks if an activity is currently enabled by polling the rtdb
 */
export async function isActivityEnabled(activityId: string): Promise<boolean> {
  try {
    const enabledActivitiesRef = ref(rtdb, 'currently-enabled-activities');
    const snapshot = await get(enabledActivitiesRef);

    if (!snapshot.exists()) {
      return false;
    }

    const enabledActivities = snapshot.val();

    // Handle both array and object formats
    if (Array.isArray(enabledActivities)) {
      return enabledActivities.includes(activityId);
    } else if (typeof enabledActivities === 'object') {
      return Object.values(enabledActivities).includes(activityId);
    }

    return false;
  } catch (err: any) {
    console.error('Failed to check if activity is enabled:', err);
    return false;
  }
}
