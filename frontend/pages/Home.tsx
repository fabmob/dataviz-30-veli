import React, { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router"

import * as types from '../types'
import HeatMap from "../components/HeatMap"
import PieChart from "../components/PieChart"
import Carnet from "../components/Carnet"
import { modelPicturesMap } from "../constants"

const Home = ({SettingsContext} : {SettingsContext: React.Context<types.SettingsContextType>}) => {
    const { settings, setSettings } = useContext(SettingsContext)
    const location = settings.location
    const model = settings.model
    const navigate = useNavigate()
    const [mapBounds, setMapBounds] = useState({
        sw: {lat: 37.9961626797281, lng: -27.2900390625},
        ne: {lat: 53.2257684357902, lng: 31.7724609375}
    })
    const [stats, setStats] = useState<types.TripsInBboxType[]>([])
    const [carnetIndex, setCarnetIndex] = useState(useParams().carnetIndex)
    const [tab, setTab] = useState(carnetIndex ? "carnets" : "stats")
    useEffect(() => {
        const fetchData = async () => {
            if (mapBounds && tab === "stats") {
                const stats = await fetch(`/api/tripsInBbox?southWestLat=${mapBounds.sw.lat}&northEastLat=${mapBounds.ne.lat}&southWestLon=${mapBounds.sw.lng}&northEastLon=${mapBounds.ne.lng}&location=${location}&model=${model}`) 
                const statsJson : types.TripsInBboxType[] = await stats.json()
                // console.log(statsJson)
                setStats(statsJson)
            }
        }
        fetchData()
    }, [mapBounds, tab, location, model])
    const onMapMove = (mapBounds) => {
        // console.log(mapBounds.getSouthWest(), mapBounds.getNorthEast())
        setMapBounds({
            sw: {lat: mapBounds.getSouthWest().lat, lng: mapBounds.getSouthWest().lng},
            ne: {lat: mapBounds.getNorthEast().lat, lng: mapBounds.getNorthEast().lng}
        })
    }
    const onMarkerClick = (carnetIndex) => {
        navigate(`/${carnetIndex}`)
        setCarnetIndex(carnetIndex)
        setTab("carnets")
    }
    for (let i = 0; i < stats.length; i++) {
        let bilanData = stats[i].carnetEntries.reduce((acc, carnetEntry) => {
            acc[carnetEntry.bilan] = (acc[carnetEntry.bilan] || 0) + 1
            return acc
        }, {})
        bilanData["Trajets sans bilan"] = stats[i].nbTrips - stats[i].carnetEntries.length
        stats[i].bilanData = bilanData
    }
    let filterText = ""
    if (settings.location && settings.location !== "Tous") {
        filterText += `(${settings.location})`
    }
    if (settings.model && settings.model !== "Tous") {
        filterText += `(${settings.model})`
    }
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Le projet d’expérimentation 30 VELI 
                        </h1>
                        <p>Le projet 30 VELI est lancé en partenariat entre l'<a href="https://www.ademe.fr/">ADEME</a> et <a href="https://lafabriquedesmobilites.fr/">la Fabrique de Mobilités</a>, dans le cadre de l'<a href="https://xd.ademe.fr/">eXtrême Défi Mobilité</a>. Il consiste à tester 30 véhicules sur 16 territoires au total pour fin 2025.</p>
                        <p>Ce tableau de bord partage des statistiques générales sur les voyages à bord de ces véhicules, mesurées à partir de capteurs embarqués, ainsi que les expériences des testeurs issus de questionnaires.</p>
                        <p>Depuis juillet 2025, il affiche aussi les voyages d'autres expérimentations de l'eXtrême Défi Mobilités, notamment grace aux données partagées par <a href="https://www.invd.fr/">In'VD</a> et l'<a href="https://www.insa-toulouse.fr/">INSA</a>/<a href="https://www.laas.fr/">LAAS</a> à Toulouse.</p>
                        <h2 className="subtitle">
                            Vue d'ensemble {filterText}
                            <div style={{"float": "right"}}>
                                <button className="button" onClick={() => setSettings({...settings, show: true})}>
                                    <span className="icon">
                                        <i className="fa fa-gear"></i>
                                    </span>
                                    <span>Paramètres</span>
                                </button>
                            </div>
                        </h2>
                        <HeatMap onMapMove={onMapMove} onMarkerClick={onMarkerClick} SettingsContext={SettingsContext}/>
                        <div className="tabs mt-4">
                            <ul>
                                <li className={(tab == "stats" ? "is-active" : "")}><a onClick={() => setTab("stats")}>Statistiques générales des trajets traversant la zone</a></li>
                                <li className={(tab == "carnets" ? "is-active" : "")}><a onClick={() => setTab("carnets")}>Zoom sur une expérience</a></li>
                            </ul>
                        </div>
                        {tab == "stats" && <div className="grid is-col-min-16 mt-4">
                            {stats.map((stat, index) => <div className="cell" key={index}>
                                <div className="card">
                                    <div className="card-image">
                                        <figure className="image is-4by3" style={{maxHeight: "250px", margin: "auto"}}>
                                            <img src={modelPicturesMap[stat.Model]} alt={stat.Model} style={{objectFit: "cover"}}/>
                                        </figure>
                                    </div>
                                    <div className="card-content">
                                        <div className="media-content">
                                            <p className="title is-4">{stat.Model}</p>
                                        </div>

                                        <div className="content mt-4">
                                            <div className="field is-grouped is-grouped-multiline">
                                                <div className="control">
                                                    <div className="tags has-addons">
                                                        <span className="tag">Distance totale</span>
                                                        <span className="tag is-primary">{stat.totalDistanceKm.toFixed(2)} km</span>
                                                    </div>
                                                </div>
                                                <div className="control">
                                                    <div className="tags has-addons">
                                                        <span className="tag">Nombre de trajets</span>
                                                        <span className="tag is-primary">{stat.nbTrips}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {stat.bilanData && <PieChart data={stat.bilanData} label="Nombre" />}
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                        </div>}
                        {(tab == "carnets" && carnetIndex) && <Carnet carnetIndex={carnetIndex}/>}
                    </div>
                </div>
            </section>
        </div>
    )   
}

export default Home