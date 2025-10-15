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
        ctx.font = "bold 8px sans-serif"
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
  "1.1.1 Qualité de la formation à la prise en main",
  "1.1.2 Qualité de la notice d’emploi",
  "1.1.3 Facilité d’utilisation du véhicule ",
  "1.1.4 Taux d'implication des testeurs dans la méthode de suivi de l'expérimentation",
  "1.2.1 Représentativité du territoire",
  "1.2.2 Profil des usagers en accord aux cibles de l'expérimentation (identifiées au départ)",
  "1.2.3 Utilisation effective du véli pendant le prêt à l'usager",
  "1.2.4 Infractions, accidents",
  "1.2.5 Nombre d’expérimentateurs en accord au nombre visé au départ",
  "1.2.6 Km parcourus / commune / expérimentateurs",
  "1.3.1 Utilité perçue",
  "1.3.2 Volonté du béneficiaire de pérenniser l'usage ",
  "2.1.1 Sentiment de sécurité au bord du véli",
  "2.1.2 Autonomie et consommation électrique",
  "2.1.3 Adaptabilité au dénivelé",
  "2.1.4 Stabilité * (faire évouler)",
  "2.1.5 Adaptabilité aux intempéries*",
  "2.1.6 Flexibilité organisationnelle des véhicules",
  "2.1.7 Maintenance corrective",
  "2.2.1 Sentiment de securité au bord du véli en fonction des infrastructures routières",
  "2.2.2 Qualité de l’espace public adapté à la ciculation de vélis",
  "2.2.3 Adaptabilité des stationnements aux VELI",
  "3.1.1 Effort de lancement ",
  "3.2.1 Maintenance préventive ",
  "3.3.1 Moyens humains dediés à la mise en place et suivi du projet ",
  "3.3.2 Implication effective des parties prenantes associées dans le suivi du projet",
  "4.1.1 Plan communication tout au long du dispositif d'expérimentation",
  "4.1.2 Visibilité des enjeux autour des vélis ",
  "4.2.1 Changement de comportement vis à vis de la voiture",
  "4.2.2 Sensibilisation au partage de la voirie ",
  "4.2.3 Meilleure connaissance des VELI",
  "4.2.4 Sentiment du bien-être dans l'utilisation du véli",
  "4.3.1 Seuil d’acceptabilité d’achat  ou location/ service rendu",
  "4.3.2 Gain sur coût carburant",
  "4.4.1 Bilan CO2 des trajets / CO2 évité",
  "4.4.2 Sensibilisation aux enjeux environnementaux",
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
  "Fort": "#0dadae",
  "Moyen": "#7fdbdb",
  "Faible": "#cbf2f2",
  "fort/moyen/faible": "white",
  "N/A": "white",
}

const getMostFrequentLabel = (i, j, dlabels) => {
  const array = dlabels.slice(i, j)
  if (array.length === 0) return "N/A"
  const mostFrequent = Array.from(new Set(array)).reduce((prev, curr) =>
    array.filter(el => el === curr).length > array.filter(el => el === prev).length ? curr : prev
  ) as string
  return mostFrequent
}


const Disque = ({evaluations}: {evaluations: string[]}) => {
  const dataLabels = evaluations
  const criteresDataLabels = [
    getMostFrequentLabel(0, 4, dataLabels),
    getMostFrequentLabel(4, 10, dataLabels),
    getMostFrequentLabel(10, 12, dataLabels),
    getMostFrequentLabel(12, 19, dataLabels),
    getMostFrequentLabel(19, 22, dataLabels),
    getMostFrequentLabel(22, 23, dataLabels),
    getMostFrequentLabel(23, 24, dataLabels),
    getMostFrequentLabel(24, 26, dataLabels),
    getMostFrequentLabel(26, 28, dataLabels),
    getMostFrequentLabel(28, 32, dataLabels),
    getMostFrequentLabel(32, 34, dataLabels),
    getMostFrequentLabel(34, 36, dataLabels),
  ]
  const axesDataLabels = [
    getMostFrequentLabel(0, 12, dataLabels),
    getMostFrequentLabel(12, 22, dataLabels),
    getMostFrequentLabel(22, 26, dataLabels),
    getMostFrequentLabel(26, 36, dataLabels),
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
        backgroundColor: dataLabels.map(d => colors[d]),
        borderColor: "#0dacad"
      },
      {
        // Middle ring
        label: "Critères",
        data: [8.333333333, 8.333333333, 8.333333333, 12.5, 12.5, 8.333333333, 8.333333333, 8.333333333, 6.25, 6.25, 6.25, 6.25],
        catlabels: ["1.1 Compréhension","1.2 Expérience","1.3 Valeur","2.1 Véhicule","2.2 Voirie","3.1 Lancement","3.2 Maintenance","3.3 Mise en place et suivi","4.1 Communication","4.2 Social","4.3 Économique","4. 4 Environnemental"],
        datalabels: criteresDataLabels,
        backgroundColor: criteresDataLabels.map(d => colors[d]),
        borderColor: "#0dacad"
      },
      {
        // Inner ring
        label: "Axes",
        data: [25, 25, 25, 25],
        catlabels: ["Usages", "Robustesse", "Moyens", "Impact"],
        datalabels: axesDataLabels,
        backgroundColor: axesDataLabels.map(d => colors[d]),
        borderColor: "#0dacad"
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