import React, { useRef, useEffect, useState } from "react"

// @ts-ignore
const L = window.L

const MarkerMap = ({geoJSON, markerLat, markerLon, tooltip, onZoneClick}) => {
    const mapContainerRef = useRef<null | HTMLDivElement>(null)
    const map = useRef<null | any>(null)
    function onEachFeature(feature, layer) {
        layer.on({
            click: (e) => {
                onZoneClick(e.target.feature)
            }
        })
    }
    useEffect(() => {
        if (!map.current) {
            const sombre = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                attribution:'Fond de carte: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            })
            const clair = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution:'Fond de carte: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            })
            const baseMaps = {
                "Sombre": sombre,
                "Clair": clair
            }
            let default_basemap = clair
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                default_basemap = sombre
            }

            let centerPoint = [48.866667, 2.333333]
            if (geoJSON) {
                centerPoint = [geoJSON.features[0].geometry.coordinates[0][0][1], geoJSON.features[0].geometry.coordinates[0][0][0]]
            }
            if (markerLat) {
                centerPoint = [markerLat, markerLon]
            }
            const zoomLevel = 13
            if (mapContainerRef.current) {
                const initializedMap = L.map(mapContainerRef.current, { preferCanvas: true, layers: [default_basemap] }).setView(centerPoint, zoomLevel)
                const layerControl = L.control.layers(baseMaps).addTo(initializedMap)
                initializedMap._layerControl = layerControl
                if (markerLat) L.marker([markerLat, markerLon]).bindTooltip(tooltip).addTo(initializedMap)
                if (geoJSON) {
                    L.geoJSON(geoJSON, {onEachFeature: onEachFeature}).addTo(initializedMap)
                }
                map.current = initializedMap
            }
        }

        return () => {
            if (map.current) {
                console.log("clearing map")
                map.current.remove()
                map.current = null
            }
        }
    }, [geoJSON, markerLat])

    return (
        <div ref={mapContainerRef} id="map" style={{height: "300px"}}></div>
    )
}
export default MarkerMap