import React, { useEffect, useState } from "react"

interface PanoFeature {
    id?: string,
    geometry?: {
        coordinates: number[][][]
    },
    mapCoords?: number[]
}
const PanoramaxFrame = ({ feature }) => {
    const [panofeature, setPanoFeature] = useState<null |PanoFeature>(null)
    useEffect(() => {
        const geometry = feature.geometry
        fetch(`https://panoramax.openstreetmap.fr/api/search?intersects=${JSON.stringify(geometry)}&limit=1`) 
            .then(response => response.json())
            .then(data => {
                if (data.features.length) {
                    setPanoFeature(data.features[0])
                } else {
                    setPanoFeature({
                        mapCoords: geometry.coordinates[0][0],
                    })
                }
            })
    }, [feature])
    return (
        <div>
            {(panofeature?.id && panofeature?.geometry) && <iframe
                src={`https://api.panoramax.xyz/#focus=pic&map=13/${panofeature.geometry.coordinates[1]}/${panofeature.geometry.coordinates[0]}&pic=${panofeature.id}`} 
                style={{border: "none", width: "100%", height: "300px"}}>
            </iframe>}
            {panofeature?.mapCoords && <iframe 
                src={`https://api.panoramax.xyz/#focus=map&map=13/${panofeature.mapCoords[1]}/${panofeature.mapCoords[0]}`} 
                style={{border: "none", width: "100%", height: "300px"}}>
            </iframe>}
        </div>
    )
}

export default PanoramaxFrame