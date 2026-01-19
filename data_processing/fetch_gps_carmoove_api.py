import pandas as pd
import requests
import json
import time
import datetime
import os

def get_token():
    url = f"{os.getenv('CARMOOVE_API_URL')}/login"

    payload = json.dumps({
        "appId": os.getenv("CARMOOVE_APP_ID"),
        "appKey": os.getenv("CARMOOVE_APP_KEY")
    })
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    res = response.json()
    return res['token']

def get_vehicles_history(token, start_ts, limit=1000, offset=0):
    url = f'{os.getenv('CARMOOVE_API_URL')}/vehicles/history?from={start_ts}&limit={limit}&offset={offset}'
    headers = {
        'x-carmoove-token': token,
        'Content-Type': 'application/json'
    }
    response = requests.request("GET", url, headers=headers, data={})
    if response.status_code != 200:
        print(response.text)
        return []
    res_json = response.json()
    return res_json['status']

def get_all_vehicles_history_from_ts(token, start_ts):
    vehicles_history = []
    offset = 0
    while True:
        vehicles_history_page = get_vehicles_history(token, start_ts=start_ts, limit=1000, offset=offset)
        vehicles_history.extend(vehicles_history_page)
        if len(vehicles_history_page) < 1000:
            break
        offset += 1000
    return vehicles_history

def fetch_and_save_recent_gps_data():
    token = get_token()
    nb_days = os.getenv("CARMOOVE_NUMBER_DAYS_TO_FETCH", "3")
    start_date = datetime.datetime.now() - datetime.timedelta(days=int(nb_days))
    start_ts = int(start_date.timestamp())
    vehicles_history = get_all_vehicles_history_from_ts(token, start_ts=start_ts)

    df = pd.DataFrame.from_records(vehicles_history)

    df_ts = df['timestamp']
    df_veh = pd.DataFrame.from_records(df['vehicle'])
    df_location = pd.DataFrame.from_records(df['location'])
    df_status = pd.DataFrame.from_records(df['status'])
    df_electric = pd.DataFrame.from_records(df['electric'])
    # df_sensors = pd.DataFrame.from_records(df['sensors'])

    df = pd.concat([df_ts, df_veh, df_location, df_status, df_electric], axis=1)
    
    # Ensures compatibility with manual exports
    df.rename(columns={
        'longitude': 'Longitude (loc)',
        'latitude': 'Latitude (loc)',
        'altitude': 'Altitude (loc)',
        'angle': 'Angle (loc)',
        'model': 'Model',
        'brand': 'Brand',
        'plate': 'Licence plate',
        'vin': 'VIN',
        'id': 'vehicle ID'
    }, inplace=True)

    start_date_str = start_date.strftime("%Y%m%d")
    now_date_str = datetime.datetime.now().strftime("%Y%m%d")

    df.to_csv(f"{os.getenv('CARMOOVE_EXPORTS_FOLDER')}/{start_date_str}-{now_date_str}.csv", sep=";")