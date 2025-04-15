import React, { useEffect, useRef, useState, useContext } from "react"
import { SettingsContextType } from "../types"
// @ts-ignore
const L = window.L

interface HeatMapParamsTypes {
    onMapMove: (any) => void,
    onMarkerClick: (any) => void,
    SettingsContext: React.Context<SettingsContextType>
}
const HeatMap = ({onMapMove, onMarkerClick, SettingsContext}: HeatMapParamsTypes) => {
    const { settings } = useContext(SettingsContext)
    const location = settings.location
    const model = settings.model
    const showOnlyPointNoir = settings.showOnlyPointNoir
    const mapContainerRef = useRef<null | HTMLDivElement>(null)
    const [map, setMap] = useState<any>(null)
    const [bilanFilter, setBilanFilter] = useState({
        "Très positif": true,
        "Positif": true,
        "Négatif": true,
        "Très négatif": true
    })
    useEffect(() => {
        if (!map) {
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
            const centerPoint = [46.2276, 2.2137]
            const zoomLevel = 5
            try {
                const initializedMap = L.map(mapContainerRef.current, { preferCanvas: true, layers: [default_basemap] }).setView(centerPoint, zoomLevel)
                const layerControl = L.control.layers(baseMaps).addTo(initializedMap)
                
                initializedMap._layerControl = layerControl
                initializedMap.on('moveend', function() { 
                    onMapMove(initializedMap.getBounds())
               })
                setMap(initializedMap)
                
            } catch (error) {
                
            }
        }

        return () => {
            if (map) {
                map.remove()
                setMap(null)
            }
        }
    }, [])
    useEffect(() => {
        let objects = {
            "heatlayer": null as any,
            "markers": [] as any[]
        }
        const fetchData = async () => {
            try {
                let data = await (await fetch(`/api/heatmapdata?location=${location}&model=${model}`)).json()
                objects.heatlayer = L.heatLayer(data.heatmapjson, {max: 10}).addTo(map)
                for (let i = 0; i < data.carnetCoords.length; i++) {
                    const carnetCoord = data.carnetCoords[i]
                    if (settings.showOnlyPointNoir && !carnetCoord.isPointNoir) {
                        continue
                    }
                    let icon
                    switch (carnetCoord.bilan) {
                        case "Très positif":
                            icon = L.divIcon({ html: "🤩", className: "icon" })
                            break
                        case "Positif":
                            icon = L.divIcon({ html: "🙂", className: "icon" })
                            break
                        case "Négatif":
                            icon = L.divIcon({ html: "🤕", className: "icon" })
                            break
                        case "Très négatif":
                            icon = L.divIcon({ html: "😡", className: "icon" })
                            break
                        default:
                            icon = L.divIcon({ html: "😐", className: "icon" })
                            break
                    }
                    if (!bilanFilter[carnetCoord.bilan]) {
                        continue
                    }
                    objects.markers.push(L.marker([carnetCoord.lat, carnetCoord.lon], {icon: icon})
                        .bindTooltip(`<b>${carnetCoord.vehicule}</b><br/>${icon.options.html} ${carnetCoord.bilan}`)
                        .addTo(map)
                        .on('click', function(e) {
                            onMarkerClick(carnetCoord.carnetEntryIndex)
                        })
                    )
                }
            } catch (error) {
                console.log("data couldn't be fetched", error)
            }
        }
        if (map) {
            fetchData()
        }
        return () => {
            if (objects.heatlayer) {
                objects.heatlayer.remove()
                objects.heatlayer = null
            }
            for (let i = 0; i < objects.markers.length; i++) {
                objects.markers[i].remove()
            }
            objects.markers = []
        }
    }, [map, location, model, showOnlyPointNoir, bilanFilter])

    const editBilanFilter = (bilan) => {
        setBilanFilter({...bilanFilter, [bilan]: !bilanFilter[bilan]})
    }
    const bilanSelectedStyle = {opacity: "1", cursor: "pointer"}
    const bilanUnselectedStyle = {opacity: "0.5", cursor: "pointer"}
    return (
        <div>
            <div ref={mapContainerRef} id="map" style={{height: "500px"}}></div> 
            <div>Légende des expériences: 
                <span style={!bilanFilter["Très positif"] ? bilanUnselectedStyle : bilanSelectedStyle} onClick={() => editBilanFilter("Très positif")}>🤩 Très positive</span>,
                <span style={!bilanFilter["Positif"] ? bilanUnselectedStyle : bilanSelectedStyle} onClick={() => editBilanFilter("Positif")}>🙂 Positive</span>,
                <span style={!bilanFilter["Négatif"] ? bilanUnselectedStyle : bilanSelectedStyle} onClick={() => editBilanFilter("Négatif")}>🤕 Négative</span>,
                <span style={!bilanFilter["Très négatif"] ? bilanUnselectedStyle : bilanSelectedStyle} onClick={() => editBilanFilter("Très négatif")}>😡 Très négative</span>
            </div>
        </div>
    )
}

export default HeatMap