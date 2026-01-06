import sqlite3
import json
from process_gps_data import process_gps_data
from process_carnet import process_carnet
from process_heatmaps import process_heatmaps
import pandas as pd

OUTPUT_DATABASE_FILE = "../data.db" # Database for the 30veli dataviz
OUTPUT_LIGHTWEIGHT_CSV_FILE = "../../trips_with_carnet_match_light.csv" # Only used to import data in superset

print("Processing gps data")
raw_with_trip_ids, df_trips = process_gps_data()
print("Processing carnet data")
trips_with_carnet_match = process_carnet(df_trips)
print("Creating heatmaps")
process_heatmaps(raw_with_trip_ids)

print("Saving results to database")
# Save to database
conn = sqlite3.connect(OUTPUT_DATABASE_FILE)

raw_with_trip_ids.rename(columns={"Latitude (loc)": "Latitude(loc)", "Longitude (loc)": "Longitude(loc)"}, inplace=True)
raw_with_trip_ids.to_sql('raw_with_trip_ids', conn, if_exists='replace')

def jsonify(x):
    try:
        return json.dumps(x, allow_nan=False)
    except ValueError:
        return None

print("jsonifying coords")
trips_with_carnet_match["coords"] = trips_with_carnet_match["coords"].apply(jsonify)

print("convert & drop")
trips_with_carnet_match["carnetEntryIndex"] = pd.to_numeric(trips_with_carnet_match["carnetEntryIndex"], errors="coerce").astype("Int64")
trips_with_carnet_match.drop(columns=["timestamps"], inplace=True)

print("Saving trips_with_carnet_match to database")
trips_with_carnet_match.to_sql('trips_with_carnet_match', conn, if_exists='replace')

conn.close()

print("Generating csv for superset")
# Save csv for superset
# Only keep used columns
trips_with_carnet_match = trips_with_carnet_match[[
    "date",
    "location",
    "territoire",
    "Model",
    "Licence plate",
    "TotalDistanceKm",
    "UniqueTripID",
    "vehicule",
    "EndTime",
    "StartTime",
    "AvgSpeed",
    "coords",
    "point_noir_1",
    "point_noir_1_lat",
    "point_noir_1_lon",
    "carnetEntryIndex",
    "start_time",
    "end_time",
    "depart",
    "arrivee",
    "motif",
    "point_noir_2",
    "commentaires",
    "bilan",
    "avantage_agilite",
    "avantage_aucun",
    "avantage_bien_etre",
    "avantage_confort",
    "avantage_fierté",
    "avantage_observation",
    "avantage_reactions",
    "avantage_autre",
    "difficulte_amenagement",
    "difficulte_aucune",
    "difficulte_comportement",
    "difficulte_stationnement",
    "difficulte_vehicule",
    "difficulte_visibilite",
    "difficulte_autre"
]]

# set coords to null when their length is > 50000, since they'll be dropped anyway by superset
trips_with_carnet_match.loc[trips_with_carnet_match['coords'].str.len()>50000, 'coords'] = None

trips_with_carnet_match.to_csv(OUTPUT_LIGHTWEIGHT_CSV_FILE, index=False)