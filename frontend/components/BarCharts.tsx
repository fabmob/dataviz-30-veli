import React, { useEffect, useState } from "react"
import { Bar } from 'react-chartjs-2'
import {Chart, CategoryScale, LinearScale, Tooltip, Legend, BarElement} from 'chart.js'
Chart.register(CategoryScale, LinearScale, Tooltip, Legend, BarElement)
import * as types from "../types"


interface ChartData {
    labels: string[],
    datasets: {
        label: string,
        data: number[],
        backgroundColor?: string
    }[]
}

const TripModelBarChart = ({ data, workFilter } : { data: types.ModelTripStatType, workFilter: boolean}) => {
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
        if (!data) return
        const labels = Object.keys(data)
        if (labels.length === 0) return
        if (!workFilter) {
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Nombre de trajets analysés',
                        data: Object.values(data).map((d) => d.nbTrips),
                        backgroundColor: 'rgb(255, 99, 132)',
                    },
                    {
                        label: 'Distance moyenne (km)',
                        data: Object.values(data).map((d) => d.avgDistanceKm),
                        backgroundColor: 'rgb(54, 162, 235)',
                    },
                    {
                        label: 'Distance médiane (km)',
                        data: Object.values(data).map((d) => d.medianDistanceKm),
                        backgroundColor: 'rgb(255, 206, 86)',
                    },
                ]
            })
        } else {
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Nombre de trajets domicile-travail analysés',
                        data: Object.values(data).map((d) => d.nbTripsTravail),
                        backgroundColor: 'rgb(233, 37, 79)',
                    },
                    {
                        label: 'Distance moyenne domicile-travail (km)',
                        data: Object.values(data).map((d) => d.avgDistanceKmTravail),
                        backgroundColor: 'rgb(30, 149, 228)',
                    },
                    {
                        label: 'Distance médiane domicile-travail (km)',
                        data: Object.values(data).map((d) => d.medianDistanceKmTravail),
                        backgroundColor: 'rgb(233, 176, 33)',
                    }
                ]
            })
        }
    }, [data]) 

    return (
        <div style={{height: "500px"}}>
            {chartData && <Bar
                width={500}
                style={{margin: "auto"}}
                options={chartOptions}
                data={chartData}
            />}
        </div>
    )
}

const TripDistanceBarChart = ({ data } : { data: types.TripDistanceStatType}) => {
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
        if (!data) return
        let labels = Object.keys(data)
        if (labels.length === 0) return
        for (let i = 0; i < labels.length -1; i++) {
            labels[i] = labels[i] + " - " + labels[i + 1] + " km"
        }
        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Nombre de trajets',
                    data: Object.values(data),
                    backgroundColor: 'rgb(255, 99, 132)',
                }
            ]
        })
    }, [data]) 

    return (
        <div style={{height: "500px"}}>
            {chartData && <Bar
                width={500}
                style={{margin: "auto"}}
                options={chartOptions}
                data={chartData}
            />}
        </div>
    )
}

export default {
    TripModelBarChart,
    TripDistanceBarChart
}