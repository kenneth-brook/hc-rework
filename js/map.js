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

const WEATHER_SCRIPT_URL = "js/weather.js";
const WEATHER_FORGE_BASE = "https://911emergensee.com/weather";
const CALLS_API_URL = "https://hc911server.com/api/calls";
const timeoutInMilliseconds = 15 * 60 * 1000;

const INCIDENT_SOURCE_ID = "active-incidents";
const INCIDENT_CLUSTER_LAYER_ID = "incident-clusters";
const INCIDENT_CLUSTER_COUNT_LAYER_ID = "incident-cluster-count";
const INCIDENT_POINT_LAYER_ID = "incident-points";
const RADAR_SOURCE_ID = "weather-radar";
const RADAR_LAYER_ID = "weather-radar";
const EVAC_SOURCE_ID = "evacuation-routes";
const EVAC_LAYER_ID = "evacuation-routes";
const COUNTY_SOURCE_ID = "hamilton-county-outline";
const COUNTY_LAYER_ID = "hamilton-county-outline";

const INCIDENT_ICON_PATHS = {
    police: "images/pins/police",
    fire: "images/pins/fire",
    ems: "images/pins/ems",
    roadclosure: "images/pins/roadclosure"
};

// Same NOAA ArcGIS base-reflectivity service used by wild-fire-map.
// Mapbox substitutes each tile's Web Mercator bounding box into the request,
// so the overlay remains usable at normal Mapbox zoom levels.
const NOAA_RADAR_TILE_URL =
    "https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer/export" +
    "?bbox={bbox-epsg-3857}" +
    "&bboxSR=3857" +
    "&imageSR=3857" +
    "&size=256,256" +
    "&format=png32" +
    "&transparent=true" +
    "&f=image";

let timeoutId = null;
let datapool = [];
let datapoolSort = [];
let weatherRefreshTimer = null;
let evacVisible = false;
let mapReady = false;
let incidentSetupPromise = null;
let incidentInteractionsBound = false;

const dep = document.querySelector("#dtype");
const age = document.querySelector("#data-agency");
const are = document.querySelector("#data-area");

const mapboxToken = window.HC911_CONFIG?.mapboxAccessToken?.trim() ?? "";

if (!mapboxToken) {
    console.error("Mapbox access token is missing. Add the public token in js/mapbox-config.js.");
}

if (typeof mapboxgl !== "undefined" && mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
}

const map = typeof mapboxgl !== "undefined" && mapboxToken
    ? new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/standard",
        center: [-85.239854, 35.088743],
        zoom: 10.5,
        attributionControl: true
    })
    : null;

if (map) {
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("load", async () => {
        mapReady = true;

        await ensureIncidentLayers();
        updateIncidentSource();

        if (weatherLayerVisible) {
            showWeatherOverlay();
        }

        if (evacVisible) {
            void showEvacLayer();
        }

        if (Array.isArray(countyCords) && countyCords.length) {
            drawCountyOutlineOnMap();
        }
    });
}

const weatherScript = document.createElement("script");
weatherScript.src = WEATHER_SCRIPT_URL;
document.head.appendChild(weatherScript);

function appendPopupLine(container, value, strong = false) {
    if (!value) return;

    const element = document.createElement(strong ? "strong" : "div");
    element.textContent = value;
    container.appendChild(element);
}

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
        document.addEventListener(eventName, startTimer, { passive: true });
    });

    startTimer();
}

const timer = setInterval(fetchCallsData, 60000);

async function fetchCallsData() {
    try {
        const response = await fetch(CALLS_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Frontend-Auth": "my-secure-token",
                "Origin": "https://www.hamiltontn911.gov"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Calls API failed with status ${response.status}`);
        }

        const data = await response.json();
        datapool = data.filter((item) => item.type !== "PERBURN");
        applyFilters();
    } catch (error) {
        console.error("🚨 API Call Failed:", error);
    }
}

function applyFilters() {
    let results = datapool.slice();
    const rSort = document.getElementsByName("rStatus");
    let selectedStatus = "all";

    for (let i = 0; i < rSort.length; i++) {
        if (rSort[i].checked) {
            selectedStatus = rSort[i].value;
            break;
        }
    }

    if (selectedStatus !== "all") {
        results = results.filter((item) => item.status === selectedStatus);
    }

    const agencyType = dep?.value ?? "all";
    if (agencyType !== "all") {
        results = results.filter((item) => item.agency_type === agencyType);
    }

    const agency = age?.value ?? "all";
    if (agency !== "all") {
        results = results.filter((item) => item.jurisdiction === agency);
    }

    const area = are?.value ?? "all";
    if (area !== "all") {
        results = results.filter((item) => item.city === area);
    }

    datapoolSort = results;
    renderCalls();
    updateIncidentSource();
}

function getLocalCallTime(utcDate) {
    const date = new Date(utcDate);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date);
}

function getDepartment(item) {
    if (item.type_description === "ROAD CLOSURE") return "roadclosure";
    if (item.agency_type === "Law") return "police";
    if (item.agency_type === "EMS") return "ems";
    if (item.agency_type === "Fire") return "fire";
    return "police";
}

function getStatusCode(item) {
    if (item.type_description === "ROAD CLOSURE") return "R";
    if (item.status === "Reported") return "R";
    if (item.status === "Enroute") return "E";
    if (item.status === "On Scene") return "OS";
    if (item.status === "Transporting") return "T";
    if (item.status === "At Hospital") return "H";
    return "";
}

function incidentFeatureCollection() {
    return {
        type: "FeatureCollection",
        features: datapoolSort
            .map((item) => {
                const lat = Number.parseFloat(item.latitude);
                const lng = Number.parseFloat(item.longitude);

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                    return null;
                }

                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    properties: {
                        department: getDepartment(item),
                        statusCode: getStatusCode(item),
                        status: item.status ?? "",
                        masterIncident: item.master_incident_id ?? "",
                        sequenceNumber: item.sequencenumber ?? "",
                        created: getLocalCallTime(item.creation),
                        jurisdiction: item.jurisdiction ?? "",
                        type: item.type ?? "",
                        location: item.location ?? "",
                        area: item.city ?? ""
                    }
                };
            })
            .filter(Boolean)
    };
}

function ensureIncidentLayers() {
    if (!map || !mapReady) {
        return Promise.resolve();
    }

    if (map.getSource(INCIDENT_SOURCE_ID) && map.getLayer(INCIDENT_POINT_LAYER_ID)) {
        bindIncidentInteractions();
        return Promise.resolve();
    }

    if (incidentSetupPromise) {
        return incidentSetupPromise;
    }

    incidentSetupPromise = setupIncidentLayers()
        .catch((error) => {
            console.error("Unable to initialize incident map layers:", error);
        })
        .finally(() => {
            incidentSetupPromise = null;
        });

    return incidentSetupPromise;
}

async function setupIncidentLayers() {
    if (!map.getSource(INCIDENT_SOURCE_ID)) {
        map.addSource(INCIDENT_SOURCE_ID, {
            type: "geojson",
            data: incidentFeatureCollection(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 48
        });
    }

    if (!map.getLayer(INCIDENT_CLUSTER_LAYER_ID)) {
        map.addLayer({
            id: INCIDENT_CLUSTER_LAYER_ID,
            type: "circle",
            source: INCIDENT_SOURCE_ID,
            slot: "top",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": "#174f7a",
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    18,
                    10, 22,
                    30, 27
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff"
            }
        });
    }

    if (!map.getLayer(INCIDENT_CLUSTER_COUNT_LAYER_ID)) {
        map.addLayer({
            id: INCIDENT_CLUSTER_COUNT_LAYER_ID,
            type: "symbol",
            source: INCIDENT_SOURCE_ID,
            slot: "top",
            filter: ["has", "point_count"],
            layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
                "text-allow-overlap": true
            },
            paint: {
                "text-color": "#ffffff"
            }
        });
    }

    await loadIncidentIcons();

    if (!map.getLayer(INCIDENT_POINT_LAYER_ID)) {
        map.addLayer({
            id: INCIDENT_POINT_LAYER_ID,
            type: "symbol",
            source: INCIDENT_SOURCE_ID,
            slot: "top",
            filter: ["!", ["has", "point_count"]],
            layout: {
                "icon-image": [
                    "match",
                    ["get", "department"],
                    "fire", "incident-fire",
                    "ems", "incident-ems",
                    "roadclosure", "incident-roadclosure",
                    "police", "incident-police",
                    "incident-police"
                ],
                "icon-anchor": "bottom",
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                "text-field": ["get", "statusCode"],
                "text-size": 10,
                "text-anchor": "bottom",
                "text-offset": [0, -4.0],
                "text-allow-overlap": true,
                "text-ignore-placement": true
            },
            paint: {
                "text-color": "#17212b",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5
            }
        });
    }

    bindIncidentInteractions();
}

async function loadIncidentIcons() {
    await Promise.all(
        Object.entries(INCIDENT_ICON_PATHS).map(([department, basePath]) =>
            loadIncidentIcon(department, basePath)
        )
    );
}

async function loadIncidentIcon(department, basePath) {
    const imageName = `incident-${department}`;

    if (map.hasImage(imageName)) {
        return;
    }

    try {
        const retinaImage = await loadMapImage(`${basePath}@2x.png`);
        if (!map.hasImage(imageName)) {
            map.addImage(imageName, retinaImage, { pixelRatio: 2 });
        }
        return;
    } catch (retinaError) {
        console.warn(`Retina ${department} pin could not be loaded; trying standard pin.`, retinaError);
    }

    const standardImage = await loadMapImage(`${basePath}.png`);
    if (!map.hasImage(imageName)) {
        map.addImage(imageName, standardImage);
    }
}

function loadMapImage(url) {
    return new Promise((resolve, reject) => {
        map.loadImage(url, (error, image) => {
            if (error || !image) {
                reject(error ?? new Error(`Image ${url} returned no data`));
                return;
            }

            resolve(image);
        });
    });
}

function bindIncidentInteractions() {
    if (!map || incidentInteractionsBound) {
        return;
    }

    if (!map.getLayer(INCIDENT_CLUSTER_LAYER_ID) || !map.getLayer(INCIDENT_POINT_LAYER_ID)) {
        return;
    }

    incidentInteractionsBound = true;

    map.on("click", INCIDENT_CLUSTER_LAYER_ID, async (event) => {
        const feature = event.features?.[0];
        if (!feature) return;

        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource(INCIDENT_SOURCE_ID);
        if (!source || clusterId == null) return;

        try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            map.easeTo({
                center: feature.geometry.coordinates,
                zoom
            });
        } catch (error) {
            console.error("Unable to expand incident cluster:", error);
        }
    });

    map.on("click", INCIDENT_POINT_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;

        const coordinates = feature.geometry.coordinates.slice();
        const properties = feature.properties ?? {};
        const popup = document.createElement("div");

        appendPopupLine(popup, properties.masterIncident, true);
        appendPopupLine(popup, properties.created);
        appendPopupLine(popup, properties.jurisdiction);
        appendPopupLine(popup, properties.type);
        appendPopupLine(popup, properties.location);

        new mapboxgl.Popup({
            offset: [0, -34],
            closeButton: true,
            closeOnClick: true
        })
            .setLngLat(coordinates)
            .setDOMContent(popup)
            .addTo(map);
    });

    [INCIDENT_CLUSTER_LAYER_ID, INCIDENT_POINT_LAYER_ID].forEach((layerId) => {
        map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
        });
    });
}

function updateIncidentSource() {
    if (!map || !mapReady) return;

    void ensureIncidentLayers().then(() => {
        const source = map.getSource(INCIDENT_SOURCE_ID);
        source?.setData(incidentFeatureCollection());
    });
}

function renderCalls() {
    const chart = document.getElementById("chart");
    if (!chart) return;

    chart.replaceChildren();

    datapoolSort.forEach((item) => {
        const lat = Number.parseFloat(item.latitude);
        const lng = Number.parseFloat(item.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const newDate = getLocalCallTime(item.creation);
        const department = getDepartment(item);
        const tr = document.createElement("tr");

        const typeCell = createTextCell(item.agency_type, "col-type", true);
        typeCell.firstElementChild?.classList.add(department);

        const statCell = createTextCell(item.status, "col-status", true);
        const incidentCell = createTextCell(
            `Incident # ${item.sequencenumber ?? ""}`,
            "col-incident",
            true
        );
        const dateCell = createTextCell(newDate, "col-date");
        const jurCell = createTextCell(item.jurisdiction, "col-jur");
        const desCell = createTextCell(item.type, "col-des");

        const locCell = document.createElement("td");
        locCell.classList.add("col-loc", "locCell");

        const clickBut = document.createElement("button");
        clickBut.type = "button";
        clickBut.classList.add("clickBut");

        const butName = document.createElement("p");
        butName.textContent = item.location ?? "";
        clickBut.appendChild(butName);
        clickBut.addEventListener("click", () => focusIncident(lng, lat));
        locCell.appendChild(clickBut);

        const areaCell = createTextCell(item.city, "col-area");

        tr.append(
            typeCell,
            statCell,
            incidentCell,
            dateCell,
            jurCell,
            desCell,
            locCell,
            areaCell
        );

        tr.classList.add("rowSplit", `status-code-${department}`);
        chart.appendChild(tr);
    });
}

function createTextCell(value, className, strong = false) {
    const cell = document.createElement("td");
    cell.classList.add(className);

    const content = document.createElement(strong ? "strong" : "span");
    content.textContent = value ?? "";
    cell.appendChild(content);

    return cell;
}

function focusIncident(lng, lat) {
    mapOpen();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!map) return;

    map.flyTo({
        center: [lng, lat],
        zoom: 16,
        essential: true
    });
}

function ensureWeatherOverlay() {
    if (!map || !mapReady) return;

    if (!map.getSource(RADAR_SOURCE_ID)) {
        map.addSource(RADAR_SOURCE_ID, {
            type: "raster",
            tiles: [NOAA_RADAR_TILE_URL],
            tileSize: 256,
            attribution: "NOAA / National Weather Service"
        });
    }

    if (!map.getLayer(RADAR_LAYER_ID)) {
        map.addLayer({
            id: RADAR_LAYER_ID,
            type: "raster",
            source: RADAR_SOURCE_ID,
            slot: "middle",
            layout: {
                visibility: weatherLayerVisible ? "visible" : "none"
            },
            paint: {
                "raster-opacity": 0.78,
                "raster-fade-duration": 300
            }
        });
    }
}

function showWeatherOverlay() {
    if (!map || !mapReady) return;

    ensureWeatherOverlay();

    if (map.getLayer(RADAR_LAYER_ID)) {
        map.setLayoutProperty(RADAR_LAYER_ID, "visibility", "visible");
    }
}

function hideWeatherOverlay() {
    if (!map || !mapReady) return;

    if (map.getLayer(RADAR_LAYER_ID)) {
        map.setLayoutProperty(RADAR_LAYER_ID, "visibility", "none");
    }
}

function updateWeatherLayer() {
    if (weatherLayerVisible) {
        showWeatherOverlay();
    } else {
        hideWeatherOverlay();
    }
}

function scheduleWeatherRefresh() {
    clearTimeout(weatherRefreshTimer);

    weatherRefreshTimer = window.setTimeout(() => {
        if (!weatherLayerVisible || !map || !mapReady) return;

        // Recreate the dynamic NOAA source to force fresh radar imagery rather
        // than reusing an older tile from Mapbox's in-memory raster cache.
        if (map.getLayer(RADAR_LAYER_ID)) {
            map.removeLayer(RADAR_LAYER_ID);
        }
        if (map.getSource(RADAR_SOURCE_ID)) {
            map.removeSource(RADAR_SOURCE_ID);
        }

        showWeatherOverlay();
    }, 500);
}

function toggleEvacLayer() {
    evacVisible = !evacVisible;
    const evacBlock = document.getElementById("toggleEvacLayer");

    if (evacVisible) {
        evacBlock?.classList.add("showLayer");
        void showEvacLayer();
    } else {
        evacBlock?.classList.remove("showLayer");
        hideEvacLayer();
    }
}

async function showEvacLayer() {
    if (!map || !mapReady) return;

    try {
        const response = await fetch("./json/routs2.geojson", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Evacuation routes returned ${response.status}`);
        }

        const data = await response.json();

        if (map.getSource(EVAC_SOURCE_ID)) {
            map.getSource(EVAC_SOURCE_ID).setData(data);

            if (map.getLayer(EVAC_LAYER_ID)) {
                map.setLayoutProperty(EVAC_LAYER_ID, "visibility", "visible");
            }
            return;
        }

        map.addSource(EVAC_SOURCE_ID, {
            type: "geojson",
            data
        });

        map.addLayer({
            id: EVAC_LAYER_ID,
            type: "line",
            source: EVAC_SOURCE_ID,
            slot: "middle",
            paint: {
                "line-color": "#f28c18",
                "line-width": 4,
                "line-opacity": 0.9
            }
        });
    } catch (error) {
        console.error("Error loading evacuation routes:", error);
    }
}

function hideEvacLayer() {
    if (!map || !mapReady) return;

    if (map.getLayer(EVAC_LAYER_ID)) {
        map.setLayoutProperty(EVAC_LAYER_ID, "visibility", "none");
    }
}

function drawCountyOutlineOnMap() {
    if (
        !map ||
        !mapReady ||
        !Array.isArray(countyCords) ||
        countyCords.length === 0
    ) {
        return;
    }

    const geometry = {
        type: Array.isArray(countyCords[0]?.[0]?.[0]) ? "MultiPolygon" : "Polygon",
        coordinates: countyCords
    };

    const data = {
        type: "Feature",
        properties: {},
        geometry
    };

    if (map.getSource(COUNTY_SOURCE_ID)) {
        map.getSource(COUNTY_SOURCE_ID).setData(data);
        return;
    }

    map.addSource(COUNTY_SOURCE_ID, {
        type: "geojson",
        data
    });

    map.addLayer({
        id: COUNTY_LAYER_ID,
        type: "line",
        source: COUNTY_SOURCE_ID,
        slot: "middle",
        paint: {
            "line-color": "#d93636",
            "line-width": 2
        }
    });
}

function clearMap() {
    map?.resize();

    if (weatherLayerVisible) {
        scheduleWeatherRefresh();
    }
}

function mapToggle() {
    const mapHouse = document.getElementById("mapHouse");
    const mapElement = document.getElementById("map");

    mapHouse?.classList.toggle("mapGrow");
    mapElement?.classList.toggle("mapShow");

    window.setTimeout(() => map?.resize(), 250);

    if (typeof textSwap === "function") {
        textSwap();
    }
}

function mapOpen() {
    const mapHouse = document.getElementById("mapHouse");
    const mapElement = document.getElementById("map");

    mapHouse?.classList.add("mapGrow");
    mapElement?.classList.add("mapShow");

    window.setTimeout(() => map?.resize(), 250);

    if (typeof textOpen === "function") {
        textOpen();
    }
}

function startMap() {
    fetchCallsData();
    setupTimers();
}

window.map = map;
window.call = applyFilters;
window.fetchCallsData = fetchCallsData;
window.toggleEvacLayer = toggleEvacLayer;
window.updateWeatherLayer = updateWeatherLayer;
window.scheduleWeatherRefresh = scheduleWeatherRefresh;
window.drawCountyOutlineOnMap = drawCountyOutlineOnMap;
window.startMap = startMap;
