import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/custom-button';
import { ImageCarousel } from '@/components/image-carousel';
import { DistanceDisplay } from '@/components/distance-display';

import { FaPlay } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";

export default async function ActivityDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const activityDoc = await getDoc(doc(db, 'Activity', id));
    const activityData = activityDoc.exists() ? activityDoc.data() : null;

    if (!activityData) {
        return (
            <div className="flex h-full bg-white flex-col p-6">
                <h1 className="text-2xl font-bold text-gray-900">Activity not found</h1>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white flex-col text-gray-900">
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
                <div className="relative min-h-[250px] max-h-[250px]">
                    <ImageCarousel images={activityData["Gallery"] || []} className="h-full"/>
                    <div className="absolute bottom-0 right-0 p-4 m-2 bg-gray-50 z-10 rounded text-black pointer-events-none">{activityData["XP"]} <span className="text-accent-500">X</span>P</div>
                    <DistanceDisplay activityLocation={{ latitude: activityData["Position"]?.latitude || 0, longitude: activityData["Position"]?.longitude || 0 }} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 px-6 pt-6">{activityData["Title"]}</h1>
                <div className="px-6 pb-6">{activityData["Description"]}</div>
            </div>
            <div className="p-6 pt-0 flex w-full flex-col gap-2">
                <Button layoutClass="w-full" href={`/map/${id}`}><FaPlay />Avvia</Button>
                <div className="flex flex-row w-full gap-2">
                    <Button layoutClass="w-full"><FaCalendarAlt />Partecipa</Button>
                </div>
            </div>
        </div>
    );
}
