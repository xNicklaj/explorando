'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface MapContentProps {
    activityData: any;
}

export function MapContent({ activityData }: MapContentProps) {
    const latitude = activityData?.Location?.latitude || 51.505;
    const longitude = activityData?.Location?.longitude || -0.09;
    const title = activityData?.Title || 'Activity';

    return (
        <MapContainer 
            center={[latitude, longitude]} 
            zoom={13} 
            scrollWheelZoom={false}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
                <Popup>
                    {title}
                </Popup>
            </Marker>
        </MapContainer>
    );
}
