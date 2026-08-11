var pins = [
    [[35.0546109,-85.312229], "police", "os", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Chattanooga PD", "Disorder", "123 Broad St", "Chattanooga"],
    [[35.046402, -85.310347], "fire", "e", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Chattanooga Fire Department", "Confined Space Rescue", "123 Broad St", "Chattanooga"],
    [[35.126368, -85.156211], "ems", "h", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "EMS CALL", "123 Broad St", "Hamilton County"],
    [[35.143932, -85.357497], "traffic", "t", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "MVC Injuries", "123 Broad St", "Hamilton County"],
    [[34.990303, -85.254411], "roadclosure", "r", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "Flooding", "123 Broad St", "East Ridge"],

    [[34.997818, -85.668547], "fire", "e", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Chattanooga Fire Department", "Confined Space Rescue", "123 Broad St", "Chattanooga"],

    [[35.077651, -85.452254], "police", "os", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Chattanooga PD", "Disorder", "123 Broad St", "Chattanooga"],
    [[35.140563, -85.194762], "fire", "e", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Chattanooga Fire Department", "Confined Space Rescue", "123 Broad St", "Chattanooga"],
    [[35.056857, -85.371917], "ems", "h", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "EMS CALL", "123 Broad St", "Hamilton County"],
    [[34.951118, -85.502379], "traffic", "t", "Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "MVC Injuries", "123 Broad St", "Hamilton County"],
    [[35.026499, -85.422042], "roadclosure", "r","Incident # 2022-12345", "02/01/2022 3:53:24 PM", "Hamilton Co EMS", "Flooding", "123 Broad St", "East Ridge"],
];

// var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var imagery = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
var map = L.map('map', { zoomControl: false }).setView([35.031381, -85.336799], 11);
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

for (var i = 0; i < pins.length; i++) {
    var a = pins[i];
    var info = '<strong>' + a[3] + '</strong> <br>' + a[4] + ' <br>' + a[5] + ' <br>' + a[6] + ' <br>' + a[7];
    L.marker(a[0], {
        icon: L.icon({
            iconUrl: 'images/pins/' + a[1] + '-' + a[2] + '.png',
            iconRetinaUrl: 'images/pins/' + a[1] + '-' + a[2] + '@2x.png',
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
            className: 'marker-info status-' + a[2]
        })
        .bindTooltip('<strong>' + a[2] + '</strong>', {
            direction: 'top',
            pane: 'shadowPane',
            permanent: true,
            opacity: 1,
            offset: [0, -23],
            className: 'marker-code status-' + a[2]
        })
        .addTo(markers);
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
