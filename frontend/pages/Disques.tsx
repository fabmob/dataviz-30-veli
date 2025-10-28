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
            "BIRO": ["","","","moyen","moyen","moyen","moyen","","fort","","Fort","","","","","Moyen","","","","","","","Fort","","Fort","Moyen","Fort","moyen","moyen","fort","fort","faible","faible","","","Fort"],
            "WEEZ": ["","","","moyen","moyen","moyen","fort","","fort","","Faible","","","","","Moyen","","","","","","","Fort","","Fort","Moyen","Fort","moyen","moyen","fort","fort","faible","moyen","","",""],
            "Urbaner": ["","","","moyen","moyen","moyen","faible","","fort","","Moyen","","","","","Faible","","","","","","","Fort","","Fort","Moyen","Fort","moyen","moyen","fort","fort","moyen","Faible","","","fort"],
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
            "BIRO": ["","","","faible","Moyen","Fort","Moyen","","moyen","","faible","","","","","Moyen","","","","","","","Fort","","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","Moyen","Faible","","","Fort",],
            "WEEZ": ["","","","faible","Moyen","Fort","Moyen","","moyen","","faible","","","","","Fort","","","","","","","Fort","","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","faible","faible","","","Fort"],
            "Urbaner": ["","","","faible","Moyen","Fort","Faible","","moyen","","faible","","","","","moyen","","","","","","","Fort","","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","Fort","faible","","","Fort"],
            "Formidable": ["","","","faible","Moyen","Fort","Moyen","","moyen","","faible","","","","","moyen","","","","","","","Fort","","Moyen","Fort","moyen","moyen","Moyen","moyen","fort","fort","faible","","","Fort"],
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
            "Acticyle": ["","","","moyen","moyen","fort","moyen","","","","moyen","","","","","fort","","","","","","","fort","","moyen","moyen","fort","faible","","moyen","fort","fort","","","","faible"],
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
    }
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