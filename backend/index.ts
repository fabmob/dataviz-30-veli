import express from "express"
import cors from "cors"
import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import h3 from "h3-js"
import csv_stringify from "csv-stringify/sync"

const port = process.env.PORT || 8081;
const db = new Database('data.db')
const db_edits = new Database('data_edits.db')
const app = express()
app.use(express.json())
app.use(cors())

db_edits.prepare("create table if not exists carnets_edits (carnetEntryIndex text, field text, value text, unique(carnetEntryIndex, field))").run()

const genGeojsonFromCoords = (coords: { lat: number, lon: number }[]) => {
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
interface CarnetCoordType {
    lat: number,
    lon: number,
    carnetEntryIndex: string,
    bilan: string,
    vehicule: string,
    isPointNoir: boolean
}
app.get('/api/heatmapdata', (req, res) => {
    const location = (req.query.location === "undefined" || req.query.location === "Tous") ? null : req.query.location
    const model = (req.query.model === "undefined" || req.query.model === "Tous") ? null : req.query.model
    let query = `select carnetEntryIndex, coords, point_noir_1_lat, point_noir_1_lon, bilan, vehicule from trips_with_carnet_match where carnetEntryIndex not null and vehicule != 'Golf6'`
    if (location) {
        query += ` and location = '${location}'`
    }
    if (model) {
        query += ` and Model = '${model}'`
    }
    query += ` group by carnetEntryIndex`
    const carnetRows = db.prepare(query).all() as { carnetEntryIndex: string, point_noir_1_lat: number, point_noir_1_lon: number, bilan: string, vehicule: string, coords: string }[]
    let carnetCoords : CarnetCoordType[] = []
    for (let i = 0; i < carnetRows.length; i++) {
        const carnetRow = carnetRows[i]
        if (carnetRow.point_noir_1_lat) {
            carnetCoords.push({lat: carnetRow.point_noir_1_lat, lon: carnetRow.point_noir_1_lon, carnetEntryIndex: carnetRow.carnetEntryIndex, bilan: carnetRow.bilan, vehicule: carnetRow.vehicule, isPointNoir: true})
        } else if (carnetRow.coords) {
            const coords = JSON.parse(carnetRow.coords.replace(/\(/g, "[").replace(/\)/g, "]"))
            const midCoord = coords[Math.floor(coords.length / 2)]
            carnetCoords.push({lat: midCoord[0], lon: midCoord[1], carnetEntryIndex: carnetRow.carnetEntryIndex, bilan: carnetRow.bilan, vehicule: carnetRow.vehicule, isPointNoir: false})
        }
    }
    let jsonFile = "heatmaps/" + (location ? location : 'all')
    jsonFile += '/' + (model ? model : 'all') + '.json'
    let heatmapjson
    try {
        heatmapjson = JSON.parse(fs.readFileSync(jsonFile).toString())
    } catch (error) {
        heatmapjson = {}
    }
    res.json({heatmapjson, carnetCoords})
})

interface Carnet {
    Model: string,
    vehicule: string,
    totalDistanceKm: number,
    nbTrips: number,
    uniqueTripIDs: string,
    territoire: string,
    heure_debut: string,
    heure_fin: string,
    carnetEntryIndex: string,
    moment: string,
    meteo_ensoleille: number,
    meteo_nuageux: number,
    meteo_pluvieux: number,
    meteo_venteux: number,
    meteo_neigeux: number,
    meteo_brouillard: number,
    meteo_autre: number,
    motif: string,
    avantage_aucun: number,
    avantage_agilite: number,
    avantage_confort: number,
    avantage_observation: number,
    avantage_fierté: number,
    avantage_reactions: number,
    avantage_bien_etre: number,
    avantage_autre: number,
    tourisme_avantages_detail?: number, 
    difficulte_aucune: number,
    difficulte_visibilite: number,
    difficulte_amenagement: number,
    difficulte_stationnement: number,
    difficulte_vehicule: number,
    difficulte_comportement: number,
    difficulte_autre: number,
    tourisme_difficulte_trafic?: number,
    tourisme_difficulte_meteo?: number,
    tourisme_difficulte_denivele?: number,
    tourisme_difficulte_distance?: number,
    tourisme_difficulte_autonomie?: number,
    tourisme_difficulte_diff_vitesse?: number,
    tourisme_difficulte_positionnement?: number,
    tourisme_difficulte_intersection?: number,
    tourisme_difficulte_depart_cote?: number,
    tourisme_difficulte_fatigue?: number,
    tourisme_difficulte_depassement?: number,
    tourisme_difficulte_autre?: number,
    tourisme_difficulte_detail?: string,
    point_noir_1: number,
    point_noir_2: number,
    bilan: string,
    commentaires: string,
    point_noir_1_lon: number,
    point_noir_1_lat: number,
    geojson?: { type: string, features: { type: string, geometry: { type: string, coordinates: number[][][] }, properties: { h3Index: string } }[] }
    edits?: { [key: string]: string },
    mode_domicile_travail?: string,
    mode_domicile_etudes?: string,
    mode_domicile_loisirs?: string
}
app.get('/api/carnet/:carnetIndex', (req, res) => {
    const carnet = db.prepare("select Model, vehicule, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, group_concat(distinct UniqueTripID) as uniqueTripIDs, territoire, heure_debut,heure_fin, carnetEntryIndex, moment, meteo_ensoleille, meteo_nuageux, meteo_pluvieux, meteo_venteux, meteo_neigeux, meteo_brouillard, meteo_autre, motif, avantage_aucun, avantage_agilite, avantage_confort, avantage_observation, avantage_fierté, avantage_reactions, avantage_bien_etre, avantage_autre, difficulte_aucune, difficulte_visibilite, difficulte_amenagement, difficulte_stationnement, difficulte_vehicule, difficulte_comportement, difficulte_autre, point_noir_1, point_noir_2, bilan, commentaires, point_noir_1_lon, point_noir_1_lat, tourisme_avantages_detail, tourisme_difficulte_trafic, tourisme_difficulte_meteo, tourisme_difficulte_denivele, tourisme_difficulte_distance, tourisme_difficulte_autonomie, tourisme_difficulte_diff_vitesse, tourisme_difficulte_positionnement, tourisme_difficulte_intersection, tourisme_difficulte_depart_cote, tourisme_difficulte_fatigue, tourisme_difficulte_depassement, tourisme_difficulte_autre, tourisme_difficulte_detail from trips_with_carnet_match where carnetEntryIndex = ? group by carnetEntryIndex")
        .get(req.params.carnetIndex) as Carnet
    if (carnet.uniqueTripIDs) {
        const uniqueTripIDs = carnet.uniqueTripIDs.split(',')
        const coords = db.prepare(`select "Latitude(loc)" as lat, "Longitude(loc)" as lon from raw_with_trip_ids where UniqueTripID in (${uniqueTripIDs.map(e => '?').join(',')})`)
            .all(uniqueTripIDs) as { lat: number, lon: number }[]
        carnet.geojson = genGeojsonFromCoords(coords)
    }
    const edits = db_edits.prepare("select field, value from carnets_edits where carnetEntryIndex = ?")
        .all(req.params.carnetIndex) as { field: string, value: string }[]
    carnet.edits = edits.reduce((acc : { [key: string]: string }, edit) => {
        acc[edit.field] = edit.value
        return acc
    }, {})
    if (carnet.edits.commentaires !== undefined) {
        carnet.commentaires = carnet.edits.commentaires
    }
    res.json(carnet)
})

app.put('/api/carnet/:carnetIndex/:field', (req, res) => {
    db.prepare("insert or replace into carnets_edits (carnetEntryIndex, field, value) values (?, ?, ?)").run(req.params.carnetIndex, req.params.field, req.body.value)
    res.json({status: "ok"})
})

interface TripsInBboxType {
    Model: string,
    carnetEntryIndexes: string,
    totalDistanceKm: number,
    nbTrips: number,
    carnetEntries?: { carnetEntryIndex: string, bilan: string, commentaires: string }[]
}
interface TripInBboxQueryType {
    southWestLat: string,
    northEastLat: string,
    southWestLon: string,
    northEastLon: string,
    location?: string,
    model?: string
}
app.get('/api/tripsInBbox', (req, res) => {
    const location = (req.query.location === "undefined" || req.query.location === "Tous") ? null : req.query.location
    const model = (req.query.model === "undefined" || req.query.model === "Tous") ? null : req.query.model
    const southWestLat = parseFloat(req.query.southWestLat as string || "0")
    const northEastLat = parseFloat(req.query.northEastLat as string || "0")
    const southWestLon = parseFloat(req.query.southWestLon as string || "0")
    const northEastLon = parseFloat(req.query.northEastLon as string || "0")
    const rows = db.prepare("select Model, group_concat(distinct carnetEntryIndex) as carnetEntryIndexes, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips from trips_with_carnet_match where UniqueTripID in " +
        `(select DISTINCT UniqueTripID from raw_with_trip_ids where "Latitude(loc)" BETWEEN ? and ? and "Longitude(loc)" BETWEEN ? and ?) ` +
        (location ? ` and location = '${location}' ` : "") +
        (model ? ` and Model = '${model}' ` : "") +
        "group by Model"
    ).all(southWestLat, northEastLat, southWestLon, northEastLon) as TripsInBboxType[]
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (row.carnetEntryIndexes) {
            const carnetEntryIndexes = row.carnetEntryIndexes.split(',')
            const stmt = db.prepare("select carnetEntryIndex, bilan, commentaires from trips_with_carnet_match where carnetEntryIndex in (" + carnetEntryIndexes.map(e => "?").join(',') + ") group by carnetEntryIndex")
            row.carnetEntries = stmt.all(carnetEntryIndexes) as { carnetEntryIndex: string, bilan: string, commentaires: string }[]
            const stmt_comment_edits = db_edits.prepare("select carnetEntryIndex, value as commentaires from carnets_edits where field = 'commentaires' and carnetEntryIndex in (" + carnetEntryIndexes.map(e => "?").join(',') + ") group by carnetEntryIndex")
            const allCommentEdits = stmt_comment_edits.all(carnetEntryIndexes) as { carnetEntryIndex: string, commentaires: string }[]
            for (let j = 0; j < allCommentEdits.length; j++) {
                const commentEdit = allCommentEdits[j]
                for (let k = 0; k < row.carnetEntries.length; k++) {
                    if (row.carnetEntries[k].carnetEntryIndex === commentEdit.carnetEntryIndex) {
                        row.carnetEntries[k].commentaires = commentEdit.commentaires
                    }
                }
            }
        } else {
            row.carnetEntries = []
        }
    }
    res.json(rows)
})
const modelTypeMap = {
    "BIRO": "Passif",
    "WEEZ": "Passif",
    "Karbikes": "Actif",
    "Frikar": "Actif",
    "Urbaner": "Actif",
    "Formidable": "Actif",
    "Woodybus": "Actif",
    "Cyclospace": "Actif",
    "Acticycle": "Actif",
}
interface StatsRow {
    Model: keyof typeof modelTypeMap,
    totalDistanceKm: number,
    nbTrips: number,
    firstTrip: string,
    lastTrip: string
}
interface Stats {
    models: { [key: string]: { totalDistanceKm: number, nbTrips: number, type: string } },
    actifs: {
        totalDistanceKm: number,
        nbTrips: number
    },
    passifs: {
        totalDistanceKm: number,
        nbTrips: number
    },
    firstTrip: string,
    lastTrip: string
}
const stats_cache : { [key: string]: Stats } = {}
const fetchStats = (location?: string) => {
    if (location) {
        if (stats_cache[location]) {
            return stats_cache[location]
        }
    } else {
        if (stats_cache["Tous"]) {
            return stats_cache["Tous"]
        }
    }
    let rows
    if (location) {
        rows = db.prepare("select Model, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, min(StartTime) as firstTrip, max(StartTime) as lastTrip from trips_with_carnet_match where Model is not NULL and location = ? and totalDistanceKm > 0.1 group by Model").all(location) as StatsRow[]
    } else {
        rows = db.prepare("select Model, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, min(StartTime) as firstTrip, max(StartTime) as lastTrip from trips_with_carnet_match where Model is not NULL and totalDistanceKm > 0.1 group by Model").all() as StatsRow[]
    }
    let res : Stats = {
        models: {},
        actifs: {
            totalDistanceKm: 0,
            nbTrips: 0
        },
        passifs: {
            totalDistanceKm: 0,
            nbTrips: 0
        },
        firstTrip: "3000-31-12",
        lastTrip: "0000-01-01"
    }
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        res.models[row.Model] = {
            totalDistanceKm: row.totalDistanceKm,
            nbTrips: row.nbTrips,
            type: modelTypeMap[row.Model]
        }
        if (modelTypeMap[row.Model] === "Actif") {
            res.actifs.totalDistanceKm += row.totalDistanceKm
            res.actifs.nbTrips += row.nbTrips
        } else {
            res.passifs.totalDistanceKm += row.totalDistanceKm
            res.passifs.nbTrips += row.nbTrips
        }
        if (row.firstTrip < res.firstTrip) {
            res.firstTrip = row.firstTrip
        }
        if (row.lastTrip > res.lastTrip) {
            res.lastTrip = row.lastTrip
        }
    }
    if (!location) {
        location = "Tous"
    }
    stats_cache[location] = res
    return res
}

app.get('/api/stats/', (req, res) => {
    res.json(fetchStats())
})
app.get('/api/stats/:location', (req, res) => {
    res.json(fetchStats(req.params.location))
})

interface TripsStatsType {
    models: { [key: string]: { 
        avgDistanceKm: number, 
        nbTrips: number, 
        medianDistanceKm: number,
        medianDistanceKmTravail?: number,
        avgDistanceKmTravail?: number,
        nbTripsTravail?: number
     } },
    trips_per_distance: {
        [key: string]: number
    },
}
interface TripsStatsRow {
    Model: string,
    avgDistanceKm: number,
    nbTrips: number,
}
const tripStatsCache : { [key: string]: TripsStatsType } = {}
const fetchTripStats = (location?: string) => {
    if (location) {
        if (tripStatsCache[location]) {
            return tripStatsCache[location]
        }
    } else {
        if (tripStatsCache["Tous"]) {
            return tripStatsCache["Tous"]
        }
    }
    let locationParam = "location != 'En transit'"
    if (location) {
        locationParam = `location = '${location}'`
    }
    const rows = db.prepare(`
        select Model, avg(TotalDistanceKm) as avgDistanceKm, count() as nbTrips
        from trips_with_carnet_match 
        where Model is not NULL and TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam}
        group by Model
    `).all() as TripsStatsRow[]
    let stats : TripsStatsType = {
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
    `).all() as TripsStatsRow[]
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
            let row = stmt.get(model, Math.ceil(stats.models[model].nbTrips / 2)) as { medianDistanceKm: number }
            stats.models[model].medianDistanceKm = row.medianDistanceKm
            const nbTripsTravail = stats.models[model].nbTripsTravail || 0
            if (nbTripsTravail > 1) {
                let row_travail = stmt_travail.get(model, Math.ceil(nbTripsTravail / 2)) as { medianDistanceKm: number }
                stats.models[model].medianDistanceKmTravail = row_travail.medianDistanceKm
            }
        }
    }
    const trips_per_distance = db.prepare(`
        select round(TotalDistanceKm / 5)*5 as range_id, count() as nbTrips
        from trips_with_carnet_match
        where TotalDistanceKm > 0.1 and TotalDistanceKm < 100 and ${locationParam}
        group by range_id
    `).all() as { range_id: number, nbTrips: number }[]
    trips_per_distance.forEach((row) => {
        stats.trips_per_distance[row.range_id] = row.nbTrips
    })
    if (!location) {
        location = "Tous"
    }
    tripStatsCache[location] = stats
    return stats
}

app.get('/api/tripStats/', (req, res) => {
    res.json(fetchTripStats())
})

app.get('/api/tripStats/:location', (req, res) => {
    res.json(fetchTripStats(req.params.location))
})

// const motifs = ["pour toutes raisons", "pour me rendre au travail", "pour mon travail", "pour mes loisirs", "pour faire mes courses", "pour mes enfants/famille", "pour aller chez le médecin"]
//     const distances = ["toutes distances", "moins de 2 km", "entre 2 et 5 km", "entre 5 et 10 km", "entre 10 et 20 km", "plus de 20 km"]
//     const permis = ["j'ai mon permis", "je n'ai pas mon permis"]

const motifsMatch = [
    "1=1",
    "motif = 'Domicile / travail'",
    "motif in ('Trajet professionnel', 'Travail', 'travail', 'CCFF', 'trajet pro')",
    "motif = 'Loisirs'",
    "motif = 'Courses'",
    "motif in ('Ecole (enfants)', 'Nounou')",
    "motif in ('Médecin', 'Médical', 'rdv médical')"
]

const distancesMatch = [
    "1=1",
    "cast(TotalDistanceKm as float) between 0 and 2",
    "cast(TotalDistanceKm as float) between 2 and 5",
    "cast(TotalDistanceKm as float) between 5 and 10",
    "cast(TotalDistanceKm as float) between 10 and 20",
    "cast(TotalDistanceKm as float) > 20"
]

const permisMatch = [
    "1=1",
    "Model not in ('WEEZ')"
]
interface ExperiencesType {
    [key: string]: { 
        totalDistanceKm: number, 
        nbTrips: number, 
        bilanData: { [key: string]: number }, 
        carnetEntries: Carnet[] 
    }
}
app.get('/api/experiences', (req, res) => {
    const permis = req.query.permis ? parseInt(req.query.permis as string) : 0
    const distance = req.query.distance ? parseInt(req.query.distance as string) : 0
    const motif = req.query.motif ? parseInt(req.query.motif as string) : 0
    const stmt = db.prepare(`
        select Model, vehicule, sum(TotalDistanceKm) as totalDistanceKm, count() as nbTrips, territoire, heure_debut,heure_fin, carnetEntryIndex, moment, meteo_ensoleille, meteo_nuageux, meteo_pluvieux, meteo_venteux, meteo_neigeux, meteo_brouillard, meteo_autre, motif, avantage_aucun, avantage_agilite, avantage_confort, avantage_observation, avantage_fierté, avantage_reactions, avantage_bien_etre, avantage_autre, difficulte_aucune, difficulte_visibilite, difficulte_amenagement, difficulte_stationnement, difficulte_vehicule, difficulte_comportement, difficulte_autre, point_noir_1, point_noir_2, bilan, commentaires, point_noir_1_lon, point_noir_1_lat, mode_domicile_travail, mode_domicile_etudes, mode_domicile_loisirs
        from trips_with_carnet_match 
        where carnetEntryIndex >= 0 and ${permisMatch[permis]} and ${distancesMatch[distance]} and ${motifsMatch[motif]}
        group by carnetEntryIndex
    `)
    let rows = stmt.all() as Carnet[]
    const stmt_edits = db_edits.prepare("select carnetEntryIndex, field, value from carnets_edits")
    const allEdits = stmt_edits.all() as { carnetEntryIndex: string, field: string, value: string }[]
    for (let j = 0; j < allEdits.length; j++) {
        const edit = allEdits[j]
        for (let k = 0; k < rows.length; k++) {
            if (!rows[k].edits) rows[k].edits = {}
            if (rows[k].carnetEntryIndex === edit.carnetEntryIndex) {
                rows[k].edits![edit.field] = edit.value
                rows[k].commentaires = edit.value
            }
        }
    }
    let result : ExperiencesType = {}
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].Model) continue
        if (!result[rows[i].Model]) {
            result[rows[i].Model] = {
                totalDistanceKm: 0,
                nbTrips: 0,
                bilanData: {
                    "Positif": 0,
                    "Très positif": 0,
                    "Négatif": 0,
                    "Très négatif": 0,
                },
                carnetEntries: []
            }
        }
        result[rows[i].Model].totalDistanceKm += rows[i].totalDistanceKm
        result[rows[i].Model].nbTrips += rows[i].nbTrips
        result[rows[i].Model].bilanData[rows[i].bilan] += 1
        result[rows[i].Model].carnetEntries.push(rows[i])
    }
    if (req.query.format === "csv") {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="30veli_export_experiences.csv"')
        res.send(csv_stringify.stringify(rows, {header: true}))
    } else {
        res.json(result)
    }
})


app.all("/api/:any", function(_, res) {
    res.status(404).json({
        status: "Not found"
    })
});

app.use(express.static(path.join(__dirname, "../public")));

app.get('/*splat', function (req, res) {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
