import React, { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router"

import * as types from '../types'
import HeatMap from "../components/HeatMap"
import { modelPicturesMap } from "../constants"

const EmbedMap = ({SettingsContext} : {SettingsContext: React.Context<types.SettingsContextType>}) => {
    const { settings, setSettings } = useContext(SettingsContext)

    const [statsLocation, setStatsLocation] = React.useState(useParams().location || "")
    const [ready, setReady] = React.useState(false)

    const vehicles = Object.keys(modelPicturesMap)
    const [veliFilter, setVeliFilter] = useState(
        vehicles.reduce((acc, cur) => {
            acc[cur] = cur === "Tous"
            return acc
        }, {})
    )

    useEffect(() => {
        setSettings({...settings, location: statsLocation})
        setReady(true)
    }, [statsLocation])

    const onMapMove = (mapBounds) => {
    }
    const onMarkerClick = (carnetIndex) => {
    }
    const onLocationClick = (location) => {
    }

    const editVeliFilter = (veli) => {
        setVeliFilter(
                vehicles.reduce((acc, cur) => {
                acc[cur] = cur === veli
                return acc
            }, {})
        )
        setSettings({...settings, model: veli})
    }

    const veliSelectedStyle = {opacity: "1", cursor: "pointer"}
    const veliUnselectedStyle = {opacity: "0.5", cursor: "pointer"}

    const isEmbed = window.location.search.includes("embed=true")
    const exportIframeText = `<iframe src="https://30veli.fabmob.io/embedmap/${encodeURI(statsLocation)}?embed=true" width="100%" height="800px" frameborder="0" scrolling="no"></iframe>`
    
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <div className="columns">
                            <div className="column" style={{"lineHeight": "40px"}}>
                                <h2 className="subtitle">
                                    Carte des expériences en véli
                                    {(settings.location && settings.location !== "Tous") ? 
                                        <span>{settings.location}</span>
                                        : ""}
                                    {(settings.model && settings.model !== "Tous") ? ` (${settings.model})` : ""}
                                </h2>
                            </div>
                        </div>
                        <div style={{"clear": "both"}}>
                            {ready && <HeatMap onMapMove={onMapMove} onMarkerClick={onMarkerClick} onLocationClick={onLocationClick} SettingsContext={SettingsContext}/>}
                            <div>Filtre véli: {vehicles.map(v => 
                                <span style={!veliFilter[v] ? veliUnselectedStyle : veliSelectedStyle} onClick={() => editVeliFilter(v)}>{v}, </span>
                            )} </div>
                        </div>
                        {isEmbed && <p><a href="https://30veli.fabmob.io/" target="_blank"><i className="fa fa-link"></i> Consultez le site de l'expérimentation pour en savoir plus.</a></p>}
                    </div>
                </div>
            </section>
            {!isEmbed && <section className="section">
                <div className="container">
                    <div className="content">
                        <h3 className="subtitle">
                            <i className="fa fa-code"></i> Intégrer la carte dans votre site
                        </h3>
                        <textarea className="textarea" readOnly value={exportIframeText} />
                    </div>
                </div>
            </section>}
        </div>
    )   
}

export default EmbedMap