'use client';

import { useGeolocation } from '@/app/hooks/useGeolocation';
import { getHaversineDistance } from '@/lib/haversine';

interface DistanceDisplayProps {
    activityLocation: {
        latitude: number;
        longitude: number;
    };
}

export function DistanceDisplay({ activityLocation }: DistanceDisplayProps) {
    const { position } = useGeolocation();

    if (!position) {
        return (
            <div className="absolute bottom-0 left-0 p-4 m-2 bg-gray-50 z-10 rounded text-black pointer-events-none flex flex-row">
                <div className="w-5 mr-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div> KM
            </div>
        );
    }

    const distance = getHaversineDistance(position, activityLocation);

    return (
        <div className="absolute bottom-0 left-0 p-4 m-2 bg-gray-50 z-10 rounded text-black pointer-events-none">
            {distance.toFixed(0)} KM
        </div>
    );
}
