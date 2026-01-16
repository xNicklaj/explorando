import { doc, getDoc, DocumentReference, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
