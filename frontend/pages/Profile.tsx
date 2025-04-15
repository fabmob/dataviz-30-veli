import React from "react"

import * as types from '../types'
import PieChart from "../components/PieChart"
import Carnet from "../components/Carnet"
import { modelPicturesMap } from "../constants"

const Select = ({options, selected, onChange}) => {
    return (
        <div className="select ml-2 mr-2">
            <select value={selected} onChange={(e) => onChange(e.target.value)}>
                {options.map((option, index) => <option key={index} value={option}>{option}</option>)}
            </select>
        </div>
    )
}

const Profile = () => {
    const scrollRef = React.useRef<null | HTMLHeadingElement>(null)
    const motifs = ["pour toutes raisons", "pour me rendre au travail", "pour mon travail", "pour mes loisirs", "pour faire mes courses", "pour mes enfants/famille", "pour aller chez le médecin"]
    const distances = ["toutes distances", "moins de 2 km", "entre 2 et 5 km", "entre 5 et 10 km", "entre 10 et 20 km", "plus de 20 km"]
    const permis = ["je conduis tout type de véhicule", "je préfère les véhicules sans permis"]
    const [profile, setProfile] = React.useState({motif: motifs[1], distance: distances[2], permis: permis[0]})
    const [carnet, setCarnet] = React.useState<null | types.CarnetType>(null)
    const [experiences, setExperiences] = React.useState<types.ExperiencesType>({})
    const onChange = (field, value) => {
        setProfile({...profile, [field]: value})
    }
    
    React.useEffect(() => {
        const fetchData = async () => {
            const experiences = await fetch(`/api/experiences?motif=${motifs.indexOf(profile.motif)}&distance=${distances.indexOf(profile.distance)}&permis=${permis.indexOf(profile.permis)}`)
            let experiencesJson: types.ExperiencesType = await experiences.json()
            Object.keys(experiencesJson).forEach(model => {
                experiencesJson[model].carnetEntries.sort(() => 0.5 - Math.random())
            })
            setExperiences(experiencesJson)
        }
        fetchData()
        setCarnet(null)
    }, [profile])

    const selectCarnet = (carnetEntry) => {
        setCarnet(carnetEntry)
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({block: "start", behavior: "smooth"})
        }
    }
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Filtre par profil
                        </h1>
                        <div style={{"lineHeight": "40px"}}>
                            Je me déplace 
                            <Select options={motifs} selected={profile.motif} onChange={(value) => onChange("motif", value)}/>
                            sur une distance de 
                            <Select options={distances} selected={profile.distance} onChange={(value) => onChange("distance", value)}/>
                            et 
                            <Select options={permis} selected={profile.permis} onChange={(value) => onChange("permis", value)}/>
                        </div>
                    </div>
                    {experiences && <div className="content">
                        <h2 className="subtitle">Les personnes avec un profil similaire ont partagé les expériences suivantes</h2>
                        <div className="grid is-col-min-8">
                            {Object.keys(experiences).map((model) => <div className="cell" key={model}> 
                                <div className="card">
                                    <div className="card-image">
                                        <figure className="image is-4by3" style={{maxHeight: "250px", margin: "auto"}}>
                                            <img src={modelPicturesMap[model]} alt={model} style={{objectFit: "cover"}}/>
                                        </figure>
                                    </div>
                                    <div className="card-content">
                                        <div className="media-content">
                                            <p className="title is-4">{model}</p>
                                        </div>

                                        <div className="content mt-4">
                                            <div className="field is-grouped is-grouped-multiline">
                                                <div className="control">
                                                    <div className="tags has-addons">
                                                        <span className="tag">Distance totale</span>
                                                        <span className="tag is-primary">{experiences[model].totalDistanceKm.toFixed(2)} km</span>
                                                    </div>
                                                </div>
                                                <div className="control">
                                                    <div className="tags has-addons">
                                                        <span className="tag">Nombre de trajets</span>
                                                        <span className="tag is-primary">{experiences[model].nbTrips}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <PieChart data={experiences[model].bilanData} label="Nombre" />

                                            {experiences[model].carnetEntries.slice(0, 5).map(carnetEntry => <div className="box is-clickable" key={carnetEntry.carnetEntryIndex} onClick={() => selectCarnet(carnetEntry)}>
                                                <article className="media">
                                                    <div className="media-content">
                                                        <div className="content" style={{maxHeight: "95px", overflow: "hidden"}}>
                                                            <p>
                                                            <strong>{carnetEntry.bilan}</strong>
                                                            <br />
                                                            {carnetEntry.commentaires}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </article>
                                            </div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                        </div>
                        <h2 className="subtitle" ref={scrollRef}>Zoom sur une expérience</h2>
                        {carnet && <Carnet carnetEntry={carnet}/>}
                    </div>}
                </div>
            </section>
        </div>
    )   
}

export default Profile