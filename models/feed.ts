import { doc, getDoc, getDocs, query, where, collection, DocumentReference, Timestamp, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeedData {
  id: string;
  Activity: DocumentReference;
  User: DocumentReference;
  Datetime: Timestamp;
  Comment: string;
}

/**
 * Fetches feed items for a user by user ID
 */
export async function getFeedByUserId(userId: string): Promise<FeedData[]> {
  return fetchUserFeed(doc(db, 'User', userId));
}

/**
 * Fetches feed items for a user by document reference
 */
export async function getFeedByUserRef(userRef: DocumentReference): Promise<FeedData[]> {
  return fetchUserFeed(userRef);
}

/**
 * Fetches feed items for a user by username
 */
export async function getFeedByUsername(username: string): Promise<FeedData[]> {
  try {
    const userQuery = query(collection(db, 'User'), where('Username', '==', username));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error(`User with username "${username}" not found`);
    }

    return fetchUserFeed(userSnapshot.docs[0].ref);
  } catch (err: any) {
    console.error('Failed to fetch feed by username:', err);
    throw new Error(err.message || 'Failed to fetch feed');
  }
}

/**
 * Internal function to fetch feed items for a user reference
 */
async function fetchUserFeed(userRef: DocumentReference): Promise<FeedData[]> {
  try {
    const feedQuery = query(
      collection(db, 'Feed'),
      where('User', '==', userRef),
      orderBy('Datetime', 'desc')
    );

    const feedSnapshot = await getDocs(feedQuery);

    const feedItems = feedSnapshot.docs.map((feedDoc) => ({
      id: feedDoc.id,
      ...feedDoc.data(),
    } as FeedData));

    return feedItems;
  } catch (err: any) {
    console.error('Failed to fetch feed:', err);
    throw new Error(err.message || 'Failed to fetch feed');
  }
}

/**
 * Creates and pushes a new feed item to the database
 */
export async function createFeedItem(
  data: Omit<FeedData, 'id'>
): Promise<FeedData> {
  try {
    const docRef = await addDoc(collection(db, 'Feed'), data);
    return {
      id: docRef.id,
      ...data,
    } as FeedData;
  } catch (err: any) {
    console.error('Failed to create feed item:', err);
    throw new Error(err.message || 'Failed to create feed item');
  }
}
