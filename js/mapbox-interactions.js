(() => {
    const POINT_LAYER = "incident-points";
    const CLUSTER_LAYER = "incident-clusters";
    const SOURCE_ID = "active-incidents";

    // The original Leaflet pins rendered at 30x38 with the geographic point
    // anchored at the bottom center. Match that visible footprint here instead
    // of relying on Mapbox symbol collision boxes for hit testing.
    const PIN_HALF_WIDTH = 16;
    const PIN_HEIGHT = 40;
    const PIN_BOTTOM_PADDING = 4;
    const CLUSTER_RADIUS = 28;

    let installed = false;

    function getMap() {
        return window.map ?? null;
    }

    function getQueryableLayers(map) {
        return [POINT_LAYER, CLUSTER_LAYER].filter((layerId) => map.getLayer(layerId));
    }

    function getVisibleInteractiveFeatures(map) {
        const layers = getQueryableLayers(map);

        if (!layers.length) {
            return [];
        }

        return map.queryRenderedFeatures(undefined, { layers });
    }

    function distanceSquared(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return (dx * dx) + (dy * dy);
    }

    function pointContainsPin(cursor, anchor) {
        const dx = cursor.x - anchor.x;
        const dy = cursor.y - anchor.y;

        return (
            Math.abs(dx) <= PIN_HALF_WIDTH &&
            dy >= -PIN_HEIGHT &&
            dy <= PIN_BOTTOM_PADDING
        );
    }

    function pointContainsCluster(cursor, anchor) {
        return distanceSquared(cursor, anchor) <= (CLUSTER_RADIUS * CLUSTER_RADIUS);
    }

    function hitTest(map, cursor) {
        const features = getVisibleInteractiveFeatures(map);
        const matches = [];

        features.forEach((feature) => {
            const coordinates = feature.geometry?.coordinates;

            if (!Array.isArray(coordinates) || coordinates.length < 2) {
                return;
            }

            const anchor = map.project(coordinates);
            const layerId = feature.layer?.id;

            if (layerId === POINT_LAYER && pointContainsPin(cursor, anchor)) {
                matches.push({
                    feature,
                    distance: distanceSquared(cursor, anchor),
                    priority: 0
                });
                return;
            }

            if (layerId === CLUSTER_LAYER && pointContainsCluster(cursor, anchor)) {
                matches.push({
                    feature,
                    distance: distanceSquared(cursor, anchor),
                    priority: 1
                });
            }
        });

        matches.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }

            return a.distance - b.distance;
        });

        return matches.map((match) => match.feature);
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
