import React, { useState } from "react"
import { Link } from "react-router"

const NavBar = () => {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    // if embed mode, don't show header
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item" to="/">
                    <h1>Dataviz 30 VELI</h1>
                </Link>

                <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={_ => setShowMobileNavBar(!showMobileNavBar)}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navbarBasicExample" className={"navbar-menu " + (showMobileNavBar ? "is-active" : "")}>
                <div className="navbar-start">
                    <Link className="navbar-item" to="/">
                        Vue d'ensemble
                    </Link>
                    <Link to="/profile" className="navbar-item">
                        Filtre par profil usager
                    </Link>
                    <Link to="/stats" className="navbar-item">
                        Statistiques
                    </Link>
                    <Link to="/export" className="navbar-item">
                        Export de données
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default NavBar