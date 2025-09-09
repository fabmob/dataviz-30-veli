import React from "react"
import { useParams, useNavigate } from "react-router"

import * as types from '../types'
import { VELIS } from '../constants'

import BarCharts from '../components/BarCharts'

const Vehicles = () => {
    const navigate = useNavigate()
    const [stats, setStats] = React.useState<null | types.VehicleHistoryType[]>(null)
    const [statsFiltered, setStatsFiltered] = React.useState<null | types.VehicleHistoryType[]>(null)
    const [sums, setSums] = React.useState({ nb_trips: 0, total_distance_km: 0, average_speed_kmh: 0 })
    const [licencePlate, setLicencePlate] = React.useState("GB418VP")
    const [lastNbDaysFilter, setLastNbDaysFilter] = React.useState(14)
    const [minDate, setMinDate] = React.useState(new Date().toISOString())
    React.useEffect(() => {
        const fetchData = async () => {
            const stats = await fetch('/api/vehicleStats/' + licencePlate)
            const statsJson = await stats.json()
            setStats(statsJson)
        }
        fetchData()
    }, [licencePlate])
    React.useEffect(() => {
        let _statsFiltered
        if (stats && lastNbDaysFilter > 0) {
            let startDate = new Date()
            startDate.setDate(startDate.getDate() - lastNbDaysFilter)
            _statsFiltered = stats.filter(d => d.day > startDate.toISOString())
            setMinDate(startDate.toISOString())
        } else {
            _statsFiltered = stats
            setMinDate("")
        }
        setStatsFiltered(_statsFiltered)
        if (_statsFiltered) {
            setSums({
                nb_trips: _statsFiltered.reduce((acc, cur) => acc + cur.nb_trips, 0),
                total_distance_km: _statsFiltered.reduce((acc, cur) => acc + cur.total_distance_km, 0),
                average_speed_kmh: (_statsFiltered.reduce((acc, cur) => acc + cur.average_speed_kmh, 0) / _statsFiltered.length) || 0
            })
        }
    }, [stats, lastNbDaysFilter])
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Détails par VELI
                        </h1>
                        <div style={{"lineHeight": "40px"}}>
                            Statistiques pour le VELI
                            <div className="select ml-2 mr-2">
                                <select value={licencePlate} onChange={(e) => setLicencePlate(e.target.value)}>
                                    {VELIS.map((veli, index) => <option key={index} value={veli.licencePlate}>{veli.name}</option>)}
                                </select>
                            </div>
                            au cours des
                            <div className="select ml-2 mr-2">
                                <select value={lastNbDaysFilter} onChange={(e) => setLastNbDaysFilter(parseInt(e.target.value))}>
                                    <option value={14}>14 derniers jours</option>
                                    <option value={30}>30 derniers jours</option>
                                    <option value={0}>Depuis le début</option>
                                </select>
                            </div>
                        </div>
                        {stats && stats.length && <div className="mt-4">
                            <div className="field is-grouped is-grouped-multiline">
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Lieu actuel du véhicule</span>
                                        <span className="tag is-primary">{stats[stats.length -1].location}</span>
                                    </div>
                                </div>
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Date du dernier trajet detecté</span>
                                        <span className="tag is-primary">{stats[stats.length -1].day}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="field is-grouped is-grouped-multiline">
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Nombre de trajets durant la période</span>
                                        <span className="tag is-primary">{sums.nb_trips}</span>
                                    </div>
                                </div>
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Distance parcourue durant la période</span>
                                        <span className="tag is-primary">{sums.total_distance_km.toFixed(2)} km</span>
                                    </div>
                                </div>
                                <div className="control">
                                    <div className="tags has-addons">
                                        <span className="tag">Vitesse moyenne durant la période</span>
                                        <span className="tag is-primary">{sums.average_speed_kmh.toFixed(2)} km/h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                        {statsFiltered && <div className="mt-4">
                            <BarCharts.HistoryBarChart data={statsFiltered} minDate={minDate} />
                        </div>}
                    </div>
                </div>
            </section>
        </div>
    )   
}
export default Vehicles
