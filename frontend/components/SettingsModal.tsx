import React, { useContext, useEffect } from "react"
import * as types from "../types"
import { modelPicturesMap, locations } from "../constants"

const SettingsModal = ({SettingsContext} : {SettingsContext: React.Context<types.SettingsContextType>}) => {
    const { settings, setSettings } = useContext(SettingsContext)
    const [tempSettings, setTempSettings] = React.useState(settings)

    useEffect(() => {
        setTempSettings(settings)
    }, [settings])
    
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <div className={`modal ${settings.show ? "is-active" : ""}`} style={{zIndex: 1010}}>
            <div className="modal-background" onClick={() => setSettings({...settings, show: false})}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Paramètres</p>
                    <button className="delete" onClick={() => setSettings({...settings, show: false})}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label">Territoire</label>
                        <div className="select">
                            <select value={tempSettings.location} onChange={(e) => setTempSettings({...tempSettings, location: e.target.value})}>
                                {locations.map((location, index) => <option key={index} value={location}>{location}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">VELI</label>
                        <div className="select">
                            <select value={tempSettings.model} onChange={(e) => setTempSettings({...tempSettings, model: e.target.value})}>
                                {Object.keys(modelPicturesMap).map((model, index) => <option key={index} value={model}>{model}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Afficher uniquement les expériences avec un point noir géolocalisé</label>
                        <div className="select">
                            <select value={tempSettings.showOnlyPointNoir ? "true" : "false"} onChange={(e) => setTempSettings({...tempSettings, showOnlyPointNoir: e.target.value === "true"})}>
                                <option value="false">Non</option>
                                <option value="true">Oui</option>
                            </select>
                        </div>
                    </div>
                    <button className="button is-primary" onClick={() => setSettings({...tempSettings, show: false})}>Appliquer</button>
                </section>
            </div>
        </div>
    )
}

export default SettingsModal