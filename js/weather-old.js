
const weatherBarLock = document.getElementById('weathBar');
const weatherBarWrap = document.createElement('div');
weatherBarLock.appendChild(weatherBarWrap);
weatherBarWrap.className = "weatherBarWrap";
weatherBarWrap.style.display = "flex";
weatherBarWrap.style.alignItems = "center";

const tempBlock = document.createElement('div');
weatherBarWrap.appendChild(tempBlock);
tempBlock.className = "weatherBarButtonFirst";
tempBlock.id = "tempButton";
tempBlock.onclick = forDrop;

const topWrap = document.createElement('div');
tempBlock.appendChild(topWrap);
topWrap.className = "weatherList";

const tempImg = document.createElement('img');
tempImg.src = "https://hc911.org/images/weathericos/sun.png";
topWrap.appendChild(tempImg);

const tempNum = document.createElement('p');
topWrap.appendChild(tempNum);

const forcastBlock = document.createElement('div');
tempBlock.appendChild(forcastBlock);
forcastBlock.className = "forcastBlock";
forcastBlock.id = "forBox";
forcastBlock.style.display = "block";

const forcastBlock5 = document.createElement('div');
forcastBlock5.id = "forecastContainer";
forcastBlock.appendChild(forcastBlock5);


const forcastBlockP = document.createElement('p');
forcastBlock.appendChild(forcastBlockP);


const weatherBlock = document.createElement('div');
weatherBarWrap.appendChild(weatherBlock);
weatherBlock.className = "weatherBarButton";
weatherBlock.id = "toggleWeatherLayer";

const weatherImg = document.createElement('img');
weatherImg.src = "https://hc911.org/images/weathericos/suncloud.png";
weatherBlock.appendChild(weatherImg);

const weatherBlockP = document.createElement('p');
weatherBlock.appendChild(weatherBlockP);
weatherBlockP.innerText = "PRECIPITATION";

const cloudBlock = document.createElement('div');
weatherBarWrap.appendChild(cloudBlock);
cloudBlock.className = "weatherBarButton";
cloudBlock.id = "toggleCloudLayer";

//const cloudImg = document.createElement('img');
//cloudImg.src = "https://hc911.org/images/weathericos/suncloud.png";
//cloudBlock.appendChild(cloudImg);

const cloudBlockP = document.createElement('p');
cloudBlock.appendChild(cloudBlockP);
cloudBlockP.innerText = "CLOUD COVER";

const windBox = document.createElement('div');
weatherBarWrap.appendChild(windBox);
windBox.className = "weatherBarButton";
windBox.id = "toggleWindLayer";
windBox.style.cursor = "pointer"; 

const windBoxP = document.createElement('p');
windBox.appendChild(windBoxP);
windBoxP.innerText = "WIND";

// Correctly assign a click event handler
windBox.onclick = () => {
    createResponsivePopup('https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=10&overlay=wind&product=ecmwf&level=surface&lat=34.939&lon=-85.261');
};

const evacBlock = document.createElement('div');
weatherBarWrap.appendChild(evacBlock);
evacBlock.className = "weatherBarButton";
evacBlock.id = "toggleEvacLayer";

//const evacImg = document.createElement('img');
//evacImg.src = "https://hc911.org/images/weathericos/sunevac.png";
//evacBlock.appendChild(evacImg);

const evacBlockP = document.createElement('p');
evacBlock.appendChild(evacBlockP);
evacBlockP.innerText = "EVACUATION ROUTES";

countyCordsGrab();



async function countyCordsGrab() {
try {
    const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    countyData = await response.json();
    countyCords = countyData.geometry.coordinates;
    centcord = findCentroid(countyCords);
} catch (error) {
    console.error('Error fetching client information:', error.message);
}
let centcordstr = String(centcord);
let parts = centcordstr.split(',');
longitude = parseFloat(parts[0]);
latitude = parseFloat(parts[1]);

console.log(countyCords)

var latlngs = countyCords[0].map(function(pair) {
    return [pair[1], pair[0]];
});

console.log(latlngs.length)

var polygon = L.polygon(latlngs, {color: 'red', fill: false}).addTo(map);

// Optionally, zoom the map to the polygon
//map.fitBounds(polygon.getBounds());


countyWeatherGrab()
getWeather();
}

async function countyWeatherGrab() {
// Throttle requests to ensure we don't hit the rate limit
await delay(1000); // Wait for 1 second before proceeding with the next call

try {
    const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const countyWeatherData = await response.json();
    const weatherData = countyWeatherData;
    console.log(weatherData);
} catch (error) {
    console.error('Error fetching client information:', error.message);
}

weatherParse();
}

// Delay function
function delay(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function weatherParse() {
if (weatherData.features && weatherData.features.length > 0) {
    weatherData.features.forEach(function(item) {
        if (item.properties.event && item.properties.event.includes("Warning")) {
            alertStatus = "Warning";
            warningData.push(item);
            warning.push(item.properties.headline);
            console.log("Warning found in event:", item.properties.event);
        } else if (item.properties.event && item.properties.event.includes("Watch")) {
            if (alertStatus == "off") {
                alertStatus = "Watch"
            }
            watch.push(item.properties.headline);
            console.log("Watch found in event:", item.properties.event); 
        } else {
            console.log("No Warning in event:", item.properties.event);
        }
    });
} else {
    console.log("No warnings")
    alertStatus == "off"
}
getTemp();
}

/* Helpers */

function findCentroid(coordsArray) {
let latSum = 0;
let lonSum = 0;
let count = 0;
if (coordsArray.length > 1) {
    coordsArray.forEach(coordBlock => {
    coordBlock.forEach(coords => {
        coords.forEach(coord => {
            latSum += coord[0];
            lonSum += coord[1];
            count++;
        });
    });
})
} else {
    coordsArray.forEach(coords => {
    coords.forEach(coord => {
        latSum += coord[0];
        lonSum += coord[1];
        count++;
    });
});
}
return [latSum / count, lonSum / count];
}

document.getElementById('toggleWeatherLayer').addEventListener('click', function() {
    console.log('click');

    weatherLayerVisible = !weatherLayerVisible;

    if (weatherLayerVisible) {
        weatherBlock.classList.add('showLayer');
        weatherImg.src = "https://hc911.org/images/weathericos/suncloudwhite.png";
    } else {
        weatherBlock.classList.remove('showLayer');
        weatherImg.src = "https://hc911.org/images/weathericos/suncloud.png";
    }

    //updateWeatherLayer();
});

document.getElementById('toggleWindLayer').addEventListener('click', function() {
// Assuming you want to toggle the class on a specific element
// Replace '.targetElementSelector' with the actual selector of the element you want to target
const targetElement = document.querySelector('#toggleWindLayer');

if (targetElement) {
    // This will add 'showLayer' if it's not present, and remove it if it is
    targetElement.classList.toggle('showLayer');
}
});

function forDrop() {
console.log("forDrop called");
document.getElementById('tempButton') 
const forBox = document.getElementById('forBox');
const forBoxStyle = window.getComputedStyle(forBox);

if(forBoxStyle.display == 'none' || forBoxStyle.display === '') {
    //kickTheButtOut()
    forBox.style.display = "block";
    topWrap.style.backgroundColor = "#1599D2";
    tempNum.style.color = "#FFF";
    forcastBlockP.innerText = `Current Forecast: ${cast}`;
    tempImg.src = "https://hc911.org/images/weathericos/sunwhite.png";
    displayFiveDayForecast();
} else {
    //const closeButt = document.querySelector(".mapButton");
    forBox.style.display = "none";
    topWrap.style.backgroundColor = "#FFF";
    tempNum.style.color = "#1599D2";
    forcastBlockP.innerText = "";
    tempBlock.style.borderBottomLeftRadius = "15px";
    topWrap.style.borderBottomLeftRadius = "15px";
    tempImg.src = "https://hc911.org/images/weathericos/sun.png";
    //closeButt.style.display = "block";
}

function kickTheButtOut() {
    const closeButt = document.querySelector(".mapButton");
    if (closeButt) {
        closeButt.style.setProperty('display', 'none', 'important');
        console.log('butt be there')
    } else {
        console.log('no butt there')
    }
}
};


document.getElementById('toggleCloudLayer').addEventListener('click', function() {
    console.log('click');

    cloudLayerVisible = !cloudLayerVisible;

    if (cloudLayerVisible) {
        cloudBlock.classList.add('showLayer');
    } else {
        cloudBlock.classList.remove('showLayer');
    }

    //updateCloudLayer();
});

document.getElementById('toggleEvacLayer').addEventListener('click', function() {
toggleEvacLayer()
});

let locateData = "";
let locateLink = "";
let weatherTempData = "";
let weatherRefined = "";
let weatherPull = "";
let cast = "";

async function getWeather() {
const coords = `https://api.weather.gov/points/${latitude},${longitude}`
console.log(coords)
try {
    const response = await fetch(coords);
    if (!response.ok) {
        throw new Error(`HTTP weather error! Status: ${response.status}`);
    }
    locateData = await response.json();
    locateLink = locateData.properties.forecast;
    console.log(locateLink)
    
} catch (error) {
    console.error('Error fetching weather information:', error.message);
    console.log(latitude, longitude);
}
}

const forecastUrl = 'https://api.weather.gov/gridpoints/MRX/29,14/forecast'; // Replace with your forecast URL

async function getTemp() {
  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error(`HTTP Actual weather error! Status: ${response.status}`);
    }
    const weatherTempData = await response.json();
    const weatherPull = weatherTempData.properties.periods[0];
    console.log(weatherPull);
    const weatherRefined = weatherPull.temperature;
    const cast = weatherPull.detailedForecast;
    const tempNum = document.getElementById('tempNum'); // Ensure this element exists
    tempNum.innerText = `${weatherRefined}°`;
  } catch (error) {
    console.error('Error fetching Actual weather information:', error.message);
    console.log(forecastUrl);
  }
}

async function displayFiveDayForecast() {
    console.log('5 day triggered')
  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const forecastData = await response.json();
    const periods = forecastData.properties.periods;

    // Array to hold the forecast data for the next 5 days
    const fiveDayForecast = [];

    // Iterate over the periods and extract data for the next 5 days
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];

      // Look for daytime periods
      if (period.isDaytime) {
        const dayPeriod = period;
        const nightPeriod = periods[i + 1] && !periods[i + 1].isDaytime ? periods[i + 1] : null;

        const date = new Date(dayPeriod.startTime).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        const highTemp = dayPeriod.temperature;
        const lowTemp = nightPeriod ? nightPeriod.temperature : 'N/A';
        const shortForecast = dayPeriod.shortForecast;
        const temperatureUnit = dayPeriod.temperatureUnit;

        fiveDayForecast.push({
          date,
          highTemp,
          lowTemp,
          shortForecast,
          temperatureUnit,
        });

        // Stop after collecting 5 days
        if (fiveDayForecast.length === 5) {
          break;
        }
      }
    }

    // Display the forecast
    const forecastContainer = document.getElementById('forecastContainer');
  
  if (!forecastContainer) {
    console.error('forecastContainer element not found.');
    return; // Exit the function if the element doesn't exist
  }
    forecastContainer.innerHTML = ''; // Clear any existing content

    fiveDayForecast.forEach((dayForecast) => {
      const forecastElement = document.createElement('div');
      forecastElement.classList.add('forecast-day');

      forecastElement.innerHTML = `
        <h3>${dayForecast.date}</h3>
        <p>High: ${dayForecast.highTemp}°${dayForecast.temperatureUnit}</p>
        <p>Low: ${dayForecast.lowTemp !== 'N/A' ? dayForecast.lowTemp + '°' + dayForecast.temperatureUnit : 'N/A'}</p>
        <p>Forecast: ${dayForecast.shortForecast}</p>
      `;

      forecastContainer.appendChild(forecastElement);
    });
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
  }
}