'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '@/app/hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons in Next.js bundlers
// (paths can be resolved differently; try both .src and direct value)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const iconRetina = (markerIcon2x as any).src ?? (markerIcon2x as any);
const icon = (markerIcon as any).src ?? (markerIcon as any);
const shadow = (markerShadow as any).src ?? (markerShadow as any);

// Ensure Leaflet uses bundled asset URLs
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
});

// Red variant of the default marker using a CSS filter
const redIcon = new L.Icon({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
    className: 'leaflet-marker-red',
});

interface MapContentProps {
    activityData: any;
}

export function MapContent({ activityData }: MapContentProps) {
    const { position: userPosition } = useGeolocation();
    
    const activityLatitude = activityData?.latitude;
    const activityLongitude = activityData?.longitude;
    const title = activityData?.Title || 'Activity';
    
    // Debug logging
    console.log('Map Debug:', {
        userPosition,
        activityLatitude,
        activityLongitude,
        activityData,
    });
    
    // Center on activity if available, otherwise on user location
    const centerLatitude = activityLatitude || userPosition?.latitude || 51.505;
    const centerLongitude = activityLongitude || userPosition?.longitude || -0.09;

    const userLatLng = userPosition ? [userPosition.latitude, userPosition.longitude] as [number, number] : null;
    const activityLatLng = activityLatitude && activityLongitude ? [activityLatitude, activityLongitude] as [number, number] : null;

    const [routeCoords, setRouteCoords] = useState<Array<[number, number]>>([]);
    const [routeError, setRouteError] = useState<string | null>(null);

    useEffect(() => {
        setRouteError(null);
        setRouteCoords([]);
        if (!userLatLng || !activityLatLng) return;

        const fetchRoute = async () => {
            try {
                const [uLat, uLon] = userLatLng;
                const [aLat, aLon] = activityLatLng;
                const url = `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${aLon},${aLat}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`OSRM error ${res.status}`);
                const data = await res.json();
                const coords = (data.routes?.[0]?.geometry?.coordinates ?? []).map((c: [number, number]) => [c[1], c[0]] as [number, number]);
                setRouteCoords(coords);
            } catch (e: any) {
                setRouteError(e.message ?? 'Routing failed');
            }
        };

        fetchRoute();
    }, [userLatLng?.[0], userLatLng?.[1], activityLatLng?.[0], activityLatLng?.[1]]);

    function FitBounds({ points }: { points: Array<[number, number]> }) {
        const map = useMap();
        if (points.length === 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [24, 24] });
        }
        return null;
    }

    function RecenterOnUser({ target }: { target: [number, number] | null }) {
        const map = useMap();
        useEffect(() => {
            if (target) {
                map.setView(target, map.getZoom(), { animate: true });
            }
        }, [target]);
        return null;
    }

    return (
        <div className="w-full h-screen">
            <MapContainer
                center={[centerLatitude, centerLongitude]}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
            >
                                <RecenterOnUser target={userLatLng} />
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {userLatLng && (
                    <>
                        <CircleMarker
                            center={userLatLng}
                            radius={8}
                            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 1 }}
                        />
                        <Circle
                            center={userLatLng}
                            radius={120}
                            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.15 }}
                        />
                        <Popup position={userLatLng}>You are here</Popup>
                    </>
                )}

                {activityLatLng && (
                    <Marker position={activityLatLng} icon={redIcon}>
                        <Popup>{title}</Popup>
                    </Marker>
                )}

                {routeCoords.length > 0 ? (
                    <>
                        <Polyline positions={routeCoords} pathOptions={{ color: '#0ea5e9', weight: 4 }} />
                        <FitBounds points={[routeCoords[0], routeCoords[routeCoords.length - 1]]} />
                    </>
                ) : (
                    userLatLng && activityLatLng && <FitBounds points={[userLatLng, activityLatLng]} />
                )}

                {routeError && (
                    <Popup position={userLatLng ?? activityLatLng ?? [centerLatitude, centerLongitude] as [number, number]}>
                        Routing unavailable: {routeError}
                    </Popup>
                )}
            </MapContainer>
        </div>
    );
}
