import React from "react"

const Export = () => {
    const experiencesMeta = [
        {column: "Model", description: "Non utilisé"},
        {column: "vehicule", description: "Nom du VELI utilisé"},
        {column: "totalDistanceKm", description: "Distance totale parcourue durant l'expérience (calculé automatiquement)"},
        {column: "nbTrips", description: "Nombre de trajets distincts durant l'expérience (calculé automatiquement)"},
        {column: "territoire", description: "Lieu"},
        {column: "heure_debut", description: "Heure de début"},
        {column: "heure_fin", description: "Heure de fin"},
        {column: "carnetEntryIndex", description: "Référence pour visualisation"},
        {column: "moment", description: "Moment de la journée (soir, nuit..)"},
        {column: "meteo_ensoleille", description: "1 en cas de soleil, 0 sinon"},
        {column: "meteo_nuageux", description: "idem"},
        {column: "meteo_pluvieux", description: "idem"},
        {column: "meteo_venteux", description: "idem"},
        {column: "meteo_neigeux", description: "idem"},
        {column: "meteo_brouillard", description: "idem"},
        {column: "meteo_autre", description: "Champ libre sur la météo"},
        {column: "motif", description: "Raison du déplacement"},
        {column: "avantage_aucun", description: "1 si aucun avantage identifié, 0 sinon"},
        {column: "avantage_agilite", description: "1 si sentiment de vitesse agréable et d'agilité à se déplacer, 0 sinon"},
        {column: "avantage_confort", description: "1 si confort du véhicule, 0 sinon"},
        {column: "avantage_observation", description: "1 si observation du paysage et des alentours, 0 sinon"},
        {column: "avantage_fierté", description: "1 si sentiment de fierté, 0 sinon"},
        {column: "avantage_reactions", description: "1 si réactions positives des autres usagers vis-à-vis du véhicule, 0 sinon"},
        {column: "avantage_bien_etre", description: "1 si bien être physique, 0 sinon"},
        {column: "avantage_autre", description: "Champ libre sur les avantages perçus"},
        {column: "difficulte_aucune", description: "1 si aucune difficulté identifiée, 0 sinon"},
        {column: "difficulte_visibilite", description: "1 si visibilité réduite, 0 sinon"},
        {column: "difficulte_amenagement", description: "1 si difficulté d'aménagements, 0 sinon"},
        {column: "difficulte_stationnement", description: "1 si difficulté de stationnement, 0 sinon"},
        {column: "difficulte_vehicule", description: "1 si problèmes avec le véhicule, 0 sinon"},
        {column: "difficulte_comportement", description: "1 si difficulté de comportement des autres usagers de la route, 0 sinon"},
        {column: "difficulte_autre", description: "Champ libre sur les difficultés perçues"},
        {column: "point_noir_1", description: "Lieu d'un point sur le trajet où les difficultés ont été rencontrées"},
        {column: "point_noir_2", description: "idem"},
        {column: "bilan", description: "Bilan de l'expérience (Très positif, Positif, Négatif, Très négatif)"},
        {column: "commentaires", description: "Commentaire libre sur l'expérience"},
        {column: "point_noir_1_lon", description: "Géolocalisation du point noir (longitude)"},
        {column: "point_noir_1_lat", description: "Géolocalisation du point noir (latitude)"},
        {column: "mode_domicile_travail", description: "Modes habituels utilisé par le testeur sur ses trajets domicile travail (séparés par des virgules)"},
        {column: "mode_domicile_etudes", description: "Modes habituels utilisé par le testeur sur ses trajets domicile études (séparés par des virgules)"},
        {column: "mode_domicile_loisirs", description: "Modes habituels utilisé par le testeur sur ses trajets loisirs (séparés par des virgules)"},
        {column: "edits", description: "Non utilisé"},
    ]
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Expérimentation 30 VELI, export de données
                        </h1>
                        <p>
                            Les jeux de données suivants sont distribués sous licence libre <a href="https://spdx.org/licenses/ODbL-1.0.html">ODbL</a>. 
                        </p>
                        <p>
                            Ils sont donc réutilisables et modifiables, sous réserve de maintien de la licence ODbL et citation de la source: Expérimentation 30 VELI, Fabrique des Mobilités, ADEME.
                        </p>

                        <h2 className="subtitle">
                            Extrait anonymisé des expériences utilisateur
                        </h2>
                        <p>
                            <a href="/cache/30veli_export_experiences.csv">Télécharger les données (format CSV)</a>, la génération peut prendre quelques instants.
                        </p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom de la colonne du fichier CSV</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiencesMeta.map((meta, index) => <tr key={index}>
                                    <td>{meta.column}</td>
                                    <td>{meta.description}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Export