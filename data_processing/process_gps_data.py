import pandas as pd
import numpy as np
import datetime
import gpxpy
import os

CARMOOVE_EXPORTS_FOLDER = "carmoove_exports"
GPX_SOURCES_FOLDER = "GPX"

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
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    distrib_territoires = [
        {"plate": "GV194CN", "startDate": "2024-03-01", "endDate": tomorrow, "Location": "Commune des Mureaux"},
        {"plate": "GP065PN", "startDate": "2024-03-01", "endDate": tomorrow, "Location": "CC Grand Pic St Loup"},
        {"plate": "GV136CN", "startDate": "2024-03-01", "endDate": "2025-04-17", "Location": "CC Clunisois"},
        {"plate": "GV136CN", "startDate": "2025-04-18", "endDate": tomorrow, "Location": "Le Mans"},
        {"plate": "GE800QY", "startDate": "2024-03-01", "endDate": "2025-05-20", "Location": "Commune du Teil"},
        {"plate": "GE800QY", "startDate": "2025-05-21", "endDate": tomorrow, "Location": "CC Briançon"}, # maj
        {"plate": "GV046CN", "startDate": "2024-03-01", "endDate": "2025-05-05", "Location": "PNR Grand Causses"},
        {"plate": "GV046CN", "startDate": "2025-05-15", "endDate": tomorrow, "Location": "La Chapelle-Thouarault"}, # maj
        {"plate": "GD740SR", "startDate": "2023-12-08", "endDate": tomorrow, "Location": "Commune des Mureaux"},
        {"plate": "GD946SR", "startDate": "2023-11-06", "endDate": tomorrow, "Location": "CC Grand Pic St Loup"},
        {"plate": "GD483SR", "startDate": "2024-01-26", "endDate": tomorrow, "Location": "CC Clunisois"},
        {"plate": "GG149XZ", "startDate": "2024-01-25", "endDate": tomorrow, "Location": "Commune du Teil"},
        {"plate": "GB418VP", "startDate": "2024-01-25", "endDate": "2024-10-01", "Location": "Commune du Teil"},
        {"plate": "GB418VP", "startDate": "2024-10-01", "endDate": tomorrow, "Location": "Lalouvesc"},
        {"plate": "GD785SR", "startDate": "2023-11-07", "endDate": "2025-04-24", "Location": "PNR Grand Causses"},
        {"plate": "GD785SR", "startDate": "2025-04-25", "endDate": tomorrow, "Location": "Montpellier"}, # à montpelier (mais hors expé)
        {"plate": "GP243HH", "startDate": "2025-05-10", "endDate": "2025-11-06", "Location": "PNR Grand Causses"}, # fin de la BIRO, passage du capteur sur un Acticyle (plaque renommé en ACTI0004)
        {"plate": "ACTI0004", "startDate": "2025-11-06", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # Ex BIRO GP243HH
        {"plate": "GALFORMI01", "startDate": "2024-07-09", "endDate": tomorrow, "Location": "CC Clunisois"},
        {"plate": "BY2F7TH5EH", "startDate": "2024-02-01", "endDate": "2025-04-15", "Location": "Commune des Mureaux"},
        {"plate": "BY2F7TH5EH", "startDate": "2025-04-16", "endDate": tomorrow, "Location": "Le Mans"},
        {"plate": "BYC8AADHFC", "startDate": "2024-04-01", "endDate": "2025-01-25", "Location": "Commune de Tressin"},
        {"plate": "BYC8AADHFC", "startDate": "2025-01-25", "endDate": tomorrow, "Location": "CC 7 Vallées"},
        {"plate": "BY32ZZZ698", "startDate": "2023-11-09", "endDate": tomorrow, "Location": "CC Grand Pic St Loup"},
        {"plate": "BY7C8XZDFD", "startDate": "2024-03-05", "endDate": "2025-08-02", "Location": "CC Clunisois"},
        {"plate": "BY7C8XZDFD", "startDate": "2025-08-02", "endDate": tomorrow, "Location": "CC de Puisayes Forterre"},
        {"plate": "BYZD9TVA4C", "startDate": "2024-03-05", "endDate": "2024-07-06", "Location": "PNR Grand Causses"},
        {"plate": "BYZD9TVA4C", "startDate": "2024-07-07", "endDate": tomorrow, "Location": "Commune du Teil"},
        {"plate": "BYZE2PK7E6", "startDate": "2024-03-06", "endDate": "2025-04-23", "Location": "Commune du Teil"},
        {"plate": "BYZE2PK7E6", "startDate": "2025-04-24", "endDate": tomorrow, "Location": "La Chapelle-Thouarault"}, # maj
        {"plate": "BCF2CBFBBC", "startDate": "2023-11-21", "endDate": "2024-07-31", "Location": "Commune de Tressin"},
        {"plate": "BCF2CBFBBC", "startDate": "2024-08-01", "endDate": "2024-10-31", "Location": "Loos les Lilles"},
        {"plate": "KARBIKES01", "startDate": "2024-07-19", "endDate": "2025-04-01", "Location": "PNR Grand Causses"},
        {"plate": "KARBIKES01", "startDate": "2025-04-03", "endDate": "2025-05-12", "Location": "PNR Grand Causses"},
        {"plate": "KARBIKES01", "startDate": "2025-05-13", "endDate": tomorrow, "Location": "CA du Grand Avignon"}, # maj
        {"plate": "KARBIKES02", "startDate": "2024-10-01", "endDate": tomorrow, "Location": "Loos en Gohelle"},
        {"plate": "KARBIKES03", "startDate": "2024-11-17", "endDate": tomorrow, "Location": "Commune des Mureaux"},
        {"plate": "FRIKAR01", "startDate": "2024-07-09", "endDate": "2025-04-29", "Location": "PNR Grand Causses"},
        {"plate": "FRIKAR01", "startDate": "2025-04-30", "endDate": tomorrow, "Location": "Loos en Gohelle"}, # maj
        {"plate": "STC20", "startDate": "2024-06-14", "endDate": "2024-10-31", "Location": "CC Clunisois"},
        {"plate": "STC20", "startDate": "2024-11-01", "endDate": tomorrow, "Location": "Commune du Teil"},
        {"plate": "ACTI0001", "startDate": "2025-03-26", "endDate": tomorrow, "Location": "Avant Pays Savoyard"},
        {"plate": "ACTI0002", "startDate": "2025-03-26", "endDate": tomorrow, "Location": "Avant Pays Savoyard"}, # maj
        {"plate": "ACTI0003", "startDate": "2025-05-21", "endDate": "2025-11-07", "Location": "PNR Grand Causses"}, # veli & capteur libérés
        {"plate": "GJ756XR", "startDate": "2025-05-18", "endDate": tomorrow, "Location": "Centre Hospitalier de Niort"}, # maj
        {"plate": "MAIL0001", "startDate": "2025-05-21", "endDate": tomorrow, "Location": "Le Mans"}, # maj
        {"plate": "MAIL0002", "startDate": "2025-05-13", "endDate": tomorrow, "Location": "Centre Hospitalier de Niort"}, # maj
        {"plate": "MAIL0003", "startDate": "2025-05-13", "endDate": tomorrow, "Location": "CA du Grand Avignon"}, # maj
        {"plate": "GY831PD", "startDate": "2025-07-17", "endDate": "2025-11-13", "Location": "CC Briançon"},
        {"plate": "GY831PD", "startDate": "2025-11-17", "endDate": tomorrow, "Location": "CC Briançon"}, # date de début à revoir, après réparation
        {"plate": "VHELIOINSALAAS", "startDate": "2025-07-15", "endDate": tomorrow, "Location": "Toulouse"},
        {"plate": "URBANERINSALAAS", "startDate": "2025-07-15", "endDate": tomorrow, "Location": "Toulouse"},
        {"plate": "GALIBOT01", "startDate": "2025-09-14", "endDate": "2025-12-06", "Location": "CC 7 Vallées"},
        # INVD
        {"plate": "GR210JE", "startDate": "2025-05-10", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # AMI
        {"plate": "GS747FK", "startDate": "2025-05-10", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # Biro
        {"plate": "W363MN", "startDate": "2025-05-10", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # Sorean (Qbx)
        {"plate": "W397MN", "startDate": "2025-05-10", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # Sorean (Qbx)
        {"plate": "W587MS", "startDate": "2025-05-10", "endDate": tomorrow, "Location": "PNR Grand Causses"}, # Sorean (Qbx)
    ]

    def load_carmoove_exports():
        exports = []
        for file in os.listdir(CARMOOVE_EXPORTS_FOLDER):
            exports.append(pd.read_csv(f"{CARMOOVE_EXPORTS_FOLDER}/{file}", sep=';'))
        return pd.concat(exports)

    df = load_carmoove_exports()

    # Strip duplicates in case of overlapping export files
    df = df.drop_duplicates()

    # Ensure the datetime column is parsed correctly
    df['datetime'] = pd.to_datetime(df['Date & time'], format='%m/%d/%Y %I:%M:%S %p', utc=True, errors='coerce')
    if 'timestamp' in df.columns:
        df['datetime'] = df['datetime'].fillna(
            pd.to_datetime(df['timestamp'], unit='s', errors='coerce', utc=True)
        )


    def add_gpx_to_df(gpx_sources_folder, gpx_file_name):
        with open(f"{gpx_sources_folder}/{gpx_file_name}") as f:
            gpx = gpxpy.parse(f)
        model = gpx_file_name.split("_")[1].lower().capitalize()
        # Convert to a dataframe one point at a time.
        points = []
        for segment in gpx.tracks[0].segments:
            for p in segment.points:
                points.append({
                    'time': p.time,
                    'Latitude (loc)': p.latitude,
                    'Longitude (loc)': p.longitude,
                    'Altitude (loc)': p.elevation,
                })
        df_gpx = pd.DataFrame.from_records(points)
        df_gpx["datetime"] = pd.to_datetime(df_gpx["time"], format='ISO8601', utc=True)
        df_gpx.drop(columns=['time'], inplace=True)
        if model == "Galibot":
            df_gpx["vehicle ID"] = f"{model}-01"
            df_gpx["Licence plate"] = f"{model.upper()}01"
        else:
            df_gpx["vehicle ID"] = f"{model}-insa-laas-01"
            df_gpx["Licence plate"] = f"{model.upper()}INSALAAS"
        df_gpx["Model"] = model
        df_gpx["Brand"] = model
        df_gpx["Speed (km/h)"] = 0
        return df_gpx

    # Add all the files in the GPX_SOURCES_FOLDER dir
    for file in os.listdir(GPX_SOURCES_FOLDER):
        df = pd.concat([df, add_gpx_to_df(GPX_SOURCES_FOLDER, file)])

    # Cleanup outliers
    df = df[df['Longitude (loc)'] != 0]
    df = df[df['Longitude (loc)'] < 20]
    df['Model'] = df['Model'].replace('Daily', 'Maillon Mobility')
    df.loc[df['Brand'] == 'KILOW', 'Model'] = 'La Bagnole'

    # Starting from "2025-11-17", GP243HH is not a BIRO anymore, but an Acticyle
    cutoff = pd.to_datetime('2025-11-06', format='%Y-%m-%d', utc=True)
    df.loc[(df['Licence plate'] == 'GP243HH') & (df['datetime'] >= cutoff), 'Brand'] = 'ACTICYCLE'
    df.loc[(df['Licence plate'] == 'GP243HH') & (df['datetime'] >= cutoff), 'Model'] = 'Acticycle'
    df.loc[(df['Licence plate'] == 'GP243HH') & (df['datetime'] >= cutoff), 'vehicle ID'] = 'Acticycle-ex-biro'
    df.loc[(df['Licence plate'] == 'GP243HH') & (df['datetime'] >= cutoff), 'Licence plate'] = "ACTI0004"

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

    # Affect locations
    df["location"] = "En transit"
    for dt in distrib_territoires:
        startdatetime = pd.to_datetime(dt["startDate"], format="%Y-%m-%d", utc=True)
        enddatetime = pd.to_datetime(dt["endDate"], format="%Y-%m-%d", utc=True)
        df.loc[(df["Licence plate"] == dt["plate"]) & (df["datetime"] >= startdatetime) & (df["datetime"] <= enddatetime), "location"] = dt["Location"]

    # Keep raw data
    raw_with_trip_ids = df[['Latitude (loc)', 'Longitude (loc)', 'UniqueTripID', 'Distance', 'location', 'Model']]

    # Group stats by trips
    df['latlng'] = list(zip(df['Latitude (loc)'], df['Longitude (loc)']))
    firsts = df.groupby('UniqueTripID').first()
    df_trips = df.groupby('UniqueTripID').agg(
        coords=('latlng', lambda x: x.tolist()), 
        timestamps=('datetime', lambda x: x.tolist()), 
        TotalDistanceKm=('Distance', "sum"), 
        AvgSpeed=('Speed (km/h)', 'mean'),
        StartTime=('datetime', 'first'),
        EndTime=('datetime', 'last')
    ).merge(firsts, on='UniqueTripID')

    # Drop useless columns
    df_trips.drop(columns=['Date & time', 'Driver', 'Trip ID', 'Trip Status', 'Latitude (loc)', 'Longitude (loc)',
        'Angle (loc)', 'Altitude (loc)', 'Mileage (km total)',
        'Energy level (%)', 'Energy level (L)', 'Energy level (Kwa)',
        'Consumption (L)', 'Consumption (Kwa)', 'Autonomy (km)', 'Speed (km/h)',
        'Accel X (mG)', 'Accel Y (mG)', 'Accel Z (mG)', 'Battery Temperature (°C)', 'SOH (%)',
        'SOC (%)', 'SOS (%)', 'EV Battery (V)', 'Battery (V)', 'Alert (code)',
        'CO2 (g)', 'Prev Latitude', 'Prev Longitude', 'Distance',
        'latlng', 'datetime'], inplace=True)
    df_trips.reset_index(inplace=True)

    # Reaffect locations after cleaning
    df_trips["location"] = "En transit"
    for dt in distrib_territoires:
        startdatetime = pd.to_datetime(dt["startDate"], format="%Y-%m-%d", utc=True)
        enddatetime = pd.to_datetime(dt["endDate"], format="%Y-%m-%d", utc=True)
        df_trips.loc[(df_trips["Licence plate"] == dt["plate"]) & (df_trips["StartTime"] >= startdatetime) & (df_trips["StartTime"] <= enddatetime), "location"] = dt["Location"]

    # Filter out trips with a distance of less than 100m
    df_trips = df_trips[df_trips.TotalDistanceKm > 0.01]

    return (raw_with_trip_ids, df_trips)
