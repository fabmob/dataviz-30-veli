import sqlite3
import json
from process_gps_data import process_gps_data
from process_carnet import process_carnet
from process_heatmaps import process_heatmaps
from fetch_survey_grist_api import fetch_and_save_survey_data
from fetch_gps_carmoove_api import fetch_and_save_recent_gps_data
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

print("Fetching remote survey data, using grist API")
fetch_and_save_survey_data()
print("Fetching recent gps data, using carmoove API")
fetch_and_save_recent_gps_data()

print("Processing gps data")
raw_with_trip_ids, df_trips = process_gps_data()
print("Processing carnet data")
trips_with_carnet_match = process_carnet(df_trips)
print("Creating heatmaps")
process_heatmaps(raw_with_trip_ids)

print("Saving results to database")
# Save to database
conn = sqlite3.connect(os.getenv("DATAVIZ_DATABASE_FILE")) # Database for the 30veli dataviz

raw_with_trip_ids.rename(columns={"Latitude (loc)": "Latitude(loc)", "Longitude (loc)": "Longitude(loc)"}, inplace=True)
raw_with_trip_ids.to_sql('raw_with_trip_ids', conn, if_exists='replace')

# Ensure no columns are missing in trips_with_carnet_match before db creation
expected_columns = [
    'UniqueTripID', 'coords', 'TotalDistanceKm', 'StartTime', 'EndTime',
    'LicencePlate', 'Brand', 'Model', 'DurationHour', 'AvgSpeed',
    'carnetEntryIndex', 'territoire', 'nom', 'prenom', 'plate',
    'vehicule', 'date', 'heure_debut', 'heure_fin', 'duree', 'moment',
    'depart', 'arrivee', 'etape', 'distance', 'passagers', 'motif',
    'point_noir_1', 'point_noir_2', 'difficultes_details', 'bilan',
    'commentaires', 'meteo_ensoleille', 'meteo_nuageux', 'meteo_pluvieux',
    'meteo_venteux', 'meteo_neigeux', 'meteo_brouillard', 'meteo_autre',
    'avantage_aucun', 'avantage_agilite', 'avantage_confort',
    'avantage_observation', 'avantage_fierté', 'avantage_reactions',
    'avantage_bien_etre', 'avantage_autre', 'difficulte_aucune',
    'difficulte_visibilite', 'difficulte_amenagement',
    'difficulte_stationnement', 'difficulte_vehicule',
    'difficulte_comportement', 'difficulte_autre', 'start_time', 'end_time'
]
trips_with_carnet_match = trips_with_carnet_match.reindex(columns=expected_columns)

def jsonify(x):
    try:
        return json.dumps(x, allow_nan=False)
    except ValueError:
        return None

print("jsonifying coords")
trips_with_carnet_match["coords"] = trips_with_carnet_match["coords"].apply(jsonify)

print("convert index")
trips_with_carnet_match["carnetEntryIndex"] = pd.to_numeric(trips_with_carnet_match["carnetEntryIndex"], errors="coerce").astype("Int64")


print("Saving trips_with_carnet_match to database")
trips_with_carnet_match.to_sql('trips_with_carnet_match', conn, if_exists='replace')

conn.close()
