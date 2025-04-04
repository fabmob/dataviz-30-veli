const { BrowserRouter, Route, Switch, Link, useParams, useHistory } = ReactRouterDOM
const { useEffect, useRef, useState, useContext } = React

const SettingsContext = React.createContext(null)

const modelPicturesMap = {
    "Tous": "",
    "BIRO": "images/BIRO.png",
    "Cyclospace": "images/Cyclospace.jpg",
    "Formidable": "images/Formidable.png",
    "Frikar": "images/Frikar.png",
    "Karbikes": "images/Karbikes.jpg",
    "Urbaner": "images/Urbaner.jpeg",
    "WEEZ": "images/WEEZ.png",
    "Woodybus": "images/Woodybus.png",
    "Acticycle": "images/Acticycle.png"
}

const locations = [
    "Tous",
    "CC 7 Vallées",
    "CC Clunisois",
    "CC Grand Pic St Loup",
    "Commune de Tressin",
    "Commune des Mureaux",
    "Commune du Teil",
    "PNR Grand Causses",
    "Lalouvesc",
    "Loos en Gohelle"
]

const SettingsModal = () => {
    const { settings, setSettings } = useContext(SettingsContext)
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <div className={`modal ${settings.show ? "is-active" : ""}`} style={{zIndex: 1010}}>
            <div className="modal-background" onClick={() => setSettings({...settings, show: false})}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Paramètres</p>
                    <button className="delete" onClick={() => setSettings({...settings, show: false})}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label">Territoire</label>
                        <div className="select">
                            <select value={settings.location} onChange={(e) => setSettings({...settings, location: e.target.value})}>
                                {locations.map((location, index) => <option key={index} value={location}>{location}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">VELI</label>
                        <div className="select">
                            <select value={settings.model} onChange={(e) => setSettings({...settings, model: e.target.value})}>
                                {Object.keys(modelPicturesMap).map((model, index) => <option key={index} value={model}>{model}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Afficher uniquement les expériences avec un point noir géolocalisé</label>
                        <div className="select">
                            <select value={settings.showOnlyPointNoir} onChange={(e) => setSettings({...settings, showOnlyPointNoir: e.target.value})}>
                                <option value="false">Non</option>
                                <option value="true">Oui</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

const NavBar = () => {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    // if embed mode, don't show header
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item" to="/">
                    <h1>Dataviz 30 VELI</h1>
                </Link>

                <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={_ => setShowMobileNavBar(!showMobileNavBar)}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navbarBasicExample" className={"navbar-menu " + (showMobileNavBar ? "is-active" : "")}>
                <div className="navbar-start">
                    <Link className="navbar-item" to="/">
                        Vue d'ensemble
                    </Link>
                    <Link to="/profile" className="navbar-item">
                        Filtre par profil usager
                    </Link>
                    <Link to="/stats" className="navbar-item">
                        Statistiques
                    </Link>
                </div>
            </div>
        </nav>
    )
}

const pieColors = {
    "Très positif": "rgb(72, 199, 142)",
    "Positif": "rgb(66, 88, 255)",
    "Négatif": "rgb(255, 183, 15)",
    "Très négatif": "rgb(255, 102, 133)",
    "Trajets sans bilan": "rgb(170, 170, 170)"
}
const PieChart = ({ data, label }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    useEffect(() => {
        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d')
          let sortedEntries = Object.keys(pieColors).map(bilan => data[bilan] ? [bilan, data[bilan]] : null).filter(e => e)
          const chartData = {
            labels: sortedEntries.map(([key, value]) => `${key} (${value})`),
            datasets: [{
              label: label || '',
              data: sortedEntries.map(([key, value]) => value),
              backgroundColor: sortedEntries.map(([key, value]) => pieColors[key])
            }]
          };
          if (chartInstanceRef.current) {
            // Update existing chart
            chartInstanceRef.current.data = chartData;
            chartInstanceRef.current.update();
          } else {
            // Create new chart
            chartInstanceRef.current = new Chart(ctx, {
              type: 'pie',
              data: chartData,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom"
                  }
                }
              }
            });
          }
        }
  
      // Clean up function to destroy the chart instance on component unmount
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      };
    }, [data]); 
  
    return (
      <div style={{height: "150px"}}>
        <canvas ref={chartRef} width="300" style={{"margin": "auto"}}></canvas>
      </div>
    )
  }
const HeatMap = ({onMapMove, onMarkerClick}) => {
    const { settings, setSettings } = useContext(SettingsContext)
    const location = settings.location
    const model = settings.model
    const showOnlyPointNoir = settings.showOnlyPointNoir
    const mapContainerRef = useRef(null)
    const [map, setMap] = useState(null)
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
            const initializedMap = L.map(mapContainerRef.current, { preferCanvas: true, layers: [default_basemap] }).setView(centerPoint, zoomLevel)
            const layerControl = L.control.layers(baseMaps).addTo(initializedMap)
            
            initializedMap._layerControl = layerControl
            initializedMap.on('moveend', function() { 
                onMapMove(initializedMap.getBounds())
           })
            setMap(initializedMap)
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
            "heatlayer": null,
            "markers": []
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

const MarkerMap = ({geoJSON, markerLat, markerLon, tooltip}) => {
    const mapContainerRef = useRef(null)
    const map = useRef(null)
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
            const initializedMap = L.map(mapContainerRef.current, { preferCanvas: true, layers: [default_basemap] }).setView(centerPoint, zoomLevel)
            const layerControl = L.control.layers(baseMaps).addTo(initializedMap)
            initializedMap._layerControl = layerControl
            if (markerLat) L.marker([markerLat, markerLon]).bindTooltip(tooltip).addTo(initializedMap)
            if (geoJSON) {
                L.geoJSON(geoJSON).addTo(initializedMap)
            }
            map.current = initializedMap
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

const Carnet = ({carnetIndex, carnetEntry}) => {
    const [carnet, setCarnet] = useState(null)
    const [editComment, setEditComment] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            const carnet = await fetch('/api/carnet/' + carnetIndex)
            let carnetJson = await carnet.json()
            console.log(carnetJson)
            setCarnet(carnetJson)
        }
        if (carnetEntry) {
            setCarnet(carnetEntry)
        } else {
            fetchData()
        }
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
                        ? <button className="button is-small is-success" onClick={() => {setEditComment(false); saveEdit("comment", carnet.edits.comment)}}>Enregistrer</button>
                        : <button className="button is-small is-info" onClick={() => setEditComment(true)}>Modifier</button>
                    }
                </div>
                <div className="message-body">
                    {editComment
                        ? <textarea className="textarea" value={carnet.edits.comment} onChange={(e) => setCarnet({...carnet, edits: {...carnet.edits, comment: e.target.value}})}></textarea>
                        : <p>{carnet.edits.comment}</p>
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
                                    <MarkerMap geoJSON={carnet.geojson} markerLat={carnet.point_noir_1_lat} markerLon={carnet.point_noir_1_lon} tooltip={carnet.point_noir_1}/>
                                </div>}
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

const Home = () => {
    const { settings, setSettings } = useContext(SettingsContext)
    const location = settings.location
    const model = settings.model
    const history = useHistory()
    const [mapBounds, setMapBounds] = useState({
        sw: {lat: 37.9961626797281, lng: -27.2900390625},
        ne: {lat: 53.2257684357902, lng: 31.7724609375}
    })
    const [stats, setStats] = useState([])
    const [carnetIndex, setCarnetIndex] = useState(useParams().carnetIndex)
    const [tab, setTab] = useState(carnetIndex ? "carnets" : "stats")
    useEffect(() => {
        const fetchData = async () => {
            if (mapBounds && tab === "stats") {
                const stats = await fetch(`/api/tripsInBbox?southWestLat=${mapBounds.sw.lat}&northEastLat=${mapBounds.ne.lat}&southWestLon=${mapBounds.sw.lng}&northEastLon=${mapBounds.ne.lng}&location=${location}&model=${model}`) 
                const statsJson = await stats.json()
                console.log(statsJson)
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
        history.push(`/${carnetIndex}`, {shallow: true})
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
                        <p>Ce tableau bord partage des statistiques générales sur les voyages à bord de ces véhicules, mesurées à partir de capteurs embarqués, ainsi que les expériences des testeurs issus de questionnaires.</p>
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
                        <HeatMap onMapMove={onMapMove} onMarkerClick={onMarkerClick}/>
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

                                            <PieChart data={stat.bilanData} label="Nombre" />
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                        </div>}
                        {tab == "carnets" && <Carnet carnetIndex={carnetIndex}/>}
                    </div>
                </div>
            </section>
        </div>
    )   
}
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
    const scrollRef = React.useRef(null)
    const motifs = ["pour toutes raisons", "pour me rendre au travail", "pour mon travail", "pour mes loisirs", "pour faire mes courses", "pour mes enfants/famille", "pour aller chez le médecin"]
    const distances = ["toutes distances", "moins de 2 km", "entre 2 et 5 km", "entre 5 et 10 km", "entre 10 et 20 km", "plus de 20 km"]
    const permis = ["je conduis tout type de véhicule", "je préfère les véhicules sans permis"]
    const [profile, setProfile] = React.useState({motif: motifs[1], distance: distances[2], permis: permis[0]})
    const [carnet, setCarnet] = React.useState(null)
    const [experiences, setExperiences] = React.useState({})
    const onChange = (field, value) => {
        setProfile({...profile, [field]: value})
    }
    
    React.useEffect(() => {
        const fetchData = async () => {
            const experiences = await fetch(`/api/experiences?motif=${motifs.indexOf(profile.motif)}&distance=${distances.indexOf(profile.distance)}&permis=${permis.indexOf(profile.permis)}`)
            let experiencesJson = await experiences.json()
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
        scrollRef.current.scrollIntoView({block: "start", behavior: "smooth"})
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

const Stats = () => {
    const history = useHistory()
    const [stats, setStats] = React.useState(null)
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
        history.push(`/stats/${location}`, {shallow: true})
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
                        {isEmbed && <p><a href="https://30veli.fabmob.io/"><i class="fa fa-link"></i> Consultez le site de l'expérimentation pour en savoir plus.</a></p>}
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

const Footer = () => {
    // if embed mode, don't show footer
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <footer className="footer">
            <div className="content has-text-centered">
                <p>
                    Un site proposé en <a href="https://github.com/fabmob/dataviz-30-veli">open source</a> par <a href="https://lafabriquedesmobilites.fr/">la Fabrique des Mobilités</a>.
                </p>
            </div>
        </footer>
    )
}

const App = () => {
    const [settings, setSettings] = React.useState({
        show: false,
    })
    return (
        <BrowserRouter>
            <SettingsContext.Provider value={{ settings, setSettings }}>
                <SettingsModal />
                <NavBar />
                <Switch>
                    <Route path="/profile">
                        <Profile/>
                    </Route>
                    <Route path="/stats/:location">
                        <Stats/>
                    </Route>
                    <Route path="/stats">
                        <Stats/>
                    </Route>
                    <Route path="/:carnetIndex">
                        <Home/>
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
                <Footer />
            </SettingsContext.Provider>
        </BrowserRouter>
    )
}

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)
root.render(<App />)