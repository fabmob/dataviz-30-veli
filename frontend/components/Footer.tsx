import React from "react"

const Footer = () => {
    // if embed mode, don't show footer
    if (window.location.search.includes("embed=true")) {
        return null
    }
    return (
        <footer className="footer">
            <div className="content has-text-centered">
                <p>
                    Un site proposé en <a href="https://github.com/fabmob/dataviz-30-veli">open source</a> par <a href="https://lafabriquedesmobilites.fr/">la Fabrique des Mobilités</a>.
                </p>
            </div>
        </footer>
    )
}
export default Footer