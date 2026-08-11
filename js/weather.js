console.log("weather.js build 2026-03-26-1");

const ICON_BASE = "https://hc911.org/images/weathericos";
const WINDY_URL = "https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=10&overlay=wind&product=ecmwf&level=surface&lat=34.939&lon=-85.261";

let locateData = null;
let locateLink = "";
let forecastUrl = "";
let cast = "";
let countyPolygon = null;

const weatherBarLock = document.getElementById("weathBar");
const weatherBarWrap = document.createElement("div");
weatherBarWrap.className = "weatherBarWrap";
weatherBarWrap.style.display = "flex";
weatherBarWrap.style.alignItems = "center";
weatherBarLock?.appendChild(weatherBarWrap);

const tempBlock = document.createElement("div");
tempBlock.className = "weatherBarButtonFirst";
tempBlock.id = "tempButton";
weatherBarWrap.appendChild(tempBlock);

const topWrap = document.createElement("div");
topWrap.className = "weatherList";
tempBlock.appendChild(topWrap);

const tempImg = document.createElement("img");
tempImg.src = `${ICON_BASE}/sun.png`;
topWrap.appendChild(tempImg);

const tempNum = document.createElement("p");
tempNum.id = "tempNum";
topWrap.appendChild(tempNum);

const forecastBlock = document.createElement("div");
forecastBlock.className = "forcastBlock";
forecastBlock.id = "forBox";
forecastBlock.style.display = "none";
tempBlock.appendChild(forecastBlock);

const forecastBlockP = document.createElement("p");
forecastBlock.appendChild(forecastBlockP);

const forecastContainer = document.createElement("div");
forecastContainer.id = "forecastContainer";
forecastBlock.appendChild(forecastContainer);

const weatherBlock = document.createElement("div");
weatherBlock.className = "weatherBarButton";
weatherBlock.id = "toggleWeatherLayer";
weatherBarWrap.appendChild(weatherBlock);

const weatherImg = document.createElement("img");
weatherImg.src = `${ICON_BASE}/suncloud.png`;
weatherBlock.appendChild(weatherImg);

const weatherBlockP = document.createElement("p");
weatherBlockP.innerText = "RADAR";
weatherBlock.appendChild(weatherBlockP);

const windBox = document.createElement("div");
windBox.className = "weatherBarButton";
windBox.id = "toggleWindLayer";
windBox.style.cursor = "pointer";
weatherBarWrap.appendChild(windBox);

const windBoxP = document.createElement("p");
windBoxP.innerText = "WIND";
windBox.appendChild(windBoxP);

const evacBlock = document.createElement("div");
evacBlock.className = "weatherBarButton";
evacBlock.id = "toggleEvacLayer";
weatherBarWrap.appendChild(evacBlock);

const evacBlockP = document.createElement("p");
evacBlockP.innerText = "EVACUATION ROUTES";
evacBlock.appendChild(evacBlockP);

tempBlock.addEventListener("click", toggleForecastPanel);

weatherBlock.addEventListener("click", () => {
    weatherLayerVisible = !weatherLayerVisible;
    console.log("weather toggle clicked", weatherLayerVisible);

    if (weatherLayerVisible) {
        weatherBlock.classList.add("showLayer");
        weatherImg.src = `${ICON_BASE}/suncloudwhite.png`;
    } else {
        weatherBlock.classList.remove("showLayer");
        weatherImg.src = `${ICON_BASE}/suncloud.png`;
    }

    updateWeatherLayer();
});

windBox.addEventListener("click", () => {
    windBox.classList.toggle("showLayer");

    if (typeof createResponsivePopup === "function") {
        createResponsivePopup(WINDY_URL);
    }
});

evacBlock.addEventListener("click", () => {
    toggleEvacLayer();
});

void initializeWeatherUi();

async function initializeWeatherUi() {
    await countyCordsGrab();
    await countyWeatherGrab();
    await getWeather();
    await getTemp();
}

async function countyCordsGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);

        if (!response.ok) {
            throw new Error(`County zone request failed with status ${response.status}`);
        }

        const countyData = await response.json();
        countyCords = countyData.geometry?.coordinates ?? [];
        centcord = findCentroid(countyCords);

        if (Array.isArray(centcord) && centcord.length === 2) {
            longitude = parseFloat(centcord[0]);
            latitude = parseFloat(centcord[1]);
        }

        drawCountyOutline();
    } catch (error) {
        console.error("Error fetching county geometry:", error.message);
    }
}

function drawCountyOutline() {
    if (!Array.isArray(countyCords) || countyCords.length === 0 || !window.map) {
        return;
    }

    const outerRing = Array.isArray(countyCords[0]?.[0]?.[0]) ? countyCords[0][0] : countyCords[0];

    if (!Array.isArray(outerRing)) {
        return;
    }

    const latlngs = outerRing.map((pair) => [pair[1], pair[0]]);

    if (countyPolygon) {
        map.removeLayer(countyPolygon);
    }

    countyPolygon = L.polygon(latlngs, {
        color: "red",
        fill: false,
        weight: 2
    }).addTo(map);
}

async function countyWeatherGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);

        if (!response.ok) {
            throw new Error(`County alerts request failed with status ${response.status}`);
        }

        weatherData = await response.json();
        weatherParse();
    } catch (error) {
        console.error("Error fetching county alerts:", error.message);
    }
}

function weatherParse() {
    warning = [];
    warningData = [];
    watch = [];
    alertStatus = "off";

    const features = weatherData?.features ?? [];

    if (!features.length) {
        return;
    }

    features.forEach((item) => {
        const eventName = item?.properties?.event ?? "";
        const headline = item?.properties?.headline ?? "";

        if (eventName.includes("Warning")) {
            alertStatus = "Warning";
            warningData.push(item);
            warning.push(headline);
            return;
        }

        if (eventName.includes("Watch")) {
            if (alertStatus === "off") {
                alertStatus = "Watch";
            }
            watch.push(headline);
        }
    });
}

async function getWeather() {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return;
    }

    try {
        const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);

        if (!response.ok) {
            throw new Error(`NWS points request failed with status ${response.status}`);
        }

        locateData = await response.json();
        locateLink = locateData?.properties?.forecast ?? "";
        forecastUrl = locateLink;
    } catch (error) {
        console.error("Error fetching weather point data:", error.message);
    }
}

async function getTemp() {
    if (!forecastUrl) {
        return;
    }

    try {
        const response = await fetch(forecastUrl);

        if (!response.ok) {
            throw new Error(`Forecast request failed with status ${response.status}`);
        }

        const forecastData = await response.json();
        const currentPeriod = forecastData?.properties?.periods?.[0];

        if (!currentPeriod) {
            return;
        }

        tempNum.innerText = `${currentPeriod.temperature}°`;
        cast = currentPeriod.detailedForecast ?? "";
    } catch (error) {
        console.error("Error fetching current weather:", error.message);
    }
}

async function displayFiveDayForecast() {
    if (!forecastUrl) {
        return;
    }

    try {
        const response = await fetch(forecastUrl);

        if (!response.ok) {
            throw new Error(`Forecast request failed with status ${response.status}`);
        }

        const forecastData = await response.json();
        const periods = forecastData?.properties?.periods ?? [];
        const fiveDayForecast = [];

        for (let i = 0; i < periods.length; i++) {
            const period = periods[i];

            if (!period.isDaytime) {
                continue;
            }

            const nightPeriod = periods[i + 1] && !periods[i + 1].isDaytime ? periods[i + 1] : null;

            fiveDayForecast.push({
                date: new Date(period.startTime).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }),
                highTemp: period.temperature,
                lowTemp: nightPeriod ? nightPeriod.temperature : "N/A",
                shortForecast: period.shortForecast,
                temperatureUnit: period.temperatureUnit
            });

            if (fiveDayForecast.length === 5) {
                break;
            }
        }

        forecastContainer.innerHTML = "";

        fiveDayForecast.forEach((dayForecast) => {
            const forecastElement = document.createElement("div");
            forecastElement.classList.add("forecast-day");

            forecastElement.innerHTML = `
                <h3 class="forecast-day-title">${dayForecast.date}</h3>
                <p>High: ${dayForecast.highTemp}°${dayForecast.temperatureUnit}</p>
                <p>Low: ${dayForecast.lowTemp !== "N/A" ? `${dayForecast.lowTemp}°${dayForecast.temperatureUnit}` : "N/A"}</p>
                <p>Forecast: ${dayForecast.shortForecast}</p>
            `;

            forecastContainer.appendChild(forecastElement);
        });
    } catch (error) {
        console.error("Error fetching five-day forecast:", error.message);
    }
}

function toggleForecastPanel() {
    const isOpen = forecastBlock.style.display === "block";

    if (isOpen) {
        forecastBlock.style.display = "none";

        topWrap.style.backgroundColor = "#FFF";
        tempNum.style.color = "#1599D2";
        forecastBlockP.innerText = "";
        tempImg.src = `${ICON_BASE}/sun.png`;

        // restore rounded lower-left corner after close
        tempBlock.style.borderBottomLeftRadius = "15px";
        topWrap.style.borderBottomLeftRadius = "15px";

        return;
    }

    forecastBlock.style.display = "block";

    topWrap.style.backgroundColor = "#1599D2";
    tempNum.style.color = "#FFF";
    forecastBlockP.innerText = cast ? `Current Forecast: ${cast}` : "";
    tempImg.src = `${ICON_BASE}/sunwhite.png`;

    // flatten lower-left corner while dropdown is open
    tempBlock.style.borderBottomLeftRadius = "0";
    topWrap.style.borderBottomLeftRadius = "0";

    void displayFiveDayForecast();
}

function findCentroid(coordsArray) {
    let lonSum = 0;
    let latSum = 0;
    let count = 0;

    function walkCoords(value) {
        if (!Array.isArray(value)) {
            return;
        }

        if (
            value.length === 2 &&
            typeof value[0] === "number" &&
            typeof value[1] === "number"
        ) {
            lonSum += value[0];
            latSum += value[1];
            count++;
            return;
        }

        value.forEach(walkCoords);
    }

    walkCoords(coordsArray);

    if (count === 0) {
        return [0, 0];
    }

    return [lonSum / count, latSum / count];
}