//document.body.onload = addChart;
const {dataset} = require("./map.js")

function addChart () {
    let row = document.getElementById("chart");

    dataset.forEach((item) => {
        let tr = document.createElement("tr");
        row.appendChild(tr);
        let type = document.createElement("td");
        type.innerText = item.agency_type;
        tr.appendChild(type);
    })
}