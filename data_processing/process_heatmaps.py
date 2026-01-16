import pandas as pd
import numpy as np
import h3pandas
from pathlib import Path
import os


def generate_heatmap_per_model(df, location, model):
    OUTPUT_FOLDER = os.getenv("HEATMAPS_OUTPUT_FOLDER")
    if model == "all":
        df_model = df
    else:
        df_model = df[df['Model'] == model]
    df_h3_model = df_model.h3.geo_to_h3_aggregate(
        10, operation='nunique', lat_col="Latitude (loc)", lng_col="Longitude (loc)"
    )
    geoframe_model = df_h3_model.h3.h3_to_geo()
    geoframe_model['lon'] = geoframe_model.geometry.x  
    geoframe_model['lat'] = geoframe_model.geometry.y
    jsn_model = geoframe_model.reset_index()[['lat', 'lon', 'UniqueTripID']].to_json(orient='values')

    filename_model = f'{OUTPUT_FOLDER}/{location}/{model}.json'
    Path(f'{OUTPUT_FOLDER}/{location}/').mkdir(parents=True, exist_ok=True)
    with open(filename_model, 'w') as f:
        f.write(jsn_model)
    print(f"Saved heatmap '{OUTPUT_FOLDER}/{location}/{model}.json'")

'''
Generates anonymized heatmaps of trips.

Anonmization is done by aggregating the number of trips per H3 cells.

Param:
    _raw_with_trip_ids : dataframe containing raw data, with one row per GPS point. Generated using the process_gps_data.py script.
        It contains the following columns:
        'Latitude (loc)', 'Longitude (loc)', 'UniqueTripID', 'Distance', 'location', 'Model'

Returns:
    None, but creates a json file for each combinaison of vehicle model and location.
    Json files contain an array of tuples: [(lat, lon, nb_trips), ...], lat and lon are the coordinates of the center of the h3 cell.
    They are stored in the OUTPUT_FOLDER as a file system hierarchy, with the following structure:
        OUTPUT_FOLDER
            |
            +-- location
                |
                +-- model.json
    location is the name of the territory, and can be "all"
    model is the name of the vehicle model, and can be "all"
'''
def process_heatmaps(raw_with_trip_ids):
    # raw_with_trip_ids = _raw_with_trip_ids[_raw_with_trip_ids['location'] != 'En transit']
    generate_heatmap_per_model(raw_with_trip_ids, "all", "all")
    
    for model in raw_with_trip_ids['Model'].unique():
        generate_heatmap_per_model(raw_with_trip_ids, "all", model)
    
    # for loc in raw_with_trip_ids['location'].unique():
    #     df_loc = raw_with_trip_ids[raw_with_trip_ids['location'] == loc]  # Filter for the specific location
    #     generate_heatmap_per_model(df_loc, loc, "all")

    #     for model in df_loc['Model'].unique():
    #         generate_heatmap_per_model(df_loc, loc, model)
