import React, { createContext } from "react"
import { BrowserRouter, Route, Routes } from "react-router"

import * as types from './types'

import NavBar from "./components/NavBar"
import SettingsModal from "./components/SettingsModal"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Stats from "./pages/Stats"
import Export from "./pages/Export"
import Vehicles from "./pages/Vehicles"
import EmbedMap from "./pages/EmbedMap"
import Disques from "./pages/Disques"

const SettingsContext = createContext<types.SettingsContextType>({
    settings: {
        show: false,
        location: "Tous",
        model: "Tous",
        showOnlyPointNoir: false
    },
    setSettings: function (value: React.SetStateAction<types.Settings>): void {
        throw new Error("Function not implemented.")
    }
})

const App = () => {
    const [settings, setSettings] = React.useState({
        show: false,
        location: "Tous",
        model: "Tous",
        showOnlyPointNoir: false
    })
    return (
        <BrowserRouter>
            <SettingsContext.Provider value={{ settings, setSettings }}>
                <SettingsModal SettingsContext={SettingsContext}/>
                <NavBar />
                <Routes>
                    <Route path="/profile" element={<Profile/>} />
                    <Route path="/export" element={<Export/>} />
                    <Route path="/stats/:location" element={<Stats/>} />
                    <Route path="/stats" element={<Stats/>} />
                    <Route path="/vehicles" element={<Vehicles/>} />
                    <Route path="/disques" element={<Disques/>} />
                    <Route path="/embedmap" element={<EmbedMap SettingsContext={SettingsContext}/>} />
                    <Route path="/embedmap/:location" element={<EmbedMap SettingsContext={SettingsContext}/>} />
                    <Route path="/:carnetIndex" element={<Home SettingsContext={SettingsContext}/>} />
                    <Route path="/" element={<Home SettingsContext={SettingsContext}/>} />
                </Routes>
                <Footer />
            </SettingsContext.Provider>
        </BrowserRouter>
    )
}

export default App
