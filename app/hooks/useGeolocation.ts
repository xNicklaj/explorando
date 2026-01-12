'use client';

import { useState, useEffect } from 'react';
interface Position {
    latitude: number;
    longitude: number;
}

export function useGeolocation() {
    const [position, setPosition] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setError(null);
            },
            (err) => setError(err.message),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            }
        );

        return () => {
            try { navigator.geolocation.clearWatch(watchId); } catch {}
        };
    }, []);

    return { position, error };
}