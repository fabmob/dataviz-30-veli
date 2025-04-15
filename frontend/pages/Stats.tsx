import React from "react"
import { useParams, useNavigate } from "react-router"

import * as types from '../types'
import { locations } from '../constants'

const Stats = () => {
    const navigate = useNavigate()
    const [stats, setStats] = React.useState<null | types.StatsType>(null)
    const [statsLocation, setStatsLocation] = React.useState(useParams().location || "")
    React.useEffect(() => {
        const fetchData = async () => {
            const stats = await fetch('/api/stats/' + statsLocation)
            setStats(await stats.json())
        }
        fetchData()
    }, [statsLocation])
    const handleSelect = (e) => {
        const location = e.target.value === "Tous" ? "" : e.target.value
        setStatsLocation(location)
        navigate(`/stats/${location}`)
    }
    const isEmbed = window.location.search.includes("embed=true")
    const exportIframeText = `<iframe src="https://30veli.fabmob.io/stats/${encodeURI(statsLocation)}?embed=true" width="100%" height="600px" frameborder="0" scrolling="no"></iframe>`
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Expérimentation 30 VELI, statistiques générales {statsLocation && `(${statsLocation})`}
                        </h1>
                        
                        {stats &&<div className="block">
                            <div className="field is-grouped is-grouped-multiline">
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag is-dark is-medium">Date du trajet le plus ancien</span>
                                        <span className="tag is-info is-medium">{new Date(stats.firstTrip).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag is-dark is-medium">Date du trajet dernier trajet analysé</span>
                                        <span className="tag is-info is-medium">{new Date(stats.lastTrip).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="control field">
                                <div className="tags has-addons">
                                    <span className="tag is-dark is-medium">Nombre total de trajets</span>
                                    <span className="tag is-info is-medium">{stats.actifs.nbTrips + stats.passifs.nbTrips}</span>
                                </div>
                            </div>
                            <div className="control field">
                                <div className="tags has-addons">
                                    <span className="tag is-dark is-medium">Nombre de km parcourus en vélis passifs</span>
                                    <span className="tag is-info is-medium">{stats.passifs.totalDistanceKm.toFixed(2)} km</span>
                                </div>
                            </div>
                            <div className="control field">
                                <div className="tags has-addons">
                                    <span className="tag is-dark is-medium">Nombre de km parcourus en vélis actifs</span>
                                    <span className="tag is-info is-medium">{stats.actifs.totalDistanceKm.toFixed(2)} km</span>
                                </div>
                            </div>
                        </div>}
                        {isEmbed && <p><a href="https://30veli.fabmob.io/"><i className="fa fa-link"></i> Consultez le site de l'expérimentation pour en savoir plus.</a></p>}
                    </div>
                </div>
            </section>
            {!isEmbed && <section className="section">
                <div className="container">
                    <div className="content">
                        <h2 className="subtitle">
                            <i className="fa fa-code"></i> Intégrer les statistiques dans votre site
                        </h2>
                        <div className="field">
                            <label className="label">Choix du territoire</label>
                            <div className="control">
                                <div className="select">
                                <select value={statsLocation} onChange={handleSelect}>
                                    {locations.map((location, index) => <option key={index} value={location}>{location}</option>)}
                                </select>
                                </div>
                            </div>
                        </div>
                        <textarea className="textarea" readOnly value={exportIframeText} />
                    </div>
                </div>
            </section>}
        </div>
    )   
}
export default Stats