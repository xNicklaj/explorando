import React from "react";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="text-black p-4">{id}</div>
    );
}