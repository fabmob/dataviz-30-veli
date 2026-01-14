import { ExperiencesType, StatsType } from "./types"

let tripsInBboxCache: any[]
let carnetCache: any[]
let tripStatsCache: any
let vehicleStatsCache: any

const loadTripsInBbox = async (location: string|null, model: string|null) => {
    if (location === "Tous") location = null
    if (model === "Tous") model = null
    if (!tripsInBboxCache) {
        tripsInBboxCache = await (await fetch('/cache/tripsInBbox_cache.json')).json()
        if (!carnetCache) {
            carnetCache = await (await fetch('/cache/carnet_cache.json')).json()
        }
        tripsInBboxCache.forEach(trips => {
            if (trips.carnetEntryIndexes) {
                trips.carnetEntries = trips.carnetEntryIndexes.split(',').map(
                    (carnetEntryIndex:string) => carnetCache.find(carnet => carnet.carnetEntryIndex === parseInt(carnetEntryIndex))
                )
            } else {
                trips.carnetEntries = []
            }
        })
    }
    let filtered = tripsInBboxCache.filter(trips => (model ? trips.Model === model : true) && (location ? trips.location === location : true))
    if (!location) {
        // If there is no location, we need to agregate by model
        const reduced = filtered.reduce((acc, trips) => {
            if (!acc[trips.Model]) {
                acc[trips.Model] = {
                    Model: trips.Model,
                    location: trips.location,
                    totalDistanceKm: 0,
                    nbTrips: 0,
                    carnetEntries: []
                }
            }
            acc[trips.Model].totalDistanceKm += trips.totalDistanceKm
            acc[trips.Model].nbTrips += trips.nbTrips
            acc[trips.Model].carnetEntries.push(...trips.carnetEntries)
            return acc
        }, {})
        return Object.values(reduced)
    }
    return filtered
}

const loadCarnet = async (carnetIndex: string) => {
    if (!carnetCache) {
        carnetCache = await (await fetch('/cache/carnet_cache.json')).json()
    }
    return carnetCache.find(carnet => carnet.carnetEntryIndex === parseInt(carnetIndex))
}

const loadHeatmapData = async (location: string|null, model: string|null) => {
    if (location === "Tous") location = null
    if (model === "Tous") model = null
    let jsonFile = "heatmaps/" + (location ? location : 'all')
    jsonFile += '/' + (model ? model : 'all') + '.json'
    const heatmapjson = await (await fetch(jsonFile)).json()
    if (!carnetCache) {
        carnetCache = await (await fetch('/cache/carnet_cache.json')).json()
    }
    const carnetFiltered = carnetCache.filter(carnet => carnet.carnetEntryIndex && carnet.cache_lat && (model ? carnet.Model === model : true) && (location ? carnet.territoire === location : true))
    console.log("carnetFiltered", carnetFiltered)
    let carnetCoords = carnetFiltered.map(carnet => {
        return {lat: carnet.cache_lat, lon: carnet.cache_lon, carnetEntryIndex: carnet.carnetEntryIndex, bilan: carnet.bilan, vehicule: carnet.vehicule, isPointNoir: carnet.point_noir_1_lat !== null}
    })
    console.log("carnetCoords", carnetCoords)
    return {heatmapjson, carnetCoords}
}

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
    "Qbx": "Actif",
    "La Bagnole": "Passif",
    "Galibot": "Passif",
}

const loadStats = async (location: string|null) => {
    if (!tripsInBboxCache) {
        tripsInBboxCache = await (await fetch('/cache/tripsInBbox_cache.json')).json()
    }
    let res : StatsType = {
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
    tripsInBboxCache.forEach(trip => {
        if (location && location !== "Tous") {
            if (trip.location !== location) return
        }
        if (trip.totalDistanceKm < 0.1) return
        if (!res.models[trip.Model]) {
            res.models[trip.Model] = {
                totalDistanceKm: 0,
                nbTrips: 0,
                type: modelTypeMap[trip.Model]
            }
        }
        res.models[trip.Model].totalDistanceKm += trip.totalDistanceKm
        res.models[trip.Model].nbTrips += trip.nbTrips

        if (modelTypeMap[trip.Model] === "Actif") {
            res.actifs.totalDistanceKm += trip.totalDistanceKm
            res.actifs.nbTrips += trip.nbTrips
        } else {
            res.passifs.totalDistanceKm += trip.totalDistanceKm
            res.passifs.nbTrips += trip.nbTrips
        }
        if (trip.firstTrip < res.firstTrip) {
            res.firstTrip = trip.firstTrip
        }
        if (trip.lastTrip > res.lastTrip) {
            res.lastTrip = trip.lastTrip
        }
    })
    return res
}

const loadTripStats = async (location: string|null) => {
    if (!tripStatsCache) {
        tripStatsCache = await (await fetch('/cache/tripStats_cache.json')).json()
    }
    return tripStatsCache[location || 'Tous']
}

const loadExperiences = async (permis: string|null, distance: string|null, motif: string|null) => {
    let result = {} as ExperiencesType
    if (!carnetCache) {
        carnetCache = await (await fetch('/cache/carnet_cache.json')).json()
    }
    const filteredCarnet = carnetCache.filter(carnet => {
        let allowed = carnet.carnetEntryIndex >= 0
        if (permis && permis !== "0") {
            allowed = allowed && (carnet.Model != "WEEZ")
        }
        if (distance) {
            switch (distance) {
                case "1":
                    allowed = allowed && (carnet.totalDistanceKm > 0) && (carnet.totalDistanceKm < 2)
                    break
                case "2":
                    allowed = allowed && (carnet.totalDistanceKm >= 2) && (carnet.totalDistanceKm < 5)
                    break
                case "3":
                    allowed = allowed && (carnet.totalDistanceKm >= 5) && (carnet.totalDistanceKm < 10)
                    break
                case "4":
                    allowed = allowed && (carnet.totalDistanceKm >= 10) && (carnet.totalDistanceKm < 20)
                    break
                case "5":
                    allowed = allowed && (carnet.totalDistanceKm >= 20)
                    break
            }
        }
        if (motif) {
            switch (motif) {
                case "1":
                    allowed = allowed && (carnet.motif === 'Domicile / travail')
                    break
                case "2":
                    allowed = allowed && (['Trajet professionnel', 'Travail', 'travail', 'CCFF', 'trajet pro'].indexOf(carnet.motif) > -1)
                    break
                case "3":
                    allowed = allowed && (carnet.motif === 'Loisirs')
                    break
                case "4":
                    allowed = allowed && (carnet.motif === 'Courses')
                    break
                case "5":
                    allowed = allowed && (['Ecole (enfants)', 'Nounou'].indexOf(carnet.motif) > -1)
                    break
                case "6":
                    allowed = allowed && (['Médecin', 'Médical', 'rdv médical'].indexOf(carnet.motif) > -1)
                    break
            }
        }
        return allowed
    })
    for (let i = 0; i < filteredCarnet.length; i++) {
        if (!filteredCarnet[i].vehicule) continue
        if (!result[filteredCarnet[i].vehicule]) {
            result[filteredCarnet[i].vehicule] = {
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
        result[filteredCarnet[i].vehicule].totalDistanceKm += filteredCarnet[i].totalDistanceKm
        result[filteredCarnet[i].vehicule].nbTrips += filteredCarnet[i].nbTrips
        result[filteredCarnet[i].vehicule].bilanData[filteredCarnet[i].bilan] += 1
        result[filteredCarnet[i].vehicule].carnetEntries.push(filteredCarnet[i])
    }
    return result
}

const loadVehicleStats = async (licencePlate: string) => {
    if (!vehicleStatsCache) {
        vehicleStatsCache = await (await fetch('/cache/vehicleStats_cache.json')).json()
    }
    return vehicleStatsCache[licencePlate]
}

const fetchOverride = async (url: string) => {
    const pathParts = url.split("/")
    const queryString = url.split("?")[1]
    const queryParams = new URLSearchParams(queryString)
    if (pathParts[1] !== "api") {
        return fetch(url)
    }
    const apiCalled = pathParts[2].split('?')[0]
    let res = {}
    switch (apiCalled) {
        case "carnet":
            res = await loadCarnet(pathParts[3])
            break
        case "heatmapdata":
            res = await loadHeatmapData(queryParams.get("location"), queryParams.get("model"))
            break
        case "tripsInBbox":
            res = await loadTripsInBbox(queryParams.get("location"), queryParams.get("model"))
            break
        case "stats":
            res = await loadStats(pathParts[3])
            break
        case "tripStats":
            res = await loadTripStats(pathParts[3])
            break
        case "experiences":
            res = await loadExperiences(queryParams.get("permis"), queryParams.get("distance"), queryParams.get("motif"))
            break
        case "vehicleStats":
            res = await loadVehicleStats(pathParts[3])
            break
    }
    return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(res)
    })
}

export { fetchOverride }