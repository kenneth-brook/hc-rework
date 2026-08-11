let countyCords = [];
let weatherData = null;
let countyCode = "TNC065";
let alertStatus = "off";
let warning = [];
let warningData = [];
let watch = [];
let latitude = null;
let longitude = null;
let centcord = null;
let weatherLayerVisible = false;

const WEATHER_SCRIPT_URL = "https://hc911.org/js/weather.js";
const WEATHER_FORGE_BASE = "https://911emergensee.com/weather";
const CALLS_API_URL = "https://hc911server.com/api/calls";
const timeoutInMilliseconds = 600000;

let timeoutId = null;
let datapool = [];
let datapoolSort = [];
let weatherOverlay = null;
let weatherRefreshTimer = null;
let weatherLoading = false;
let weatherLoadTimeout = null;
let weatherRequestId = 0;
let pendingWeatherOverlay = null;
let evacLayer = null;

const dep = document.querySelector("#dtype");
const age = document.querySelector("#data-agency");
const are = document.querySelector("#data-area");

const script = document.createElement("script");
script.src = WEATHER_SCRIPT_URL;
document.head.appendChild(script);

function startTimer() {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(doInactive, timeoutInMilliseconds);
}

function doInactive() {
    clearInterval(timer);
    const inactivePopup = document.getElementById("inactive-popup");
    if (inactivePopup) {
        inactivePopup.style.visibility = "visible";
    }
}

function setupTimers() {
    ["mousemove", "mousedown", "keypress", "touchmove"].forEach((eventName) => {
        document.addEventListener(eventName, startTimer, false);
    });
    startTimer();
}

const timer = setInterval(fetchCallsData, 60000);

document.onselectionchange = () => {
    fetchCallsData();
};

function clearMap() {
    L.Util.requestAnimFrame(map.invalidateSize, map, false, map._container);
    fetchCallsData();

    if (weatherLayerVisible) {
        scheduleWeatherRefresh();
    }
}

async function fetchCallsData() {
    try {
        const response = await fetch(CALLS_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Frontend-Auth": "my-secure-token",
                "Origin": "https://www.hamiltontn911.gov"
            }
        });

        if (!response.ok) {
            throw new Error(`Calls API failed with status ${response.status}`);
        }

        const data = await response.json();
        datapool = data.filter((item) => item.type !== "PERBURN");

        clearPool();
        sortCalls();
        renderCalls();
    } catch (error) {
        console.error("🚨 API Call Failed:", error);
    }
}

function sortCalls() {
    let results = datapool.slice();

    const rSort = document.getElementsByName("rStatus");
    let sortOne = "all";

    for (let i = 0; i < rSort.length; i++) {
        if (rSort[i].checked) {
            sortOne = rSort[i].value;
            break;
        }
    }

    if (sortOne !== "all") {
        results = results.filter((item) => item.status === sortOne);
    }

    const sortTwo = dep?.value ?? "all";
    if (sortTwo !== "all") {
        results = results.filter((item) => item.agency_type === sortTwo);
    }

    const sortThree = age?.value ?? "all";
    if (sortThree !== "all") {
        results = results.filter((item) => item.jurisdiction === sortThree);
    }

    const sortFour = are?.value ?? "all";
    if (sortFour !== "all") {
        results = results.filter((item) => item.city === sortFour);
    }

    datapoolSort = results;
}

function clearPool() {
    markers.clearLayers();

    const chart = document.getElementById("chart");
    if (chart) {
        chart.replaceChildren();
    }
}

function getLocalCallTime(utcDate) {
    const newDateStart = new Date(utcDate);
    const cday = newDateStart.getDate();
    const cmonth = newDateStart.getMonth();
    const cyear = newDateStart.getFullYear();
    const chours = newDateStart.getHours();
    const cmin = String(newDateStart.getMinutes()).padStart(2, "0");

    const jan = new Date(newDateStart.getFullYear(), 0, 1);
    const jul = new Date(newDateStart.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDstObserved = newDateStart.getTimezoneOffset() < stdOffset;
    const offset = isDstObserved ? 4 : 5;

    const rhours = chours + offset >= 24 ? (chours + offset) - 24 : chours + offset;

    return `${cmonth + 1}/${cday}/${cyear} ${rhours}:${cmin}`;
}

function getDepartment(item) {
    if (item.agency_type === "Law") return "police";
    if (item.agency_type === "EMS") return "ems";
    if (item.type_description === "ROAD CLOSURE") return "roadclosure";
    if (item.agency_type === "Fire") return "fire";
    return "police";
}

function getStatusCode(item) {
    if (item.status === "Enroute") return "e";
    if (item.status === "At Hospital") return "h";
    if (item.status === "Transporting") return "t";
    if (item.type_description === "ROAD CLOSURE") return "r";
    return "os";
}

function renderCalls() {
    const chart = document.getElementById("chart");

    datapoolSort.forEach((item) => {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return;
        }

        const cords = [lat, lng];
        const newDate = getLocalCallTime(item.creation);
        const department = getDepartment(item);
        const status = getStatusCode(item);
        const displayType = item.type;

        const info = `<strong>${item.master_incident_id}</strong> <br>${newDate} <br>${item.jurisdiction} <br>${displayType} <br>${item.location}`;

        const marker = L.marker(cords, {
            icon: L.icon({
                iconUrl: `images/pins/${department}.png`,
                iconRetinaUrl: `images/pins/${department}@2x.png`,
                iconSize: [30, 38],
                iconAnchor: [15, 30],
                popupAnchor: [-1, -30],
                shadowUrl: "images/pins/_shadow.png",
                shadowSize: [59, 67],
                shadowAnchor: [25, 39]
            })
        })
            .bindPopup(info, {
                className: `marker-info status-${department}`
            })
            .bindTooltip(`<strong>${status}</strong>`, {
                direction: "top",
                pane: "shadowPane",
                permanent: true,
                opacity: 1,
                offset: [0, -23],
                className: `marker-code status-${department}`
            });

        markers.addLayer(marker);

        if (!chart) {
            return;
        }

        const tr = document.createElement("tr");

        const typeCell = document.createElement("td");
        const typeStrong = document.createElement("strong");
        typeStrong.innerHTML = item.agency_type;
        typeStrong.classList.add(department);
        typeCell.appendChild(typeStrong);

        const statCell = document.createElement("td");
        const statStrong = document.createElement("strong");
        statStrong.innerHTML = item.status;
        statCell.appendChild(statStrong);

        const incidentCell = document.createElement("td");
        const incidentStrong = document.createElement("strong");
        incidentStrong.innerHTML = `Incident # ${item.sequencenumber}`;
        incidentCell.appendChild(incidentStrong);

        const dateCell = document.createElement("td");
        dateCell.innerHTML = newDate;

        const jurCell = document.createElement("td");
        jurCell.innerHTML = item.jurisdiction;

        const desCell = document.createElement("td");
        desCell.innerHTML = displayType;

        const locCell = document.createElement("td");
        const clickBut = document.createElement("button");
        clickBut.type = "button";
        clickBut.classList.add("clickBut");
        clickBut.addEventListener("click", () => {
            mapOpen();
            window.scrollTo({ top: 0, behavior: "smooth" });
            map.flyTo([lat, lng], 16, { animate: true });
        });

        const butName = document.createElement("p");
        butName.innerHTML = item.location;
        clickBut.appendChild(butName);
        locCell.appendChild(clickBut);

        const areaCell = document.createElement("td");
        areaCell.innerHTML = item.city;

        tr.appendChild(typeCell);
        tr.appendChild(statCell);
        tr.appendChild(incidentCell);
        tr.appendChild(dateCell);
        tr.appendChild(jurCell);
        tr.appendChild(desCell);
        tr.appendChild(locCell);
        tr.appendChild(areaCell);

        tr.classList.add("rowSplit", `status-code-${department}`);
        typeCell.classList.add("col-type");
        statCell.classList.add("col-status");
        incidentCell.classList.add("col-incident");
        areaCell.classList.add("col-area");
        dateCell.classList.add("col-date");
        locCell.classList.add("col-loc", "locCell");
        desCell.classList.add("col-des");
        jurCell.classList.add("col-jur");

        chart.appendChild(tr);
    });

    if (!map.hasLayer(markers)) {
        map.addLayer(markers);
    }
}

const imagery = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

const map = L.map("map").setView([35.088743, -85.239854], 11);

L.tileLayer(imagery, {
    minZoom: 6,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
}).addTo(map);

const fsControl = L.control.fullscreen({ position: "topright" });
map.addControl(fsControl);

map.on("popupopen", (e) => {
    if (typeof e.popup._source._tooltip !== "undefined") {
        e.popup._source._tooltip.setOpacity(0);
    }
});

map.on("popupclose", (e) => {
    if (typeof e.popup._source._tooltip !== "undefined") {
        e.popup._source._tooltip.setOpacity(1);
    }
});

const markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    animate: true
});

L.Control.Logo = L.Control.extend({
    onAdd() {
        const img = L.DomUtil.create("img");
        img.src = "images/logo-mobile@2x.png";
        img.style.width = "70px";
        return img;
    }
});

L.control.logo = function (opts) {
    return new L.Control.Logo(opts);
};

const logoControl = L.control.logo({ position: "bottomleft" });

map.on("enterFullscreen", () => {
    logoControl.addTo(map);
});

map.on("exitFullscreen", () => {
    logoControl.remove();
});

map.createPane("weatherPane");
map.getPane("weatherPane").style.zIndex = 450;
map.getPane("weatherPane").style.pointerEvents = "none";

const RAINVIEWER_API_URL =
    "https://api.rainviewer.com/public/weather-maps.json";

async function createRainViewerLayer() {
    const response = await fetch(RAINVIEWER_API_URL, {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`RainViewer API returned ${response.status}`);
    }

    const data = await response.json();
    const frames = data?.radar?.past ?? [];
    const latestFrame = frames[frames.length - 1];

    if (!data?.host || !latestFrame?.path) {
        throw new Error("RainViewer returned no current radar frame");
    }

    const tileUrl =
        `${data.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    return L.tileLayer(tileUrl, {
        tileSize: 256,
        opacity: 0.7,
        pane: "weatherPane",
        maxNativeZoom: 7,
        maxZoom: 19,
        attribution:
            'Weather radar: <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>'
    });
}

async function updateWeatherOverlay() {
    if (!weatherLayerVisible || weatherLoading) {
        return;
    }

    weatherLoading = true;

    try {
        const nextOverlay = await createRainViewerLayer();

        if (!weatherLayerVisible) {
            return;
        }

        if (weatherOverlay && map.hasLayer(weatherOverlay)) {
            map.removeLayer(weatherOverlay);
        }

        weatherOverlay = nextOverlay;
        weatherOverlay.addTo(map);

        console.log("RainViewer radar overlay loaded");
    } catch (error) {
        console.error("Radar overlay failed:", error);
    } finally {
        weatherLoading = false;
    }
}

function removeWeatherOverlay() {
    if (weatherOverlay && map.hasLayer(weatherOverlay)) {
        map.removeLayer(weatherOverlay);
    }

    weatherOverlay = null;
}

function updateWeatherLayer() {
    if (weatherLayerVisible) {
        void updateWeatherOverlay();
    } else {
        removeWeatherOverlay();
    }
}

function scheduleWeatherRefresh() {
    clearTimeout(weatherRefreshTimer);

    weatherRefreshTimer = setTimeout(() => {
        if (weatherLayerVisible) {
            void updateWeatherOverlay();
        }
    }, 500);
}

function toggleEvacLayer() {
    const evacBlock = document.getElementById("toggleEvacLayer");

    if (evacLayer) {
        map.removeLayer(evacLayer);
        evacLayer = null;
        evacBlock?.classList.remove("showLayer");
        return;
    }

    fetch("./json/routs2.geojson")
        .then((response) => response.json())
        .then((data) => {
            evacLayer = L.geoJSON(data, {
                style: { color: "#FFA500" }
            }).addTo(map);
            evacBlock?.classList.add("showLayer");
        })
        .catch((error) => console.error("Error loading the GeoJSON:", error));
}

function mapToggle() {
    const mapHouse = document.getElementById("mapHouse");
    const mapElement = document.getElementById("map");

    mapHouse?.classList.toggle("mapGrow");
    mapElement?.classList.toggle("mapShow");

    clearMap();

    if (typeof textSwap === "function") {
        textSwap();
    }
}

function mapOpen() {
    const mapHouse = document.getElementById("mapHouse");
    const mapElement = document.getElementById("map");

    mapHouse?.classList.add("mapGrow");
    mapElement?.classList.add("mapShow");

    clearMap();

    if (typeof textOpen === "function") {
        textOpen();
    }
}

function startMap() {
    fetchCallsData();
    setupTimers();
}

window.map = map;
window.toggleEvacLayer = toggleEvacLayer;
window.updateWeatherLayer = updateWeatherLayer;
window.scheduleWeatherRefresh = scheduleWeatherRefresh;
window.startMap = startMap;