'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const MapContent = dynamic(() => import('@/src/components/map-content').then(mod => ({ default: mod.MapContent })), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-gray-200 animate-pulse" />
});

export default function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const [activityData, setActivityData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const { id } = await params;
                const activityDoc = await getDoc(doc(db, 'Activity', id));
                const data = activityDoc.exists() ? activityDoc.data() : null;
                if(data !== null)
                    setActivityData(data["Position"]);
            } catch (error) {
                console.error('Failed to fetch activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [params]);

    if (loading) {
        return <div className="w-full h-screen bg-gray-200 animate-pulse" />;
    }

    return <MapContent activityData={activityData} />;
}