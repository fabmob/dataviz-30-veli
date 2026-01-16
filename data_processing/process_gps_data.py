import pandas as pd
import numpy as np
import datetime
import gpxpy
import os

'''
Processes raw GPS data from Carmoove exports and GPX files and converts them to trips with their associated location.

A new trip is considered when the vehicle hasn't moved for more than 600 seconds. The method also recomputes distances travelled,
and uses this information as part of the rules to discard outliers and data errors.

Sources:
    CARMOOVE_EXPORTS_FOLDER files: csv files containing GPS data, exported from Carmoove website. All files in the folder will be processed.
        The following columns are expected: 
        'Date & time', 'Licence plate', 'VIN', 'vehicle ID', 'Brand', 'Model',
        'Category', 'Driver', 'Trip ID', 'Trip Status', 'Latitude (loc)',
        'Longitude (loc)', 'Angle (loc)', 'Altitude (loc)',
        'Mileage (km total)', 'Energy level (%)', 'Energy level (L)',
        'Energy level (Kwa)', 'Consumption (L)', 'Consumption (Kwa)',
        'Autonomy (km)', 'Speed (km/h)', 'Accel X (mG)', 'Accel Y (mG)',
        'Accel Z (mG)', 'External temperature (°C)', 'Battery Temperature (°C)',
        'SOH (%)', 'SOC (%)', 'SOS (%)', 'EV Battery (V)', 'Battery (V)',
        'Alert (code)', 'CO2 (g)', 'T° Sensor 1'
    GPX_SOURCES_FOLDER files: Regular GPX files. Files should be named as follows: DATE_VehicleName_XXX.gpx, eg: 20251205_Galibot_1.gpx
        VehiculeName will be used to match the GPX data to a virtual licence plate and a location. The plate is hard-coded for now.
    distrib_territoires: Hard-coded source of truth for the location of each vehicules. This list needs to be updated when new vehicules are added or moved.

Returns:
    (raw_with_trip_ids, cleaned) tuple: 
        raw_with_trip_ids : dataframe containing raw data, with one row per GPS point. It is later used to generate heatmaps and geographicaly filter trips.
            It contains the following columns:
            'Latitude (loc)', 'Longitude (loc)', 'UniqueTripID', 'Distance', 'location', 'Model'
        df_trips :dataframe containing aggregated data, with one row per trip. It contains the following columns:
            'UniqueTripID', 'coords', 'timestamps', 'TotalDistanceKm', 'AvgSpeed',
            'StartTime', 'EndTime', 'Licence plate', 'VIN', 'vehicle ID', 'Brand',
            'Model', 'Category', 'External temperature (°C)', 'T° Sensor 1',
            'Prev datetime', 'DurationSinceLast', 'location'
'''
def process_gps_data():
    def load_carmoove_exports():
        exports = []
        for file in os.listdir(os.getenv("CARMOOVE_EXPORTS_FOLDER")):
            if file.endswith(".csv"):
                exports.append(pd.read_csv(f"{os.getenv("CARMOOVE_EXPORTS_FOLDER")}/{file}", sep=';'))
        return pd.concat(exports)

    df = load_carmoove_exports()

    # Strip duplicates in case of overlapping export files
    df = df.drop_duplicates()

    # Ensure the datetime column is parsed correctly
    df['datetime'] = pd.to_datetime(df['timestamp'], unit='s', errors='coerce', utc=True)

    # Cleanup outliers
    df = df[df['Longitude (loc)'] != 0]
    df = df[df['Longitude (loc)'] < 20]
 
    # Generate unique trips
    # Sort by 'vehicle ID' and 'datetime'
    df = df.sort_values(by=['vehicle ID', 'datetime']).reset_index(drop=True)

    # Drop consecutive lat lng duplicates
    cols = ["Latitude (loc)", "Longitude (loc)"]
    df = df.loc[(df[cols].shift() != df[cols]).any(axis=1)]

    # Calculate time difference within each 'vehicle ID' group
    df['time_diff'] = df.groupby('vehicle ID')['datetime'].diff().dt.total_seconds()

    # Define a condition for incrementing the trip ID
    # A new trip starts if time difference > 600 seconds
    df['new_trip'] = df['time_diff'] > 600

    # Generate unique trip IDs within each 'vehicle ID' group
    df['local_trip_id'] = df.groupby('vehicle ID')['new_trip'].cumsum()

    df['UniqueTripID'] = df['vehicle ID'].astype(str) + '_' + df['local_trip_id'].astype(str)

    # Drop helper columns
    df.drop(columns=['time_diff', 'new_trip', 'local_trip_id'], inplace=True)

    # Define the vectorized Haversine formula
    def haversine_vectorized(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in kilometers
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat / 2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return R * c

    # Calculate distances
    df['Prev Latitude'] = df.groupby('vehicle ID')['Latitude (loc)'].shift()
    df['Prev Longitude'] = df.groupby('vehicle ID')['Longitude (loc)'].shift()
    df['Prev datetime'] = df.groupby('vehicle ID')['datetime'].shift()

    df['Distance'] = haversine_vectorized(
        df['Prev Latitude'], df['Prev Longitude'],
        df['Latitude (loc)'], df['Longitude (loc)']
    )
    df['DurationSinceLast'] = (df['datetime'] - df['Prev datetime']).dt.total_seconds()

    # Fill NaN distances with 0 (first point of each trip)
    df['Distance'] = df['Distance'].fillna(0)

    # Set distance to 0 if duration since last point is greater than 24 hours
    df.loc[df['DurationSinceLast'] > 86400, 'Distance'] = 0

    # Set distance to 0 if distance since last point is greater than 50km (teleportation)
    df.loc[df['Distance'] > 50, 'Distance'] = 0

    # Keep raw data
    raw_with_trip_ids = df[['Latitude (loc)', 'Longitude (loc)', 'UniqueTripID', 'Distance', 'Licence plate', 'Model']]

    # Group stats by trips
    df['latlng'] = list(zip(df['Latitude (loc)'], df['Longitude (loc)']))
    firsts = df.groupby('UniqueTripID').first()
    df_trips = df.groupby('UniqueTripID').agg(
        coords=('latlng', lambda x: x.tolist()), 
        timestamps=('datetime', lambda x: x.tolist()), 
        TotalDistanceKm=('Distance', "sum"),
        StartTime=('datetime', 'first'),
        EndTime=('datetime', 'last')
    ).merge(firsts, on='UniqueTripID')

    df_trips['DurationHour'] = (df_trips['EndTime'] - df_trips['StartTime']).dt.total_seconds() / (60 * 60)
    df_trips['AvgSpeed'] = df_trips['TotalDistanceKm'] / df_trips['DurationHour']

    # Drop useless columns
    df_trips.drop(columns=[
        # 'Date & time', 'Driver', 'Trip ID', 'Trip Status', 'Latitude (loc)', 'Longitude (loc)',
        # 'Angle (loc)', 'Altitude (loc)', 'Mileage (km total)',
        # 'Energy level (%)', 'Energy level (L)', 'Energy level (Kwa)',
        # 'Consumption (L)', 'Consumption (Kwa)', 'Autonomy (km)', 'Speed (km/h)',
        # 'Accel X (mG)', 'Accel Y (mG)', 'Accel Z (mG)', 'Battery Temperature (°C)', 'SOH (%)',
        # 'SOC (%)', 'SOS (%)', 'EV Battery (V)', 'Battery (V)', 'Alert (code)',
        # 'CO2 (g)', 
        'Prev Latitude', 'Prev Longitude', 'Distance',
        'latlng', 'datetime'], inplace=True)
    df_trips.reset_index(inplace=True)

    # Filter out trips with a distance of less than 100m
    df_trips = df_trips[df_trips.TotalDistanceKm > 0.01]

    return (raw_with_trip_ids, df_trips)
