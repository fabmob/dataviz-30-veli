interface Settings {
    show: boolean,
    location: string,
    model: string,
    showOnlyPointNoir: boolean
}
interface BilanDataType {
    "Très positif"?: number,
    "Positif"?: number,
    "Négatif"?: number,
    "Très négatif"?: number,
    "Trajets sans bilan"?: number,
}
interface TripsInBboxType {
    Model: string,
    carnetEntryIndexes: string,
    totalDistanceKm: number,
    nbTrips: number,
    carnetEntries: { carnetEntryIndex: string, bilan: string, commentaires: string }[],
    bilanData?: BilanDataType
}
interface CarnetType {
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

interface ExperiencesType {
    [key: string]: { 
        totalDistanceKm: number, 
        nbTrips: number, 
        bilanData: { [key: string]: number }, 
        carnetEntries: CarnetType[] 
    }
}
interface StatsType {
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
interface ModelTripStatType {
    avgDistanceKm: number, 
    nbTrips: number, 
    medianDistanceKm: number,
    medianDistanceKmTravail?: number,
    avgDistanceKmTravail?: number,
    nbTripsTravail?: number
}
interface TripDistanceStatType {
    [key: string]: number
}
interface TripsStatsType {
    models: { [key: string]: ModelTripStatType },
    trips_per_distance: TripDistanceStatType,
}
interface SettingsContextType {
    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>
}

interface VehicleHistoryType {
    day: string,
    "Licence plate": string,
    Model: string,
    location: string,
    nb_trips: number,
    total_distance_km: number,
    average_speed_kmh: number,
    most_frequent_bilan: string
}

export {
    Settings,
    BilanDataType,
    CarnetType,
    TripsInBboxType,
    ExperiencesType,
    StatsType,
    TripDistanceStatType,
    TripsStatsType,
    ModelTripStatType,
    SettingsContextType,
    VehicleHistoryType
}