const sqlite3 = require('better-sqlite3')
const fs = require('fs')
const h3 = require('h3-js')

const db = sqlite3('data.db')
const db_edits = sqlite3('data_edits.db')

const genGeojsonFromCoords = (coords) => {
    const H3_RESOLUTION = 9;

    // Convert coordinates to H3 indexes
    const hexagons = new Set(
        coords.map((coord) => h3.latLngToCell(coord.lat, coord.lon, H3_RESOLUTION))
    )

    // Convert hexagons to polygonal GeoJSON
    const features = [...hexagons].map((h3Index) => {
        const hexBoundary = h3.cellToBoundary(h3Index, true) // Get hex boundary as GeoJSON polygon
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [hexBoundary] // Flip lat/lng to lng/lat for GeoJSON
            },
            properties: { h3Index }
        }
    })

    // Create GeoJSON FeatureCollection
    return {
        type: "FeatureCollection",
        features
    }
}

const genCarnetCache = () => {
    const carnetQuery = db.prepare("select Model, vehicule, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, group_concat(distinct UniqueTripID) as uniqueTripIDs, territoire, heure_debut,heure_fin, carnetEntryIndex, moment, meteo_ensoleille, meteo_nuageux, meteo_pluvieux, meteo_venteux, meteo_neigeux, meteo_brouillard, meteo_autre, motif, avantage_aucun, avantage_agilite, avantage_confort, avantage_observation, avantage_fierté, avantage_reactions, avantage_bien_etre, avantage_autre, difficulte_aucune, difficulte_visibilite, difficulte_amenagement, difficulte_stationnement, difficulte_vehicule, difficulte_comportement, difficulte_autre, difficultes_details, point_noir_1, point_noir_2, bilan, commentaires, point_noir_1_lon, point_noir_1_lat, tourisme_avantages_detail, tourisme_difficulte_trafic, tourisme_difficulte_meteo, tourisme_difficulte_denivele, tourisme_difficulte_distance, tourisme_difficulte_autonomie, tourisme_difficulte_diff_vitesse, tourisme_difficulte_positionnement, tourisme_difficulte_intersection, tourisme_difficulte_depart_cote, tourisme_difficulte_fatigue, tourisme_difficulte_depassement, tourisme_difficulte_autre, tourisme_difficulte_detail from trips_with_carnet_match group by carnetEntryIndex")
    const carnets = carnetQuery.all()

    carnets.forEach((carnet) => {
        if (carnet.uniqueTripIDs) {
            const uniqueTripIDs = carnet.uniqueTripIDs.split(',')
            const coords = db.prepare(`select "Latitude(loc)" as lat, "Longitude(loc)" as lon from raw_with_trip_ids where UniqueTripID in (${uniqueTripIDs.map(e => '?').join(',')})`)
                .all(uniqueTripIDs)
            // carnet.geojson = genGeojsonFromCoords(coords)
            if (carnet.point_noir_1_lat) {
                carnet.cache_lat = carnet.point_noir_1_lat
                carnet.cache_lon = carnet.point_noir_1_lon
            } else if (coords.length) {
                const midCoord = coords[Math.floor(coords.length / 2)]
                carnet.cache_lat = midCoord.lat
                carnet.cache_lon = midCoord.lon
            }
        }
        const edits = db_edits.prepare("select field, value from carnets_edits where carnetEntryIndex = ?")
            .all(carnet.carnetEntryIndex)
        carnet.edits = edits.reduce((acc, edit) => {
            acc[edit.field] = edit.value
            return acc
        }, {})
        if (carnet.edits.commentaires !== undefined) {
            carnet.commentaires = carnet.edits.commentaires
        }
        delete carnet.uniqueTripIDs
    })
    
    fs.writeFileSync('public/cache/carnet_cache.json', JSON.stringify(carnets))
}

const genTripsInBboxCache = () => {
    const rows = db.prepare("select Model, location, group_concat(distinct carnetEntryIndex) as carnetEntryIndexes, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, min(StartTime) as firstTrip, max(StartTime) as lastTrip from trips_with_carnet_match " +
        "where location != 'En transit' " +
        "group by Model, location"
    ).all()
    fs.writeFileSync('public/cache/tripsInBbox_cache.json', JSON.stringify(rows))
}

const genTripStatsCache = () => {
    let locations = db.prepare("select distinct location from trips_with_carnet_match where location != 'En transit'").all().map(l => l.location)
    locations.push(null)

    let tripStatsCache = {}
    for (let i = 0; i < locations.length; i++) {
        let location = locations[i]
        let locationParam = "location != 'En transit'"
        if (location) {
            locationParam = `location = '${location}'`
        }
        const rows = db.prepare(`
            select Model, avg(TotalDistanceKm) as avgDistanceKm, count() as nbTrips
            from trips_with_carnet_match 
            where Model is not NULL and TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam}
            group by Model
        `).all()
        let stats = {
            models: {},
            trips_per_distance: {}
        }
        rows.forEach((row) => {
            stats.models[row.Model] = {
                avgDistanceKm: row.avgDistanceKm,
                nbTrips: row.nbTrips,
                medianDistanceKm: 0,
            }
        })
        const rows_travail = db.prepare(`
            select Model, avg(TotalDistanceKm) as avgDistanceKm, count() as nbTrips
            from trips_with_carnet_match 
            where Model is not NULL and TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam} and motif like '%ravail%'
            group by Model
        `).all()
        rows_travail.forEach((row) => {
            stats.models[row.Model].avgDistanceKmTravail = row.avgDistanceKm
            stats.models[row.Model].nbTripsTravail = row.nbTrips
        })
        const stmt = db.prepare(`
            select TotalDistanceKm as medianDistanceKm
            from trips_with_carnet_match
            where Model = ? and TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam}
            order by TotalDistanceKm
            LIMIT 1
            offset ?
        `)
        const stmt_travail = db.prepare(`
            select TotalDistanceKm as medianDistanceKm
            from trips_with_carnet_match
            where Model = ? and TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam} and motif like '%ravail%'
            order by TotalDistanceKm
            LIMIT 1
            offset ?
        `)
        for (let i = 0; i < Object.keys(stats.models).length; i++) {
            const model = Object.keys(stats.models)[i]
            if (stats.models[model].nbTrips > 1) {
                let row = stmt.get(model, Math.ceil(stats.models[model].nbTrips / 2))
                stats.models[model].medianDistanceKm = row.medianDistanceKm
                const nbTripsTravail = stats.models[model].nbTripsTravail || 0
                if (nbTripsTravail > 1) {
                    let row_travail = stmt_travail.get(model, Math.ceil(nbTripsTravail / 2))
                    stats.models[model].medianDistanceKmTravail = row_travail.medianDistanceKm
                }
            }
        }
        const trips_per_distance = db.prepare(`
            select round(TotalDistanceKm / 5)*5 as range_id, count() as nbTrips
            from trips_with_carnet_match
            where TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam}
            group by range_id
        `).all()
        trips_per_distance.forEach((row) => {
            stats.trips_per_distance[row.range_id] = row.nbTrips
        })
        if (!location) {
            location = "Tous"
        }
        tripStatsCache[location] = stats
    }
    fs.writeFileSync('public/cache/tripStats_cache.json', JSON.stringify(tripStatsCache))
}

const getMostFrequentBilan = (bilans) => {
  if (bilans.length === 0) return "N/A"
  const mostFrequent = Array.from(new Set(bilans)).reduce((prev, curr) =>
    bilans.filter(el => el === curr).length > bilans.filter(el => el === prev).length ? curr : prev
  )
  return mostFrequent
}

genVehicleStatsCache = async () => {
    let vehicleStatsCache = {}
    const plates = db.prepare('select distinct "Licence plate" from trips_with_carnet_match where "Licence plate" not null').all().map(l => l['Licence plate'])
    const stmt = db.prepare(`
        select date(StartTime) as day, "Licence plate", Model, location, count(distinct UniqueTripID) as nb_trips, sum(TotalDistanceKm) as total_distance_km, group_concat(AvgSpeed) as average_speed_concat, group_concat(bilan) as bilan_concat
        from trips_with_carnet_match 
        where StartTime not null and location != 'En transit' and "Licence plate" = ?
        group by day
    `)
    for (let i = 0; i < plates.length; i++) {
        const plate = plates[i]
        let rows = stmt.all(plate)
        rows = rows.map(row => {
            const credibleSpeeds = row?.average_speed_concat?.split(',').map(s => parseFloat(s)).filter(s => s > 5) || []
            row.average_speed_kmh = credibleSpeeds.reduce((acc, cur) => acc + cur, 0) / credibleSpeeds.length
            delete row.average_speed_concat
            const bilans = row?.bilan_concat?.split(',') || []
            row.most_frequent_bilan = getMostFrequentBilan(bilans)
            delete row.bilan_concat
            return row
        })
        vehicleStatsCache[plate] = rows
    }
    fs.writeFileSync('public/cache/vehicleStats_cache.json', JSON.stringify(vehicleStatsCache))
}


genCarnetCache()
genTripsInBboxCache()
genTripStatsCache()
genVehicleStatsCache()