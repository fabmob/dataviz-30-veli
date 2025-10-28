import React from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

function getLines(ctx, text, maxWidth) {
    const words = text.split(" ")
    const lines:string[] = []
    let currentLine:string = words[0]

    for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
            currentLine += " " + word
        } else {
            lines.push(currentLine)
            currentLine = word
        }
    }
    lines.push(currentLine)
    return lines
}

// Custom plugin to draw labels
const SliceLabelPlugin = {
  id: "sliceLabelPlugin",
  afterDatasetsDraw: (chart) => {
    const { ctx, chartArea: { width, height } } = chart
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      meta.data.forEach((arc, index) => {
        const value = dataset.data[index]
        const label = dataset.catlabels[index]

        const centerAngle = (arc.startAngle + arc.endAngle) / 2
        const radius = (arc.outerRadius + arc.innerRadius) / 2

        const x = chart.width / 2 + radius * Math.cos(centerAngle)
        let y = chart.height / 2 + radius * Math.sin(centerAngle)

        ctx.save()
        ctx.fillStyle = "#333"
        let fontSize
        switch (datasetIndex) {
            case 0:
                fontSize = 8
                break
            case 1:
                fontSize = 12
                break
            case 2:
                fontSize = 16
                break
        }
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const lines = getLines(ctx, label, 40)
        y = y - (lines.length-1)/2 * 10
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + i * 10)
        }
        
        ctx.restore()
      })
    })
  },
}

const outerCatLabels = [
  "Qualité de la formation à la prise en main", // 1.1.1 
  "Qualité de la notice d’emploi", // 1.1.2 
  "Facilité d’utilisation du véhicule ", // 1.1.3 
  "Taux d'implication des testeurs dans la méthode de suivi de l'expérimentation", // 1.1.4 
  "Représentativité du territoire", // 1.2.1 
  "Profil des usagers en accord aux cibles de l'expérimentation (identifiées au départ)", // 1.2.2 
  "Utilisation effective du véli pendant le prêt à l'usager", // 1.2.3 
  "Infractions, accidents", // 1.2.4 
  "Nombre d’expérimentateurs en accord au nombre visé au départ", // 1.2.5 
  "Km parcourus / commune / expérimentateurs", // 1.2.6 
  "Utilité perçue", // 1.3.1 
  "Volonté du béneficiaire de pérenniser l'usage ", // 1.3.2 
  "Sentiment de sécurité au bord du véli", // 2.1.1 
  "Autonomie et consommation électrique", // 2.1.2 
  "Adaptabilité au dénivelé", // 2.1.3 
  "Stabilité * (faire évouler)", // 2.1.4 
  "Adaptabilité aux intempéries*", // 2.1.5 
  "Flexibilité organisationnelle des véhicules", // 2.1.6 
  "Maintenance corrective", // 2.1.7 
  "Sentiment de securité au bord du véli en fonction des infrastructures routières", // 2.2.1 
  "Qualité de l’espace public adapté à la ciculation de vélis", // 2.2.2 
  "Adaptabilité des stationnements aux VELI", // 2.2.3 
  "Effort de lancement ", // 3.1.1 
  "Maintenance préventive ", // 3.2.1 
  "Moyens humains dediés à la mise en place et suivi du projet ", // 3.3.1 
  "Implication effective des parties prenantes associées dans le suivi du projet", // 3.3.2 
  "Plan communication tout au long du dispositif d'expérimentation", // 4.1.1 
  "Visibilité des enjeux autour des vélis ", // 4.1.2 
  "Changement de comportement vis à vis de la voiture", // 4.2.1 
  "Sensibilisation au partage de la voirie ", // 4.2.2 
  "Meilleure connaissance des VELI", // 4.2.3 
  "Sentiment du bien-être dans l'utilisation du véli", // 4.2.4 
  "Seuil d’acceptabilité d’achat  ou location/ service rendu", // 4.3.1 
  "Gain sur coût carburant", // 4.3.2 
  "Bilan CO2 des trajets / CO2 évité", // 4.4.1 
  "Sensibilisation aux enjeux environnementaux", // 4.4.2 
]
const outerValues = [
  2.083333333,
  2.083333333,
  2.083333333,
  2.083333333,
  1.388888889,
  1.388888889,
  1.388888889,
  1.388888889,
  1.388888889,
  1.388888889,
  4.166666667,
  4.166666667,
  1.785714286,
  1.785714286,
  1.785714286,
  1.785714286,
  1.785714286,
  1.785714286,
  1.785714286,
  4.166666667,
  4.166666667,
  4.166666667,
  8.333333333,
  8.333333333,
  4.166666667,
  4.166666667,
  3.125,
  3.125,
  1.5625,
  1.5625,
  1.5625,
  1.5625,
  3.125,
  3.125,
  3.125,
  3.125
]

const colors = {
  "fort": "#0dadae",
  "moyen": "#7fdbdb",
  "faible": "#cbf2f2"
}
const getColor = (label) => {
  return colors[label] || "white"
}

// const getMostFrequentLabel = (i, j, dlabels) => {
//   const array = dlabels.slice(i, j)
//   if (array.length === 0) return "N/A"
//   const mostFrequent = Array.from(new Set(array)).reduce((prev, curr) =>
//     array.filter(el => el === curr).length > array.filter(el => el === prev).length ? curr : prev
//   ) as string
//   return mostFrequent
// }

const getAverageLabel = (i, j, dlabels) => {
  const array = dlabels.slice(i, j).filter(e => e !== "N/A").map(e => {
    switch (e) {
      case "faible":
        return 0
      case "moyen":
        return 1
      case "fort":
        return 2
    }
  })
  if (array.length === 0) return "N/A"
  const average = array.reduce((prev, curr) => prev + curr, 0) / array.length
  if (average < 0.66) return "faible"
  if (average < 1.33) return "moyen"
  return "fort"
}

const Disque = ({evaluations}: {evaluations: string[]}) => {
  const dataLabels = evaluations.map(e => {
    const label = e.toLowerCase()
    return colors[label] ? label : "N/A"
  })
  const criteresDataLabels = [
    getAverageLabel(0, 4, dataLabels),
    getAverageLabel(4, 10, dataLabels),
    getAverageLabel(10, 12, dataLabels),
    getAverageLabel(12, 19, dataLabels),
    getAverageLabel(19, 22, dataLabels),
    getAverageLabel(22, 23, dataLabels),
    getAverageLabel(23, 24, dataLabels),
    getAverageLabel(24, 26, dataLabels),
    getAverageLabel(26, 28, dataLabels),
    getAverageLabel(28, 32, dataLabels),
    getAverageLabel(32, 34, dataLabels),
    getAverageLabel(34, 36, dataLabels),
  ]
  const axesDataLabels = [
    getAverageLabel(0, 12, dataLabels),
    getAverageLabel(12, 22, dataLabels),
    getAverageLabel(22, 26, dataLabels),
    getAverageLabel(26, 36, dataLabels),
  ]
  const data = {
    labels: [],
    datasets: [
      {
        // Outer ring
        label: "Indicateurs",
        data: outerValues,
        catlabels: outerCatLabels,
        datalabels: dataLabels,
        backgroundColor: dataLabels.map(getColor),
        borderColor: "#086b6bff"
      },
      {
        // Middle ring
        label: "Critères",
        data: [8.333333333, 8.333333333, 8.333333333, 12.5, 12.5, 8.333333333, 8.333333333, 8.333333333, 6.25, 6.25, 6.25, 6.25],
        catlabels: ["Compréhension","Expérience","Valeur","Véhicule","Voirie","Lancement","Maintenance","Mise en place et suivi","Communication","Social","Économique","Environnemental"],
        datalabels: criteresDataLabels,
        backgroundColor: criteresDataLabels.map(getColor),
        borderColor: "#086b6bff"
      },
      {
        // Inner ring
        label: "Axes",
        data: [25, 25, 25, 25],
        catlabels: ["Usages", "Robustesse", "Moyens", "Impact"],
        datalabels: axesDataLabels,
        backgroundColor: axesDataLabels.map(getColor),
        borderColor: "#086b6bff"
      }
    ]
  }

  const options = {
    cutout: "20%", // baseline for inner-most hole
    plugins: {
      tooltip: { 
        callbacks: {
          label: function(context) {
              return context.dataset.catlabels[context.dataIndex] + ": " + context.dataset.datalabels[context.dataIndex]
          }
        }
      }
    }
  }

  return (
    <div style={{ width: "900px", margin: "auto" }}>
      <Doughnut data={data} options={options} plugins={[SliceLabelPlugin]}/>
    </div>
  )
}

export default Disque