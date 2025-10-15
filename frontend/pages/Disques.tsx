import React, { useState } from "react"
import Disque from "../components/Disque"

const Disques = () => {
    const [evaluations, setEvaluations] = useState<string[]>([
        "Moyen",
        "Fort",
        "Fort",
        "Moyen",
        "Moyen",
        "Moyen",
        "Moyen",
        "Fort",
        "N/A",
        "Fort",
        "Moyen",
        "Fort",
        "Moyen",
        "Faible",
        "Moyen",
        "Moyen",
        "Moyen",
        "Moyen",
        "Moyen",
        "Fort",
        "Fort",
        "Fort",
        "Moyen",
        "Moyen",
        "Fort",
        "Fort",
        "Moyen",
        "N/A",
        "Faible",
        "Fort",
        "Fort",
        "Moyen",
        "Faible",
        "Faible",
        "Fort"
    ])
    return (
        <div className="main">
            <section className="section">
                <div className="container">
                    <div className="content">
                        <h1 className="title">
                            Expérimentation 30 VELI, disque d'évaluation
                        </h1>
                        {evaluations && evaluations.length && <Disque evaluations={evaluations}/>}
                        <textarea className="textarea" value={evaluations.join("\n")} onChange={(e) => setEvaluations(e.target.value.split("\n").filter(e => e !== ""))} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Disques