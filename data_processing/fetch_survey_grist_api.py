from grist_api import GristDocAPI
import pandas as pd
import os

# GRIST_API_KEY should be in env

def fetch_and_save_survey_data():
    api = GristDocAPI(os.getenv("GRIST_DOC_ID"), server=os.getenv("GRIST_SERVER"))

    data = api.fetch_table(os.getenv("GRIST_TABLE_NAME"))
    df = pd.DataFrame(data)
    
    def create_columns_from_multiple_choice(df, column_name, mapping):
        if column_name in df.columns:
            dummies = pd.get_dummies(df[column_name].str[1:].explode())
            df.drop(columns=[column_name], inplace=True)
        else:
            dummies = pd.DataFrame()
        dummies.rename(columns=lambda x: mapping.get(x, x), inplace=True)
        dummies = dummies.reindex(mapping.values(), axis=1, fill_value=False)
        dummies = dummies.groupby(level=0).max()
        df = df.join(dummies)
        return df

    mapping_meteo = {
        "Ensoleillé": "meteo_ensoleille",
        "Nuageux": "meteo_nuageux",
        "Pluvieux": "meteo_pluvieux",
        "Venteux": "meteo_venteux",
        "Neigeux": "meteo_neigeux",
        "Brouillard": "meteo_brouillard",
        "Autre": "meteo_autre",
    }

    mapping_avantages = {
        "Aucun": "avantage_aucun",
        "Sentiment de vitesse agréable et d'agilité à se déplacer": "avantage_agilite",
        "Confort du véhicule": "avantage_confort",
        "Observation du paysage et des alentours": "avantage_observation",
        "Sentiment de fierté": "avantage_fierté",
        "Réactions positives des autres usagers vis à vis du véhicule": "avantage_reactions",
        "Bien être physique": "avantage_bien_etre",
        "Autre": "avantage_autre",
    }

    mapping_difficultes = {
        "Aucune": "difficulte_aucune",
        "Visibilité réduite": "difficulte_visibilite",
        "Aménagements": "difficulte_amenagement",
        "Stationnement": "difficulte_stationnement",
        "Problèmes avec le véhicule": "difficulte_vehicule",
        "Comportement des autres usagers de la route": "difficulte_comportement",
        "Autre": "difficulte_autre",
    }

    df = create_columns_from_multiple_choice(df, "meteo", mapping_meteo)
    df = create_columns_from_multiple_choice(df, "avantages", mapping_avantages)
    df = create_columns_from_multiple_choice(df, "difficultes", mapping_difficultes)

    if "date" in df.columns:
        df['date'] = df['date'].fillna(0).astype(int)
        df['date'] = pd.to_datetime(df['date'], unit='s')

    df.to_csv(os.getenv("SURVEY_OUTPUT_CSV_FILE"), sep=";")
