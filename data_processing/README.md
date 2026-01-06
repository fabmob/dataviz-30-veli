# Data Processing Pipeline
This folder contains the tooling to process data before it can be used in the data visualisation.
It cleans and merges GPS data from Carmoove exports and GPX files with user survey responses.

## Environment Setup
To ensure all dependencies are managed correctly, it is recommended to use a virtual environment (venv).

1. Create the virtual environment using python3.13
```bash
python -m venv .venv
```

2. Activate the environment:
```bash
source .venv/bin/activate
```

3. Installing Dependencies
Once the virtual environment is active, install the required libraries using the provided requirements.txt file

```bash
pip install -r requirements.txt
```

Required packages include:
* pandas (v2.3.3): For data manipulation
* gpxpy (v1.6.2): To parse GPX files
* h3pandas (v0.3.0): To generate H3-based heatmap aggregations
* openpyxl (v3.1.5): To read Excel survey files

## Data Source Configuration
Before running the script, you must place your raw data in the following directories within the project root. The scripts are configured to look for files in specific locations that can be edited in the code.

### GPS Data
* carmoove_exports/: Place all CSV exports from the Carmoove website here
    These should contain columns such as 'Date & time', 'Licence plate', and 'Latitude (loc)'
* GPX/: Place GPX files here. Files must follow the naming convention DATE_VehicleName_XXX.gpx (e.g., 20251205_Galibot_1.gpx)

### Survey Data
* survey_sources/: This folder should contain Excel exports of the various questionnaires. The script automatically fetches the latest versions based on keywords in filenames:
* "Carnetdebord-": Daily trip logs
* "CarnetdebordPRO": Professional trip logs
* "Retourd": Tourism tryout questionnaires
* "Questionnaire1": Initial profile questionnaires
* Le_Mans_Carnet de bord PRO.xlsx: Specific file for Le Mans
* Niort Data: A specific file named carnet_niort_formated.csv is expected in the parent directory (../)

## Launching the Main Process
The entry point for the entire pipeline is `main_process_sources.py`. Run this script to execute the processing steps in order:

```bash
python main_process_sources.py
```

What the script does:
1. Processes GPS data: Merges Carmoove and GPX sources, detects individual trips, removes outliers
2. Processes survey data: Cleans responses, unifies territory/vehicle names, and matches surveys to GPS trips based on time and location
3. Generates Heatmaps: Creates H3-aggregated JSON files for each territory and vehicle model
4. Saves Outputs:
* A SQLite database at ../dataviz/data.db
* A lightweight CSV for Superset at ../trips_with_carnet_match_light.csv
* JSON heatmap files in ../dataviz/heatmaps/

## Customisation
Many data specific features are hardcoded in the code. Methods are extensively commented to help you understand how to customize the pipeline to your needs.

When running the script, you may see the following messages in your console:
* Unknown territory: [Name]
* Unknown vehicule: [Name]

These occur because survey participants often use varied spellings or names for vehicles and locations. They also occur when a new vehicle or location is added.

They are a good insight that something needs updating in the code.

### Adding a new vehicle
To add a new vehicle model or fix an "Unknown vehicule" error:

1. Open `process_gps_data.py` and locate the `distrib_territoires` list. Make sure that the new vehicle license plate is included and the location is correct. The license plate should exactly match the value in the carmoove exports.
    GPX data requires hard-coding a license plate in the `add_gpx_to_df` function.
2. Update Survey Mapping: Open `process_carnet.py` and locate the `fix_vehicules_names` function. Add the new name (as it appears in the error) and its intended unified name to the `vehicule_mapping` dictionary.
* Example: 'BAGNOLE': "La Bagnole"
3. (Optional) Hard-coded Overrides: If the vehicle requires specific logic (like the "Daily" being renamed to "Maillon Mobility"), update the cleanup section in `process_gps_data.py`.

### Adding a new territory
1. Open `process_gps_data.py` and locate the `distrib_territoires` list. This is the source of truth for vehicle locations. Add a new entry following this format: `{"plate": "LICENSE_PLATE", "startDate": "YYYY-MM-DD", "endDate": tomorrow, "Location": "Official Territory Name"}`.
    If a vehicle has moved to a new territory, do not forget to update the endDate of its previous location.
2. Open `process_carnet.py` and locate the `fix_territories_names` function. Add new mappings to `territoires_mapping` to link common user spellings to the Official Territory Name you used in Step 1. Example: 'Millau': 'PNR Grand Causses'
3. (Optional) Map New "Points Noirs" If users report specific dangerous locations in the new territory, you can manually add their coordinates in `process_carnet.py` within the `add_point_noir_coords` function.

Note that the chosen "Official Territory Name" should exactly match the spelling used in the dataviz `constants.tsx` file. Overall consistency in naming vehicles and locations is recommended.

### Summary

![](info_summary.png)