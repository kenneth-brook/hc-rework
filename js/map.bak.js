const timer = setInterval(kickit, 30000);

const dep = document.querySelector("#dtype");
const age = document.querySelector("#data-agency");
const are = document.querySelector("#data-area");

let la = 35.031381;
let lo = -85.336799;
let zo = 12;


document.onselectionchange = () => {
    kickit();
};

function kickit() {

const url = 'http://ec2-18-234-142-168.compute-1.amazonaws.com:3000/api/calls';
let datapool = {};

fetch(url)
.then(response => response.json()) //converts request from fetch to json
.then(data => {
  
 datapool = data;
 sort()
 initializingMap()
 clearPool()
 init()
});

function clearPool() {
    let chart = document.getElementById('chart');
    if(chart != null) {
        chart.replaceChildren();
    }
}

function initializingMap() // call this method before you initialize your map.
{
var container = L.DomUtil.get('map');
if(container != null){
container._leaflet_id = null;
}
}

let datapoolSort = {};

function sort() {
    let sort1 = datapool;
    let sort2 = {};
    let sort3 = {};
    let sort4 = {};

    let rSort = document.getElementsByName('rStatus');
    sortOne = ""
    for(i = 0; i < rSort.length; i++) {
        if(rSort[i].checked)
        sortOne = rSort[i].value;
    }

    if(sortOne == "all") {
        sort1 = datapool
    } else {
        sort1 = sort1.filter(x => x.status === sortOne)
    }

    
    sort2 = sort1;
    let sortTwo = dep.value;

    if(sortTwo == "all") {
        sort2 = sort1
    } else {
       sort2 = sort2.filter(x => x.agency_type === sortTwo)
    }


    sort3 = sort2;
    let sortThree = age.value;

    if(sortThree == "all") {
        sort3 = sort2
    } else {
       sort3 = sort3.filter(x => x.jurisdiction === sortThree)
    }

    sort4 = sort3;
    let sortFour = are.value;

    if(sortFour == "all") {
        sort4 = sort3
    } else {
       sort4 = sort4.filter(x => x.city === sortFour)
    }

    datapoolSort = sort4;
    console.log(datapoolSort);
}


// var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
var map = L.map('map', { zoomControl: false }).setView([`${la}`, `${lo}`], `${zo}`);
L.tileLayer(imagery, {
    minZoom: 8,
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
}).addTo(map);

var fsControl = L.control.fullscreen({ position: 'topright' });
map.addControl(fsControl);

map.on('popupopen', function(e) {
    if(typeof e.popup._source._tooltip != "undefined") {
        e.popup._source._tooltip.setOpacity(0);
    }
});
map.on('popupclose', function(e) {
    if(typeof e.popup._source._tooltip != "undefined") {
        e.popup._source._tooltip.setOpacity(1);
    }
});

var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    animate: false
});

function init() {
let dataset = [];
dataset = Object.entries(datapoolSort);
let count = datapool.length;

document.getElementById('current').innerHTML = count;

for (var i = 0; i < dataset.length; i++) {
    let a = dataset[i];
    let lat = parseFloat(a[1].latitude)
    let long = parseFloat(a[1].longitude)
    let cords = [lat, long]
    let utcDate = a[1].creation
    let newDate = new Date(utcDate).toLocaleString();

    /* Jurisdiction pin logic chain */
    let department = "";

    if (a[1].agency_type == "Law") {
        department = "police";
    } else if (a[1].agency_type == "EMS") {
        department = "ems";
    } else if (a[1].type_description == "ROAD CLOSURE") {
        department = "roadclosure"
    } else if (a[1].agency_type == "Fire") {
        department = "fire"
    } else {
        department = "police";
    }

    /* Jurisdiction pin logic chain */
    let status = "";

    if (a[1].status == "Enroute") {
        status = "e";
    } else if (a[1].status == "At Hospital") {
        status = "h";
    } else if (a[1].status == "Transporting") {
        status = "t"
    } else if (a[1].type_description == "ROAD CLOSURE") {
        status = "r"
    } else {
        status = "os";
    }


    let info = '<strong>' + a[1].master_incident_id + '</strong> <br>' + newDate + ' <br>' + a[1].jurisdiction + ' <br>' + a[1].type_description + ' <br>' + a[1].location;
    L.marker((cords), {
        icon: L.icon({
            iconUrl: 'images/pins/' + department + '.png',
            iconRetinaUrl: 'images/pins/' + department + '@2x.png',
            iconSize: [30, 38],
            iconAnchor: [15, 30],
            popupAnchor: [-1, -30],
            shadowUrl: 'images/pins/_shadow.png',
            shadowSize: [59, 67],
            shadowAnchor: [25, 39],
            // className: 'marker-icon',
        }),
    })
    .bindPopup(info, {
        className: 'marker-info status-' + status
    })
    .bindTooltip('<strong>' + status + '</strong>', {
        direction: 'top',
        pane: 'shadowPane',
        permanent: true,
        opacity: 1,
        offset: [0, -23],
        className: 'marker-code status-' + status
    
    })
        .addTo(markers);





/* Chart Logic */


let row = document.getElementById("chart");

let tr = document.createElement("tr");
row.appendChild(tr);

let type = document.createElement("td");
tr.appendChild(type);

let typeS = document.createElement("strong");
typeS.innerHTML = a[1].agency_type;
type.appendChild(typeS);

let stat = document.createElement("td");
tr.appendChild(stat);

let statS = document.createElement("strong");
statS.innerHTML = a[1].status;
stat.appendChild(statS);

let mi = document.createElement("td");
tr.appendChild(mi);

let miS = document.createElement("strong");
miS.innerHTML = "Incident # " + a[1].sequencenumber;
mi.appendChild(miS);

let dateC = document.createElement("td");
dateC.innerHTML = newDate;
tr.appendChild(dateC);

let jur = document.createElement("td");
jur.innerHTML = a[1].jurisdiction;
tr.appendChild(jur);

let des = document.createElement("td");
des.innerHTML = a[1].type_description;
tr.appendChild(des);

let loc = document.createElement("td");
loc.innerHTML = a[1].location;
tr.appendChild(loc);

let area = document.createElement("td");
area.innerHTML = a[1].city;
tr.appendChild(area);


tr.classList.add("status-code-" + status)
type.classList.add("col-type")
typeS.classList.add(department)
stat.classList.add("col-status")
mi.classList.add("col-incident")

}


map.addLayer(markers);

L.Control.Logo = L.Control.extend({
    onAdd: function (map) {
        var img = L.DomUtil.create('img');
        img.src = 'images/logo-mobile@2x.png';
        img.style.width = '70px';
        return img;
    },
});
L.control.logo = function (opts) {
    return new L.Control.Logo(opts);
};
var logoControl = L.control.logo({position: 'bottomleft'});

map.on('enterFullscreen', function(){
    logoControl.addTo(map);
});

map.on('exitFullscreen', function(){
    logoControl.remove();
});

}

/*var map = L.map('map'),
    realtime = L.realtime({
        url: 'http://localhost:8090/api/calls',
        crossOrigin: true,
        type: 'json'
    }, {
        interval: 15000
    }).addTo(map);

realtime.on('update', function() {
    map.fitBounds(realtime.getBounds(), {maxZoom: 3});
});*/


}
