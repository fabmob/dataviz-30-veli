import React, { useEffect, useState } from "react"
import {Chart, CategoryScale, LinearScale, TimeScale, Tooltip, Legend, BarElement} from 'chart.js'
import 'chartjs-adapter-luxon'
Chart.register(CategoryScale, LinearScale, TimeScale, Tooltip, Legend, BarElement)
import { Bar } from 'react-chartjs-2'
import * as types from "../types"


interface ChartData {
    labels: string[],
    datasets: {
        label: string,
        data: number[],
        backgroundColor?: string
        hidden?: boolean
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

const HistoryBarChart = ({ data, minDate, maxDate } : { data: types.VehicleHistoryType[], minDate: Date, maxDate: Date}) => {
    const [chartData, setChartData] = useState<null | ChartData>(null)
    const [shownDatasetIndex, setShownDatasetIndex] = useState(0)
    const sanitizeDate = (date: Date) => {
        const dstr = date.toISOString()
        if (dstr < "2023-01-01") {
            return "2023-01-01"
        }
        if (dstr > new Date().toISOString()) {
            return new Date().toISOString()
        }
        return dstr
    }
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as "bottom",
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex
                    const ci = legend.chart

                    // Hide all datasets except the clicked one
                    ci.data.datasets.forEach((dataset, i) => {
                        dataset.hidden = i !== index
                    })
                    ci.options.scales.y.title.text = ci.data.datasets[index].label
                    ci.update()
                    setShownDatasetIndex(index)
                }
            }
        },
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: 'day' as const,
                    displayFormats: {
                        day: 'DD'
                    },
                    tooltipFormat: 'DD'
                },
                title: {
                    display: true,
                    text: 'Date'
                },
                min: sanitizeDate(minDate),
                max: sanitizeDate(maxDate)
            },
            y: {
                title: {
                    display: true,
                    text: ['Nombre de trajets', 'Distance parcourue (km)', 'Vitesse moyenne (km/h)', 'Score bilan (1-4)'][shownDatasetIndex]
                }
            }
        }
    }
    const bilanRank = {
        'N/A': 0,
        'Très négatif': 1,
        'Négatif': 2,
        'Positif': 3,
        'Très positif': 4,
    }
    useEffect(() => {
        if (!data) return
        let labels = data.map(d => d.day)
        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Nombre de trajets',
                    data: data.map(d => d.nb_trips),
                    backgroundColor: 'rgb(255, 99, 132)',
                    hidden: shownDatasetIndex !== 0,
                },
                {
                    label: 'Distance parcourue (km)',
                    data: data.map(d => d.total_distance_km),
                    backgroundColor: 'rgb(255, 206, 86)',
                    hidden: shownDatasetIndex !== 1,
                },
                {
                    label: 'Vitesse moyenne (km/h)',
                    data: data.map(d => d.average_speed_kmh),
                    backgroundColor: 'rgb(54, 162, 235)',
                    hidden: shownDatasetIndex !== 2,
                },
                {
                    label: 'Score bilan (1-4)',
                    data: data.map(d => bilanRank[d.most_frequent_bilan]),
                    backgroundColor: 'rgb(0, 209, 178)',
                    hidden: shownDatasetIndex !== 3,
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
    TripDistanceBarChart,
    HistoryBarChart
}