import React from "react"
import { useParams, useNavigate } from "react-router"

import * as types from '../types'
import { locations } from '../constants'

import BarCharts from '../components/BarCharts'

const Stats = () => {
    const navigate = useNavigate()
    const [stats, setStats] = React.useState<null | types.StatsType>(null)
    const [tripStats, setTripStats] = React.useState<null | types.TripsStatsType>(null)
    const [statsLocation, setStatsLocation] = React.useState(useParams().location || "")
    React.useEffect(() => {
        const fetchData = async () => {
            const stats = await fetch('/api/stats/' + statsLocation)
            setStats(await stats.json())
            const tripStats = await fetch('/api/tripStats/' + statsLocation).then(res => res.json())
            setTripStats(tripStats)
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
                        {!isEmbed && <div className="field">
                            <label className="label">Choix du territoire</label>
                            <div className="control">
                                <div className="select">
                                <select value={statsLocation} onChange={handleSelect}>
                                    {locations.map((location, index) => <option key={index} value={location}>{location}</option>)}
                                </select>
                                </div>
                            </div>
                        </div>}

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
                                        <span className="tag is-dark is-medium">Date du dernier trajet analysé</span>
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
                        <h3 className="subtitle">
                            <i className="fa fa-code"></i> Intégrer les statistiques générales dans votre site
                        </h3>
                        <textarea className="textarea" readOnly value={exportIframeText} />
                    </div>
                </div>
            </section>}
            {!isEmbed && <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="subtitle">
                            <i className="fa fa-chart-line"></i> Statistiques détaillées par trajet
                        </h1>
                        <p>
                            Seuls les trajets entre 100 m et 100 km sont considérés afin limiter les erreurs de mesure. Toutefois, une part importante des trajets très courts peuvent être dus à des imprécisions de capteurs. (Cliquez sur une légende pour la masquer).
                        </p>
                        <div className="columns">
                            <div className="column">
                                {tripStats && <BarCharts.TripModelBarChart data={tripStats.models} workFilter={false} />}
                            </div>
                            <div className="column">
                                {tripStats && <BarCharts.TripModelBarChart data={tripStats.models} workFilter={true} />}
                            </div>
                        </div>
                        <div>
                            {tripStats && <BarCharts.TripDistanceBarChart data={tripStats.trips_per_distance} />}
                        </div>
                    </div>
                </div>
            </section>}
        </div>
    )   
}
export default Stats
