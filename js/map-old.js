let countyCords = "";
let weatherData = "";
let countyCode = "TNC065";
let alertStatus = "off";
//let alertStatus = "Warning";
let warning = [];
//let warning = ["This is a test of the ENS alert system"];
let warningData = [];
let watch = "";
let latitude = "";
let longitude = "";
let centcord = "";
let weatherLayerVisible = false;
let cloudLayerVisible = false;

const script = document.createElement('script');
script.src = 'https://hc911.org/test/js/weather.js'; // Path to your external JS file
document.head.appendChild(script);

const timeoutInMiliseconds = 600000;
let timeoutId; 
  
function startTimer() { 
    // window.setTimeout returns an Id that can be used to start and stop a timer
    timeoutId = window.setTimeout(doInactive, timeoutInMiliseconds)
}
  
function doInactive() {
	clearInterval(timer);
    document.getElementById('inactive-popup').style.visibility = "visible";
    // does whatever you need it to actually do - probably signs them out or stops polling the server for info
}
 
function setupTimers () {
    document.addEventListener("mousemove", setupTimers, false);
    document.addEventListener("mousedown", setupTimers, false);
    document.addEventListener("keypress", setupTimers, false);
    document.addEventListener("touchmove", setupTimers, false);
     
    //startTimer();
}

const timer = setInterval(call, 60000);

document.onselectionchange = () => {
    call();
};

const dep = document.querySelector("#dtype");
const age = document.querySelector("#data-agency");
const are = document.querySelector("#data-area");

const url = 'https://hc911server.com/api/calls';
let datapool = {};

function call() {
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Frontend-Auth": "my-secure-token", // Your secret token
            "Origin": "https://www.hamiltontn911.gov"  // Optional, for extra security
        }
    })
    .then(response => response.json())
    .then(data => {
        datapool = data.filter(x => x.type !== "PERBURN");
        initializingMap();
        clearPool();
        sort();
        init();
    })
    .catch(error => console.error("🚨 API Call Failed:", error));
}

function clearMap() {
    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
    call();
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

function clearPool() {
    markers.clearLayers();
    let chart = document.getElementById('chart');
    if(chart != null) {
        chart.replaceChildren();
    }
}

function initializingMap() {
    var container = L.DomUtil.get('map');
    if(container != null){
        container._leaflet_id = null;
    }
}

var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
// var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
//var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
var map = L.map('map').setView([35.088743, -85.239854], 11);
L.tileLayer(imagery, {
    minZoom: 6,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
}).addTo(map);

//********************* comment to get around 3rd party load issue ******************************* */
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
    animate: true
});

function init() {
    // Convert your sanitized, backend-provided data (assumed in datapoolSort) into an array of entries.
    let dataset = Object.entries(datapoolSort);

    // Loop through each record to create map markers and chart entries.
    for (let i = 0; i < dataset.length; i++) {
        let a = dataset[i];  // a[1] is the call record
        let id = a[1].id;
        let lat = parseFloat(a[1].latitude);
        let long = parseFloat(a[1].longitude);
        let cords = [lat, long];

        // Convert the UTC date to local date with an offset.
        let utcDate = a[1].creation;
        let newDateStart = new Date(utcDate);
        let cday = newDateStart.getDate();
        let cmonth = newDateStart.getMonth();
        let cyear = newDateStart.getFullYear();
        let chours = newDateStart.getHours();
        let cmin = String(newDateStart.getMinutes()).padStart(2, '0');
        let rhours = 0;

        // Calculate timezone offset (assuming DST adjustment is needed)
        Date.prototype.stdTimezoneOffset = function () {
            let jan = new Date(this.getFullYear(), 0, 1);
            let jul = new Date(this.getFullYear(), 6, 1);
            return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        };
        Date.prototype.isDstObserved = function () {
            return this.getTimezoneOffset() < this.stdTimezoneOffset();
        };
        
        let offset = (new Date()).isDstObserved() ? 4 : 5;
        if (chours + offset >= 24) {
            rhours = (chours + offset) - 24;
        } else {
            rhours = chours + offset;
        }
        
        let newDate = `${cmonth + 1}/${cday}/${cyear} ${rhours}:${cmin}`;

        // Determine the department based on agency_type (and for "ROAD CLOSURE" check type_description)
        let department = "";
        if (a[1].agency_type === "Law") {
            department = "police";
        } else if (a[1].agency_type === "EMS") {
            department = "ems";
        } else if (a[1].type_description === "ROAD CLOSURE") {
            department = "roadclosure";
        } else if (a[1].agency_type === "Fire") {
            department = "fire";
        } else {
            department = "police";
        }

        // Determine status based on a[1].status and/or type_description
        let status = "";
        if (a[1].status === "Enroute") {
            status = "e";
        } else if (a[1].status === "At Hospital") {
            status = "h";
        } else if (a[1].status === "Transporting") {
            status = "t";
        } else if (a[1].type_description === "ROAD CLOSURE") {
            status = "r";
        } else {
            status = "os";
        }

        // Use the sanitized type from the backend (which already has EMS changes, etc.)
        // If your backend changes both type and type_description to "EMS CALL", you can choose one.
        // Here we assume the backend has set a proper value; if not, you can choose:
        let displayType = a[1].type;  // or: a[1].type_description
        
        // Prepare the popup content.
        let info = `<strong>${a[1].master_incident_id}</strong> <br>${newDate} <br>${a[1].jurisdiction} <br>${displayType} <br>${a[1].location}`;
        
        // Create the marker on the map.
        L.marker(cords, {
            icon: L.icon({
                iconUrl: 'images/pins/' + department + '.png',
                iconRetinaUrl: 'images/pins/' + department + '@2x.png',
                iconSize: [30, 38],
                iconAnchor: [15, 30],
                popupAnchor: [-1, -30],
                shadowUrl: 'images/pins/_shadow.png',
                shadowSize: [59, 67],
                shadowAnchor: [25, 39]
            }),
        })
        .bindPopup(info, {
            className: 'marker-info status-' + department
        })
        .bindTooltip('<strong>' + status + '</strong>', {
            direction: 'top',
            pane: 'shadowPane',
            permanent: true,
            opacity: 1,
            offset: [0, -23],
            className: 'marker-code status-' + department
        })
        .addTo(markers);

        // Create a row in the chart for this call
        let row = document.getElementById("chart");
        let tr = document.createElement("tr");
        row.appendChild(tr);

        let typeCell = document.createElement("td");
        tr.appendChild(typeCell);
        let typeStrong = document.createElement("strong");
        typeStrong.innerHTML = a[1].agency_type;
        typeCell.appendChild(typeStrong);

        let statCell = document.createElement("td");
        tr.appendChild(statCell);
        let statStrong = document.createElement("strong");
        statStrong.innerHTML = a[1].status;
        statCell.appendChild(statStrong);

        let incidentCell = document.createElement("td");
        tr.appendChild(incidentCell);
        let incidentStrong = document.createElement("strong");
        incidentStrong.innerHTML = "Incident # " + a[1].sequencenumber;
        incidentCell.appendChild(incidentStrong);

        let dateCell = document.createElement("td");
        dateCell.innerHTML = newDate;
        tr.appendChild(dateCell);

        let jurCell = document.createElement("td");
        jurCell.innerHTML = a[1].jurisdiction;
        tr.appendChild(jurCell);

        let desCell = document.createElement("td");
        desCell.innerHTML = displayType;
        tr.appendChild(desCell);

        let locCell = document.createElement("td");
        tr.appendChild(locCell);
        let clickBut = document.createElement("button");
        clickBut.type = "button";
        clickBut.addEventListener('click', function(){
            mapOpen();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            map.flyTo([lat, long], 16, { animate: true });
        });
        locCell.appendChild(clickBut);
        let butName = document.createElement("p");
        butName.innerHTML = a[1].location;
        clickBut.appendChild(butName);

        let areaCell = document.createElement("td");
        areaCell.innerHTML = a[1].city;
        tr.appendChild(areaCell);

        tr.classList.add("rowSplit");
        tr.classList.add("status-code-" + department);
        typeCell.classList.add("col-type");
        typeStrong.classList.add(department);
        statCell.classList.add("col-status");
        incidentCell.classList.add("col-incident");
        areaCell.classList.add("col-area");
        dateCell.classList.add("col-date");
        locCell.classList.add("col-loc");
        desCell.classList.add("col-des");
        jurCell.classList.add("col-jur");

        locCell.classList.add("locCell");
        clickBut.classList.add("clickBut");
    }

    // Add markers to the map
    map.addLayer(markers);

    // Add logo control to map for fullscreen mode
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

function mapToggle() {
    const element = document.getElementById("mapHouse");
    element.classList.toggle("mapGrow");
    const element2 = document.getElementById("map");
    element2.classList.toggle("mapShow");
    clearMap();
    textSwap();
}

function mapOpen() {
    const element = document.getElementById("mapHouse");
    element.classList.add("mapGrow");
    const element2 = document.getElementById("map");
    element2.classList.add("mapShow");
    clearMap();
    textOpen();
}

warningData.forEach((warning, index) => {
    if (warning.geometry != null) {
        // Create a fill layer for polygon
        const polygon = L.polygon(warning.geometry.coordinates, {
            color: '#FF0000',
            weight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.5
        }).addTo(map);

        // Calculate centroid for warning labels
        // Note: Leaflet does not have a built-in centroid function, consider using an external library or a custom function

        // Create a marker for the label
        // Assuming you have a function `calculateCentroid` that returns [lat, lng]
        const centroid = calculateCentroid(warning.geometry.coordinates);
        L.marker(centroid).bindPopup(warning.properties.event).addTo(map);
    }
});

//if (alertStatus != "off") {
    // For adding a raster layer like weather data, Leaflet uses L.tileLayer
   // L.tileLayer('https://tile.openweathermap.org/map/radar/{z}/{x}/{y}.png?appid=bfa689a00c0a5864039c9e7396f1e745', {
       // maxZoom: 19,
       // attribution: 'Weather data © OpenWeatherMap'
    //}).addTo(map);
//}

const now = new Date();

// Convert the current time to Unix time (milliseconds since Jan 1, 1970)
const unixTimeNow = now.getTime();

// Number of milliseconds in 10 minutes
const tenMinutes = 10 * 60 * 1000;

// Calculate the remainder when dividing by the number of milliseconds in 10 minutes
const remainder = unixTimeNow % tenMinutes;

// Subtract the remainder to get the nearest previous 10-minute mark in Unix time
const uDate = unixTimeNow - remainder;

let weatherLayer = null;
let cloudLayer = null;

map.createPane('weatherPane');
map.getPane('weatherPane').style.zIndex = 650;

let weatherOverlay = null;

const WEATHER_FORGE_BASE = "https://365dtm.com/weather";

function getWeatherForgeUrl() {
    const bounds = map.getBounds();
    const size = map.getSize();

    const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
    ].join(',');

    const params = new URLSearchParams({
        layer: 'radar',
        bbox,
        width: Math.round(size.x),
        height: Math.round(size.y)
    });

    return `${WEATHER_FORGE_BASE}/index.php?${params.toString()}`;
}

function updateWeatherOverlay() {
    const bounds = map.getBounds();
    const url = getWeatherForgeUrl();

    if (!weatherOverlay) {
        weatherOverlay = L.imageOverlay(url, bounds, {
            opacity: 0.7,
            pane: 'weatherPane'
        }).addTo(map);
        return;
    }

    weatherOverlay.setBounds(bounds);
    weatherOverlay.setUrl(url);
}

function updateCloudLayer() {
    console.log('updateCloudLayer fired, visible:', cloudLayerVisible);

    if (cloudLayer) {
        map.removeLayer(cloudLayer);
        cloudLayer = null;
    }

    if (cloudLayerVisible) {
        enterWeatherMode();
        console.log('adding cloud layer');
        cloudLayer = buildWeatherLayer('clouds');
        cloudLayer.addTo(map);
    } else if (!weatherLayerVisible) {
        exitWeatherMode();
    }
}

const weatherCenter = [35.153, -85.214];
const weatherZoom = 10;
const weatherBounds = L.latLngBounds(
    [34.82, -86.10],
    [35.72, -84.10]
);

function enterWeatherMode() {
    map.setView(weatherCenter, weatherZoom);
    map.setMinZoom(weatherZoom);
    map.setMaxZoom(weatherZoom);
    map.setMaxBounds(weatherBounds);
}

function exitWeatherMode() {
    map.setMinZoom(8); // or your normal min
    map.setMaxZoom(18); // or your normal max
    map.setMaxBounds(null);
}

function fetchAndUpdateWeatherData() {
    if (weatherLayerVisible) {
        updateWeatherLayer();
    }
}

function fetchAndUpdateCloudData() {
    if (cloudLayerVisible) {
        updateCloudLayer();
    }
}

let evacLayer;

function toggleEvacLayer() {
    const evacBlock = document.getElementById('toggleEvacLayer')
    if (evacLayer) {
        // If evacLayer exists, remove it
        evacLayer.remove();
        evacLayer = null;
        evacBlock.classList.remove('showLayer');
    } else {
        // Fetch the GeoJSON and add it as a layer
        fetch('./json/routs2.geojson')
            .then(response => response.json())
            .then(data => {
                evacLayer = L.geoJSON(data, {
                    style: { color: "#FFA500" } // Using object shorthand for style
                }).addTo(map);
            })
            .catch(error => console.error('Error loading the GeoJSON:', error));
            evacBlock.classList.add('showLayer');
    }
}

function startMap() {
    call();
    setupTimers();
}