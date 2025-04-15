import React, { useEffect, useState } from "react"
import { Pie } from 'react-chartjs-2'
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)
import * as types from "../types"


const pieColors = {
    "Très positif": "rgb(72, 199, 142)",
    "Positif": "rgb(66, 88, 255)",
    "Négatif": "rgb(255, 183, 15)",
    "Très négatif": "rgb(255, 102, 133)",
    "Trajets sans bilan": "rgb(170, 170, 170)"
}

interface ChartData {
    labels: string[],
    datasets: {
        label: string,
        data: number[],
        backgroundColor: string[]
    }[]
}

const PieChart = ({ data , label } : { data: types.BilanDataType, label: string}) => {
    const [chartData, setChartData] = useState<null | ChartData>(null)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as "bottom"
            }
        }
    }
    useEffect(() => {
        let sortedEntries = Object.keys(pieColors).map(bilan => data[bilan] ? [bilan, data[bilan]] : null).filter(e => e) as [string, number][]
        setChartData({
            labels: sortedEntries.map(([key, value]) => `${key} (${value})`),
            datasets: [{
                label: label || '',
                data: sortedEntries.map(([key, value]) => value),
                backgroundColor: sortedEntries.map(([key, value]) => pieColors[key])
            }]
        })
    }, [data]) 

    return (
        <div style={{height: "150px"}}>
            {chartData && <Pie
                width={300}
                style={{margin: "auto"}}
                options={chartOptions}
                data={chartData}
            />}
        </div>
    )
}

export default PieChart