import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/* const MapContent = dynamic(() => import('@/src/components/map-content').then(mod => ({ default: mod.MapContent })), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-gray-200 animate-pulse" />
}); */

export default function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const [activityData, setActivityData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                console.log('MapPage: fetching activity...');
                const { id } = await params;
                console.log('MapPage: resolved params, id:', id);
                const activityDoc = await getDoc(doc(db, 'Activity', id));
                const data = activityDoc.exists() ? activityDoc.data() : null;
                console.log('MapPage: activity data:', data);
                if(data !== null)
                    setActivityData(data["Position"]);
                setError(null);
            } catch (err: any) {
                console.error('MapPage: Failed to fetch activity:', err);
                setError(err.message ?? 'Failed to load activity');
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [params]);

    if (error) {
        return <div className="w-full h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (loading) {
        return <div className="w-full h-screen bg-gray-200 animate-pulse" />;
    }

    console.log('MapPage: rendering MapContent');
    return (
        <div className="w-full h-screen">
            <div className="p-4 bg-blue-500 text-white">
                <p>Page loaded! Activity data: {JSON.stringify(activityData)}</p>
                <p>Loading: {String(loading)}, Error: {error}</p>
            </div>
            {
                //<MapContent activityData={activityData} />
            }
        </div>
    );
}