import React, { useState, useEffect } from "react"
import * as types from "../types"
import { modelPicturesMap, wikiLinks } from "../constants"
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
    const getRessentiClassName = (ressenti) => {
        if (!ressenti || ressenti === "0.0"|| ressenti == "0") return "tag"
        return "tag is-primary"
    }
    let isTourism = carnet && (
        carnet.tourisme_avantages_detail ||
        carnet.tourisme_difficulte_trafic ||
        carnet.tourisme_difficulte_meteo ||
        carnet.tourisme_difficulte_denivele ||
        carnet.tourisme_difficulte_distance ||
        carnet.tourisme_difficulte_autonomie ||
        carnet.tourisme_difficulte_diff_vitesse ||
        carnet.tourisme_difficulte_positionnement ||
        carnet.tourisme_difficulte_intersection ||
        carnet.tourisme_difficulte_depart_cote ||
        carnet.tourisme_difficulte_fatigue ||
        carnet.tourisme_difficulte_depassement ||
        carnet.tourisme_difficulte_autre
    )
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
                                <p className="title is-4">
                                    <a href={wikiLinks[carnet.territoire]} title="En savoir plus sur l'expérimentation du territoire">{carnet.territoire}</a>
                                </p>
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
                        <span className={getRessentiClassName(carnet.avantage_bien_etre)}>Bien être</span>
                        <span className={getRessentiClassName(carnet.avantage_agilite)}>Agilité</span>
                        <span className={getRessentiClassName(carnet.avantage_confort)}>Confort</span>
                        <span className={getRessentiClassName(carnet.avantage_observation)}>Observation</span>
                        <span className={getRessentiClassName(carnet.avantage_fierté)}>Fierté</span>
                        <span className={getRessentiClassName(carnet.avantage_reactions)}>Réactions</span>
                        <span className={getRessentiClassName(carnet.avantage_autre)}>Autre: {carnet.avantage_autre}</span>
                    </div>
                    {carnet.tourisme_avantages_detail && <p style={{whiteSpace: "pre-wrap"}}>{carnet.tourisme_avantages_detail}</p>}
                    <p className="title is-4">Difficultés</p>
                    {isTourism ? <div className="tags">
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_trafic)}>Trafic</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_meteo)}>Météo</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_denivele)}>Route (dénivelé)</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_distance)}>Distance</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_autonomie)}>Autonomie</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_diff_vitesse)}>Vitesse des autres</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_positionnement)}>Positionnement sur route</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_intersection)}>Intersections</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_depart_cote)}>Départ en côte</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_fatigue)}>Fatigue</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_depassement)}>Dépassement</span>
                        <span className={getRessentiClassName(carnet.tourisme_difficulte_autre)}>Autre</span>
                    </div>
                    : <div className="tags">
                        <span className={getRessentiClassName(carnet.difficulte_visibilite)}>Visibilité</span>
                        <span className={getRessentiClassName(carnet.difficulte_amenagement)}>Aménagement</span>
                        <span className={getRessentiClassName(carnet.difficulte_stationnement)}>Stationnement</span>
                        <span className={getRessentiClassName(carnet.difficulte_vehicule)}>Véhicule</span>
                        <span className={getRessentiClassName(carnet.difficulte_comportement)}>Comportement</span>
                        <span className={getRessentiClassName(carnet.difficulte_autre)}>Autre: {carnet.difficulte_autre}</span>
                    </div>}
                    {carnet.tourisme_difficulte_detail && <p style={{whiteSpace: "pre-wrap"}}>{carnet.tourisme_difficulte_detail}</p>}
                    {carnet.difficultes_details && <p style={{whiteSpace: "pre-wrap"}}>{carnet.difficultes_details}</p>}
                    {(carnet.point_noir_1 || carnet.point_noir_2) && <p className="title is-4">Points noirs</p>}
                    {(carnet.point_noir_1 || carnet.point_noir_2) && <div className="columns">
                        <div className="column">
                            <p style={{whiteSpace: "pre-wrap"}}>{carnet.point_noir_1}</p>
                            <p style={{whiteSpace: "pre-wrap"}}>{carnet.point_noir_2}</p>
                        </div>
                    </div>}
                </div>
            </div>}
        </div>
    )
}

export default Carnet