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
fetch_and_save_recent_gps_data("2026/01/15")

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
