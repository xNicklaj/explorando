import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const activityDoc = await getDoc(doc(db, 'Activity', id));
    const activityData = activityDoc.exists() ? activityDoc.data() : null;

    return null;
}