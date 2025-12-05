import React, { use, useState, useEffect } from "react"
import Disque from "../components/Disque"

const evaluationsData = {
    "Commune du Teil": {
        "vehicles": {
            "Urbaner": ["Moyen","Fort","Fort","Moyen","Moyen","Moyen","Moyen","Fort","","fort/moyen/faible","Fort","Moyen","Fort","Moyen","Faible","Moyen","Moyen","Moyen","Moyen","Moyen","Fort","Fort","Fort","Moyen","Moyen","Fort","Fort","Moyen","Moyen","Faible","Fort","Fort","Moyen","Faible","Faible","Fort"],
            "BIRO": ["","","","Moyen","Moyen","Moyen","faible","","","","faible","","","","","fort","","","","Moyen","Fort","Fort","Fort","","Moyen","Fort","Fort","Moyen","Moyen","Faible","Fort","Faible","Faible","","","Fort"],
            "WEEZ": ["","","","Moyen","Moyen","Moyen","Moyen","","","","","","","","","fort","","","","Moyen","Fort","Fort","Fort","","Moyen","Fort","Fort","Moyen","Moyen","Faible","Fort","Moyen","Faible","","","Fort"],
            "Cyclospace": ["","","","Moyen","Moyen","Moyen","moyen","","","","Fort","Moyen","","","","moyen","","","","Moyen","Fort","Fort","Fort","","Moyen","Fort","Fort","Moyen","Moyen","Faible","Fort","Fort","Faible","","","Fort"]
        },
        "desc": `Territoire : Le Teil
            Région : Auvergne-Rhône-Alpes
            Zone : Rurale (La ville compte deux quartiers prioritaires, concentrant plus d’un quart des habitants)
            Dénivelés : moyens
            Periode d’expérimentation : de janvier 2024 au décembre 2025
            Vélis testés : Biro, Weez, 2 Urbaner, Cyclospace
            Cas d’usage testés : trajets proffesionels des salaries de deux entreprises à but d’emploi du territoire ; déplacement du qouotidien des habitants : courses, trajets domicile-travail, loisirs… ; livraison des répas : Déclic et des Claps (Entreprise à But d’Emploi) a réalisé des livraisons de repas en Urbaner ; prêt du cyclospace à une agence inmobilière pour les trajets proffesionels avec des clients.
            Profil d’usagers : Salariés et habitants
            Parties prenantes du projet : Commune et Associations Mobilité 07-26 et ActiviTeil
            Fiche wiki pour savoir plus : https://wikixd.fabmob.io/wiki/Commune_Le_Teil
        `
    },
    "Grand Pic Saint Loup": {
        "vehicles": {
            "BIRO": ["Fort","Faible","Moyen","Moyen","moyen","Moyen","Moyen","Moyen","Fort","Faible","Fort","Moyen","Faible","Fort","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Fort","Fort","Fort","Fort","Fort","Moyen","Fort","moyen","moyen","fort","fort","faible","faible","","","Fort"],
            "WEEZ": ["Fort","Faible","Moyen","moyen","moyen","moyen","fort","Fort","fort","Fort","Faible","Moyen","Faible","Moyen","Moyen","Moyen","Fort","Fort","Fort","Moyen","Fort","Fort","Fort","Fort","Fort","Moyen","Fort","moyen","moyen","fort","fort","faible","moyen","","","fort"],
            "Urbaner": ["Fort","Faible","Moyen","moyen","moyen","moyen","faible","Fort","fort","Faible","Moyen","Fort","Faible","Moyen","Faible","Faible","Fort","faible","Fort","Moyen","Moyen","Faible","Fort","Fort","Fort","Moyen","Fort","moyen","moyen","fort","fort","moyen","Faible","","","fort"],
        },
        "desc": `Territoire : Communauté de Communes de Grand Pic Saint Loup
            Région : Occitanie
            Zone : Périurbaine (36 communes, 57 hectares, 50 892 (2022) habitants)
            Dénivelés moyens : relief plus ou moins prononcé, 90% d’espaces naturels et agricoles
            Periode d’expérimentation : octobre 2023 à décembre 2025
            Vélis testés : Biro, Weez, Urbaner
            Cas d’usage testés : Trajets du quotidien, déplacement des agents communaux, prévention incendie
            Profil d’usagers : Actifs, retraités, agents communaux
            Parties prenantes du projet : CC, Département de l’Herault, Association VELO VTT CLUB de ST-MATHIEU, Cerema
            Fiche wiki pour savoir plus : : https://wikixd.fabmob.io/wiki/CC_Grand_Pic_Saint_Loup`
    },
    "CC Clunisois": {
        "vehicles": {
            "BIRO": ["Moyen","Faible","Fort","faible","Moyen","Fort","Moyen","Moyen","moyen","Moyen","faible","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Faible","Moyen","Fort","Fort","Fort","Faible ","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","Moyen","Faible","","","Fort"],
            "WEEZ": ["Moyen","Faible","Moyen","faible","Moyen","Fort","Moyen","Fort","Moyen","Moyen","faible","Moyen","Moyen","Faible","Moyen","Fort","Moyen","Moyen","Faible","Moyen","Fort","Faible","Fort","Faible","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","faible","faible","","","Fort"],
            "Urbaner": ["Moyen","Faible","Moyen","Faible","Moyen","Fort","Faible","Fort","moyen","Faible","Faible","Faible","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Fort","Moyen","Moyen","Fort","Fort","Faible","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","Fort","Faible","","","Fort"],
            "Formidable": ["Moyen","Faible","Moyen","faible","Moyen","Fort","Moyen","Fort","moyen","Fort","faible","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Moyen","Fort","Moyen","Moyen","Fort","Fort","Faible","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","fort","faible","","","Fort"],
        },
        "desc": `Territoire : Communauté de communes du Clunisois
            Région : Bourgogne Franche Comté
            Zone : rurale
            Dénivelés : moyens
            Vélis testés : Biro, Weez, Urbaner, Galian
            Periode d’expérimentation : janvier 2024 - décembre 2025
            Cas d’usage testés : déplacements professionnels des agents de la CC du Clunisois et trajets du quotidien : domicile – travail, courses, loisirs…
            Profil d’usagers : Salariés, retraités, associations.
            Parties prenantes du projet : Communauté de Communes, Cerema, Département de Saône et Loire
            Fiche wiki pour savoir plus : https://wikixd.fabmob.io/wiki/Communauté_de_communes_du_Clunisois
        `
    },
    "Avant Pays Savoyard": {
        "vehicles": {
            "Acticyle": ["Fort","Moyen","Fort","Moyen","Moyen","fort","Moyen","Fort","","Faible","moyen","","Fort","Fort","Faible","Fort","Moyen","","Moyen","","Moyen","Moyen","Fort","","Moyen","Moyen","Fort","Faible","","Moyen","Fort","Fort","","","",""],
        },
        "desc": `Territoire : Avant Pays Savoyard
            Région : Auvergne-Rhône-Alpes
            Zone : rurale
            Dénivelés : moyens
            Periode d’expérimentation : janvier 2025 - décembre 2025
            Vélis testés : 2 Acicycle
            Cas d’usage testés : trajets du quotidien
            Profil d’usagers : actifs et retaités (trajets domicile-travail à pas plus de 10km)
            Parties prenantes du projet : SMAPS, Asso Vélo Solaire Pour Tous, ACT 4 Future, Mairie de St-Genix Les Villages, Agence écomobilité Savoie-Mont-Blanc
            Fiche wiki pour savoir plus : https://wikixd.fabmob.io/wiki/Avant-pays_savoyard
        `
    },
    "CC Briançon": {
        "vehicles": {
            "WEEZ": ["Fort","Moyen","Moyen","","","Faible","Faible","Fort","Fort","Fort","Fort","Moyen","","Faible","Fort","Fort","Fort","Faible","Moyen","Faible","Moyen","Faible","Moyen","","","Moyen","Faible","Faible","","","Moyen"],
            "La Bagnole": ["Faible","Fort","Fort","Faible","Moyen","Fort","Fort","Fort","","Fort","Fort","Faible","Moyen","Moyen","Moyen","Fort","Moyen","","Moyen","Fort","Moyen","Fort","Faible","Moyen","faible","moyen","faible","moyen","","","moyen","Moyen","faible","","","moyen"]
        },
        "desc": `Territoire : Communauté de communes du Briançonnais
            Région : Provence-Alpes-Côte d’Azur
            Zone : Rural et Montagnard
            Dénivelés : forts
            Periode d’expérimentation : janvier - décembre 2025
            Vélis testés : Weez et Bagnole
            Cas d’usage testés : Trajets proffessionels des agents communaux, déplacement du quotidien des habitants volontaires.
            Profil d’usagers : Actifs et retraités
            Parties prenantes du projet : Commune de Villard-St-Pancrace, Commune de Montgenèvre, Commune de Puy-Saint-André et la CC de Briançonnais

            Fiche wiki pour savoir plus : https://wikixd.fabmob.io/wiki/Communauté_de_Communes_du_Briançonnais
        `
    },
    "La Chapelle-Thouarault": {
        "vehicles": {
            "WEEZ": ["Fort","Fort","Fort","faible","fort","Moyen","Fort","Moyen","","Fort","Faible","Moyen","Faible","Moyen","","Moyen","Moyen","Moyen","Moyen","Moyen","Fort","Fort","fort","Faible","moyen","moyen","faible","faible","","faible","fort","faible","faible","","","moyen"],
            "Urbaner": ["Fort","Moyen","Fort","moyen","fort","Moyen","Moyen","Moyen","","Fort","moyen","Faible","Moyen","Fort","","Moyen","Faible","","Moyen","Faible","Faible","Fort","Fort","Faible","Moyen","Moyen","Faible","Faible","","faible","fort","fort","faible","","","moyen"]
        },
        "desc": ``
    },
    "CC 7 Vallées": {
        "vehicles": {
            "Galibot": ["Moyen","faible","Fort","moyen","faible","moyen","fort","Fort","faible","","faible","faible","Moyen","fort","Moyen","fort","moyen","Moyen","moyen","moyen","moyen","Fort","moyen","","moyen","fort","fort","moyen","","faible","fort","moyen","","","","faible"],
            "Urbaner": ["moyen","moyen","fort ","moyen","moyen","moyen","moyen","fort ","moyen","Moyen","fort","fort ","fort ","moyen","","faible","Moyen","Moyen","fort ","Moyen","moyen","fort ","moyen","fort ","moyen","fort","fort","moyen","","faible","fort","moyen","","","","faible"]
        },
        "desc": ``
    },
    "Commune des Mureaux": {
        "vehicles": {
            "Urbaner": ["Moyen","fort","","moyen","fort","moyen","faible","Fort","","Faible","moyen","Faible","fort ","fort ","Faible","moyen","moyen","faible","Fort ","faible","Moyen","Fort","fort","Faible","moyen","moyen","fort","fort","moyen","faible","fort","fort","","","","fort"],
            "BIRO": ["moyen","fort","fort","moyen","fort","moyen","moyen","Faible ","","Faible ","faible","Faible ","Faible ","Fort","Moyen","faible","moyen","moyen","Faible ","moyen","?","Fort","fort","Faible","moyen","moyen","fort","fort","moyen","faible","fort","fort","","","","fort"],
            "WEEZ": ["moyen","fort","Fort","moyen","fort","moyen","fort","moyen","","Moyen","moyen","moyen","moyen","fort","Fort","fort","moyen","fort","Fort","Fort","","Fort","fort","Faible","moyen","moyen","fort","fort","moyen","faible","fort","moyen","","","","fort"],
            "Karbikes": ["moyen","Fort","Moyen","moyen","fort","moyen","moyen","Fort","","Faible","fort","Fort","Fort","Fort","Moyen","fort","moyen","moyen","Faible","faible","Moyen","Fort","fort","Faible","moyen","moyen","fort","fort","moyen","faible","fort","fort","","","","fort"],
        },
        "desc": ``
    },
    "PNR Grand Causses": {
        "vehicles": {
            "WEEZ": ["Fort","Faible","Fort","","","","","Fort","","Fort ","Fort ","Moyen","Moyen","Fort ","Fort ","","Fort ","","Moyen","Fort ","Fort ","Fort ","","Fort ","","","","","","","","","","","",""],
            "BIRO": ["FORT","Faible","Fort","","","","moyen","Fort","","Moyen","Fort","Fort","Moyen","Moyen","Moyen","fort","Moyen","","Faible","Moyen","Fort","Fort","fort","Fort","moyen","moyen","fort","fort","","fort","fort","","","","",""],
            "Acticyle": ["FORT","Faible","Moyen","","","","fort","Moyen","","Fort","Moyen","Faible","Moyen","Fort","Faible","Moyen","","","","","","","fort","Fort","moyen","moyen","fort","fort","","fort","fort","","","","","",],
            "Podbike": ["FORT","Faible","Faible","","","","faible","Fort","","Moyen","Faible","Faible","Moyen","Moyen","Faible","fort","Faible","faible","Fort","Faible","","","fort","Fort","moyen","moyen","fort","fort","","fort","fort","","","","",""],
            "Karbikes": ["FORT","Faible","Moyen","Moyen","fort","fort","moyen","Fort","","Fort","Moyen","Faible","Moyen","Fort","Faible","fort","Fort","","Faible","Moyen","Faible","Moyen","fort","Fort","moyen","moyen","fort","fort","","fort","fort","","","","",""],
        },
        "desc": ``
    },
    "Loos en Gohelle": {
        "vehicles": {
            "Karbikes": ["","","","moyen","fort","moyen","fort","","moyen","","faible","","","","","fort","","","","","","","moyen","","fort","moyen","fort","moyen","","faible","fort","fort","","","","",],
        },
        "desc": ``
    },
    "Centre Hospitalier de Niort": {
        "vehicles": {
            "WEEZ": ["fort","","fort","moyen","fort","moyen","fort","faible","","","faible","","fort","fort","fort","fort","","","faible","moyen","moyen","","fort","","moyen","faible","fort","faible","moyen","faible","fort","","","","","moyen"],
            "Maillon Mobility": ["fort","","fort","moyen","fort","moyen","faible","moyen","","faible","moyen","","moyen","fort","moyen","moyen","moyen","moyen","moyen","fort","","","fort","moyen","moyen","faible","fort","faible","moyen","faible","fort","","","","","moyen",],
        },
        "desc": ``
    },
    "Le Mans": {
        "vehicles": {
            "WEEZ": ["","","","faible","faible","moyen","fort","","","","faible","","","","","moyen","","","","","","","moyen","","moyen","moyen","moyen","moyen","","faible","moyen","faible","","","","faible",],
            "Urbaner": ["","","","faible","faible","moyen","moyen","","","","faible","","","","","moyen","","moyen","","","","","moyen","","moyen","moyen","moyen","moyen","","faible","moyen","moyen","","","","faible",],
            "Maillon Mobility": ["","","","faible","faible","moyen","","","","","moyen","","","","","fort","","","","","","","moyen","","moyen","moyen","moyen","moyen","","faible","moyen","moyen","","","","faible",],
        },
        "desc": ``
    },
    "CA du Grand Avignon": {
        "vehicles": {
            "Karbikes": ["","","","fort","fort","fort","fort","","","","moyen","","","","","fort","","","","","","","fort","","fort","moyen","fort","fort","","moyen","fort","fort","","","","moyen",],
            "Maillon Mobility": ["","","","fort","fort","fort","fort","","","","moyen","","","","","moyen","","","","","","","fort","","fort","moyen","fort","fort","","moyen","fort","fort","","","","moyen",],
        },
        "desc": ``
    },
}
const Select = ({options, selected, onChange}) => {
    return (
        <div className="select ml-2 mr-2">
            <select value={selected} onChange={(e) => onChange(e.target.value)}>
                {options.map((option, index) => <option key={index} value={option}>{option}</option>)}
            </select>
        </div>
    )
}

const Desc = ({description}) => {
    const splitDescription = description.split("\n")
    return (
        <table>
            <tbody>
                {splitDescription.map((line, index) => 
                    <tr key={index}><td>{line.split(":")[0]}</td><td>{line.split(":").slice(1).join(":")}</td></tr>
                )}
            </tbody>
        </table>
    )
}
const Disques = () => {
    const [location, setLocation] = useState("Commune du Teil")
    const [vehicule, setVehicule] = useState("Urbaner")
    const [evaluations, setEvaluations] = useState([])

    const availableLocations = Object.keys(evaluationsData)
    const availableVehicules = Object.keys(evaluationsData[location].vehicles)
    
    useEffect(() => {
        setVehicule(availableVehicules[0])
    }, [location])

    useEffect(() => {
        setEvaluations(evaluationsData[location].vehicles[vehicule])
    }, [vehicule])
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Expérimentation 30 VELI, disque d'évaluation
                        </h1>
                        <div style={{"lineHeight": "40px"}}>
                            Territoire
                            <Select options={availableLocations} selected={location} onChange={(value) => setLocation(value)}/>
                            VELI 
                            <Select options={availableVehicules} selected={vehicule} onChange={(value) => setVehicule(value)}/>
                        </div>

                        {evaluations && evaluations.length && <Disque evaluations={evaluations}/>}
                        {<Desc description={evaluationsData[location].desc}/>}
                        {/* <textarea className="textarea" value={evaluations.join("\n")} onChange={(e) => setEvaluations(e.target.value.split("\n").filter(e => e !== ""))} /> */}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Disques