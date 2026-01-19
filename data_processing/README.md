# Data processing pipeline
This folder contains the tooling to process data before it can be used in the data visualisation.

It cleans and merges GPS data from Carmoove exports with user survey responses.

Data is fetched using the Carmoove API and a Grist API for survey data (a preconfigured Grist template is available in the docs folder).

## Environment setup
To ensure all dependencies are managed correctly, it is recommended to use a virtual environment (venv).

### 1. Create the virtual environment using python3.13
```bash
python -m venv .venv
```

### 2. Activate the environment:
```bash
source .venv/bin/activate
```

### 3. Installing Dependencies
Once the virtual environment is active, install the required libraries using the provided requirements.txt file

```bash
pip install -r requirements.txt
```

Required packages include:
* pandas (v2.3.3): For data manipulation
* h3pandas (v0.3.0): To generate H3-based heatmap aggregations
* grist-api (v0.1.1): To fetch survey data from Grist
* dotenv (v0.9.9): To load environment variables

## Environment variables configuration
Before running the script, you must set up a few environment variables in the `.env` file.

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `GRIST_SERVER` | Your Grist instance URL, french institutions and partners can use the state server provided by La Suite | https://grist.numerique.gouv.fr |
| `GRIST_API_KEY` | Grist API key, generated under profile settings -> API | UNSET |
| `GRIST_DOC_ID` | Grist document ID , found under settings -> API -> Document ID | UNSET |
| `GRIST_TABLE_NAME` | Grist table name containing survey results | Donnees_brutes |
| `SURVEY_OUTPUT_CSV_FILE` | Data fetched from Grist will be stored in this file, it's also the entry point for the data proessing | ./survey_sources/survey_data.csv |
| `CARMOOVE_API_URL` | URL of the Carmoove API | https://dynamic-data-api.carmoove.com/v1 |
| `CARMOOVE_APP_ID` | Carmoove API application ID | UNSET |
| `CARMOOVE_APP_KEY` | Carmoove API application key | UNSET |
| `CARMOOVE_NUMBER_DAYS_TO_FETCH` | Gps data will be fetched for the last X days. Should be short enough to minimize API calls, but long enough to fetch trips that weren't sent in real time. Should also be bigger than the number fo days between script runs | 3 |
| `CARMOOVE_EXPORTS_FOLDER` | Data fetched from Carmoove will be stored in this folder. Csv extracted using the Carmoove export interface can also be placed here, all csv files will be processed | ./carmoove_exports |
| `HEATMAPS_OUTPUT_FOLDER` | Folder where heatmap JSON files are stored, this will be read by the dataviz backend (hardcoded in index.ts) | ./dataviz/heatmaps | 
| `DATAVIZ_DATABASE_FILE` | Path to the SQLite database file used by the dataviz backend (hardcoded in index.ts) | ./dataviz/data.db |

## Launching the main process
The entry point for the entire pipeline is `main_process_sources.py`.

```bash
python main_process_sources.py
```

What the script does:
1. Fetches Carmoove data from the API and stores it as CSV files in the `CARMOOVE_EXPORTS_FOLDER` folder (./carmoove_exports by default)
2. Fetches survey data from the Grist API and stores it as a CSV file `SURVEY_OUTPUT_CSV_FILE` (./survey_sources/survey_data.csv by default)
3. Processes GPS data: detects individual trips and removes outliers
4. Processes survey data: Cleans responses and matches surveys to GPS trips based on time and licence plate
5. Generates Heatmaps: Creates H3-aggregated JSON files for each vehicle model
6. Saves Outputs:
* A SQLite database at `DATAVIZ_DATABASE_FILE` (../dataviz/data.db by default)
* JSON heatmap files in `HEATMAPS_OUTPUT_FOLDER` (../dataviz/heatmaps/ by default)

It is recommended to run the script every day or every week to ensure the latest data is available. A cron job can be used to automate this. Make sure to update the CARMOOVE_NUMBER_DAYS_TO_FETCH variable to match the frequency of your data.