(() => {
    const POINT_LAYER = "incident-points";
    const CLUSTER_LAYER = "incident-clusters";
    const SOURCE_ID = "active-incidents";
    const HIT_RADIUS = 8;

    let installed = false;

    function getMap() {
        return window.map ?? null;
    }

    function getQueryableLayers(map) {
        return [POINT_LAYER, CLUSTER_LAYER].filter((layerId) => map.getLayer(layerId));
    }

    function hitTest(map, point) {
        const layers = getQueryableLayers(map);

        if (!layers.length) {
            return [];
        }

        const box = [
            [point.x - HIT_RADIUS, point.y - HIT_RADIUS],
            [point.x + HIT_RADIUS, point.y + HIT_RADIUS]
        ];

        return map.queryRenderedFeatures(box, { layers });
    }

    function buildIncidentPopup(feature) {
        const properties = feature.properties ?? {};
        const popup = document.createElement("div");

        addLine(popup, properties.masterIncident, true);
        addLine(popup, properties.created);
        addLine(popup, properties.jurisdiction);
        addLine(popup, properties.type);
        addLine(popup, properties.location);

        return popup;
    }

    function addLine(container, value, strong = false) {
        if (!value) {
            return;
        }

        const element = document.createElement(strong ? "strong" : "div");
        element.textContent = value;
        container.appendChild(element);
    }

    async function expandCluster(map, feature) {
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource(SOURCE_ID);

        if (!source || clusterId == null) {
            return;
        }

        try {
            const zoom = await source.getClusterExpansionZoom(clusterId);

            map.easeTo({
                center: feature.geometry.coordinates,
                zoom
            });
        } catch (error) {
            console.error("Unable to expand incident cluster:", error);
        }
    }

    function openIncidentPopup(map, feature) {
        const coordinates = feature.geometry?.coordinates?.slice();

        if (!Array.isArray(coordinates)) {
            return;
        }

        new mapboxgl.Popup({
            offset: [0, -34],
            closeButton: true,
            closeOnClick: true
        })
            .setLngLat(coordinates)
            .setDOMContent(buildIncidentPopup(feature))
            .addTo(map);
    }

    function installInteractions() {
        const map = getMap();

        if (!map || installed) {
            return;
        }

        installed = true;

        map.on("mousemove", (event) => {
            const features = hitTest(map, event.point);
            map.getCanvas().style.cursor = features.length ? "pointer" : "";
        });

        map.on("mouseout", () => {
            map.getCanvas().style.cursor = "";
        });

        map.on("click", (event) => {
            const features = hitTest(map, event.point);

            if (!features.length) {
                return;
            }

            // Prefer an individual incident if a pin and cluster overlap inside
            // the expanded hit box.
            const pointFeature = features.find((feature) => feature.layer?.id === POINT_LAYER);

            if (pointFeature) {
                openIncidentPopup(map, pointFeature);
                return;
            }

            const clusterFeature = features.find((feature) => feature.layer?.id === CLUSTER_LAYER);

            if (clusterFeature) {
                void expandCluster(map, clusterFeature);
            }
        });
    }

    function start() {
        const map = getMap();

        if (!map) {
            window.setTimeout(start, 50);
            return;
        }

        if (map.loaded()) {
            installInteractions();
            return;
        }

        map.once("load", installInteractions);
    }

    start();
})();
