import React, { useState, useEffect } from "react"
import * as types from "../types"
import { modelPicturesMap } from "../constants"
import MarkerMap from "./MarkerMap"
import PanoramaxFrame from "./PanoramaxFrame"

const Carnet = ({carnetIndex, carnetEntry} : {carnetIndex?: string, carnetEntry?: types.CarnetType}) => {
    const [carnet, setCarnet] = useState<null | types.CarnetType>(null)
    const [editComment, setEditComment] = useState(false)
    const [clickedFeature, setClickedFeature] = useState(null)
    useEffect(() => {
        const fetchData = async () => {
            const carnet = await fetch('/api/carnet/' + carnetIndex)
            let carnetJson : types.CarnetType = await carnet.json()
            console.log(carnetJson)
            setCarnet(carnetJson)
        }
        if (carnetEntry) {
            setCarnet(carnetEntry)
        } else {
            fetchData()
        }
        setClickedFeature(null)
    }, [carnetIndex, carnetEntry])
    // * Rappel du vehicule, distance parcourue, durée. Par contre on affiche pas le trajet spécifique, ni l'OD (sauf en mode admin ?, ou en grandes zones h3 ?)
    // * Si geoloc type point noir, on l'affiche sur une carte + photo panoramax ? (lien photo modifiable en mode admin)
    // * limitation de vitesse moyenne sur le trajet, ou plus haute vitesse autorisée, avec panneau comme viz. (modifiable en mode admin)
    // * Viz des autres indicateurs (type météo)
    // * Date & heure ? ou trop sensible ?
    // * Encart explication/avis "expert" (champ modifiable en mode admin)
    // * Itinéraire recommandé par calculateur veli ? (nécessite OD)
    let meteoIcon
    if (carnet) {
        if (carnet.meteo_ensoleille) {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-sun" aria-hidden="true"></i>
            </span>
        } else if (carnet.meteo_venteux) {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-umbrella" aria-hidden="true"></i>
            </span>
        } else if (carnet.meteo_neigeux) {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-cloud-rain" aria-hidden="true"></i>
            </span>
        } else if (carnet.meteo_brouillard) {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-cloud-drizzle" aria-hidden="true"></i>
            </span>
        } else if (carnet.meteo_autre) {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-cloud" aria-hidden="true"></i>
            </span>
        } else {
            meteoIcon = <span className="icon is-small">
                <i className="fas fa-question" aria-hidden="true"></i>
            </span>
        }
    }
    const saveEdit = async (field, value) => {
        await fetch('/api/carnet/' + carnetIndex + '/' + field, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"value": value})
        })
    }
    return (
        <div>
            {carnet && <article className="message">
                <div className="message-header">
                    <p>Le contexte de l'expert</p>
                    {editComment 
                        ? <button className="button is-small is-success" onClick={() => {setEditComment(false); saveEdit("comment", carnet.edits?.comment)}}>Enregistrer</button>
                        : <button className="button is-small is-info" onClick={() => setEditComment(true)}>Modifier</button>
                    }
                </div>
                <div className="message-body">
                    {editComment
                        ? <textarea className="textarea" value={carnet.edits?.comment} onChange={(e) => setCarnet({...carnet, edits: {...carnet.edits, comment: e.target.value}})}></textarea>
                        : <p>{carnet.edits?.comment}</p>
                    }
                </div>
            </article>}
            {carnet && <div className="columns">
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Vehicule utilisé</p>
                        </header>
                        <div className="card-image">
                            <figure className="image is-4by3" style={{maxHeight: "250px", margin: "auto"}}>
                                <img src={modelPicturesMap[carnet.Model || carnet.vehicule]} alt={carnet.Model || carnet.vehicule} style={{objectFit: "cover"}}/>
                            </figure>
                        </div>
                        <div className="card-content">
                            <div className="media-content">
                                <p className="title is-4">{carnet.Model || carnet.vehicule}</p>
                            </div>

                            <div className="content mt-4">
                                <div className="field is-grouped is-grouped-multiline">
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Distance totale</span>
                                            <span className="tag is-primary">{carnet.totalDistanceKm ? carnet.totalDistanceKm.toFixed(2) : '?'} km</span>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Nombre de trajets</span>
                                            <span className="tag is-primary">{carnet.nbTrips}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Conditions</p>
                        </header>
                        {/* <div className="card-image">
                            <figure className="image is-4by3" style={{maxHeight: "250px", margin: "auto"}}>
                                <img src={modelPicturesMap[carnet.Model]} alt={carnet.Model} style={{objectFit: "cover"}}/>
                            </figure>
                        </div> */}
                        <div className="card-content">
                            <div className="media-content">
                                <p className="title is-4">{carnet.territoire}</p>
                            </div>

                            <div className="content mt-4">
                                <div className="field is-grouped is-grouped-multiline">
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Début</span>
                                            <span className="tag is-primary">{carnet.heure_debut}</span>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Fin</span>
                                            <span className="tag is-primary">{carnet.heure_fin}</span>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Luminosité</span>
                                            <span className="tag is-primary">{carnet.moment}</span>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Météo</span>
                                            <span className="tag is-primary">{meteoIcon}</span>
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Raison du déplacement</span>
                                            <span className="tag is-primary">{carnet.motif}</span>
                                        </div>
                                    </div>
                                    {carnet.mode_domicile_travail && <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Mode habituel domicile travail</span>
                                            <span className="tag is-primary">{carnet.mode_domicile_travail}</span>
                                        </div>
                                    </div>}
                                    {carnet.mode_domicile_etudes && <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Mode habituel domicile etudes</span>
                                            <span className="tag is-primary">{carnet.mode_domicile_etudes}</span>
                                        </div>
                                    </div>}
                                    {carnet.mode_domicile_loisirs && <div className="control">
                                        <div className="tags has-addons">
                                            <span className="tag">Mode habituel domicile loisirs</span>
                                            <span className="tag is-primary">{carnet.mode_domicile_loisirs}</span>
                                        </div>
                                    </div>}
                                </div>
                                {carnet.geojson && <p className="subtitle mt-4">Trajets approximatifs et points noirs</p>}
                                {carnet.geojson && <div>
                                    <MarkerMap
                                        geoJSON={carnet.geojson}
                                        markerLat={carnet.point_noir_1_lat}
                                        markerLon={carnet.point_noir_1_lon}
                                        tooltip={carnet.point_noir_1}
                                        onZoneClick={setClickedFeature}
                                    />
                                </div>}
                                {clickedFeature && <p className="subtitle mt-4">Photo terrain (via Panoramax)</p>}
                                {clickedFeature && <PanoramaxFrame feature={clickedFeature}/>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            {carnet && <div className="card">
                <header className="card-header">
                    <p className="card-header-title">Ressenti usager</p>
                </header>
                {/* <div className="card-image">
                    <figure className="image is-4by3" style={{maxHeight: "250px", margin: "auto"}}>
                        <img src={modelPicturesMap[carnet.Model]} alt={carnet.Model} style={{objectFit: "cover"}}/>
                    </figure>
                </div> */}
                <div className="card-content">
                    <p className="title is-4">Bilan: {carnet.bilan}</p>
                    <p style={{whiteSpace: "pre-wrap"}}>{carnet.commentaires}</p>
                    <p className="title is-4">Avantages</p>
                    <div className="tags">
                        <span className={"tag " + (carnet.avantage_bien_etre ? "is-primary" : "")}>Bien être</span>
                        <span className={"tag " + (carnet.avantage_agilite ? "is-primary" : "")}>Agilité</span>
                        <span className={"tag " + (carnet.avantage_confort ? "is-primary" : "")}>Confort</span>
                        <span className={"tag " + (carnet.avantage_observation ? "is-primary" : "")}>Observation</span>
                        <span className={"tag " + (carnet.avantage_fierté ? "is-primary" : "")}>Fierté</span>
                        <span className={"tag " + (carnet.avantage_reactions ? "is-primary" : "")}>Réactions</span>
                        <span className={"tag " + (carnet.avantage_autre ? "is-primary" : "")}>Autre: {carnet.avantage_autre}</span>
                    </div>
                    <p className="title is-4">Difficultés</p>
                    <div className="tags">
                        <span className={"tag " + (carnet.difficulte_visibilite ? "is-primary" : "")}>Visibilité</span>
                        <span className={"tag " + (carnet.difficulte_amenagement ? "is-primary" : "")}>Aménagement</span>
                        <span className={"tag " + (carnet.difficulte_stationnement ? "is-primary" : "")}>Stationnement</span>
                        <span className={"tag " + (carnet.difficulte_vehicule ? "is-primary" : "")}>Véhicule</span>
                        <span className={"tag " + (carnet.difficulte_comportement ? "is-primary" : "")}>Comportement</span>
                        <span className={"tag " + (carnet.difficulte_autre ? "is-primary" : "")}>Autre: {carnet.difficulte_autre}</span>
                    </div>
                    <p className="title is-4">Points noirs</p>
                    <div className="columns">
                        <div className="column">
                            <p style={{whiteSpace: "pre-wrap"}}>{carnet.point_noir_1}</p>
                            <p style={{whiteSpace: "pre-wrap"}}>{carnet.point_noir_2}</p>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default Carnet