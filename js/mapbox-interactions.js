(() => {
    const POINT_LAYER = "incident-points";
    const HIT_LAYER = "incident-hit-targets";
    const CLUSTER_LAYER = "incident-clusters";
    const SOURCE_ID = "active-incidents";

    // The source coordinate is the bottom tip of the 30x38 pin. Build a
    // separate, nearly invisible interaction circle centered on the visible
    // pin body instead of relying on symbol hit geometry.
    const HIT_RADIUS = 18;
    const HIT_Y_OFFSET = -19;

    let installed = false;
    let retryTimer = null;

    function getMap() {
        return window.map ?? null;
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

    function ensureHitLayer(map) {
        if (map.getLayer(HIT_LAYER)) {
            return true;
        }

        if (!map.getSource(SOURCE_ID) || !map.getLayer(POINT_LAYER)) {
            return false;
        }

        map.addLayer({
            id: HIT_LAYER,
            type: "circle",
            source: SOURCE_ID,
            slot: "top",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-radius": HIT_RADIUS,
                "circle-color": "#000000",
                "circle-opacity": 0.001,
                "circle-stroke-opacity": 0,
                "circle-translate": [0, HIT_Y_OFFSET],
                "circle-translate-anchor": "viewport"
            }
        });

        return true;
    }

    function installInteractions() {
        const map = getMap();

        if (!map || installed) {
            return;
        }

        if (
            typeof map.addInteraction !== "function" ||
            !map.getLayer(CLUSTER_LAYER) ||
            !ensureHitLayer(map)
        ) {
            clearTimeout(retryTimer);
            retryTimer = window.setTimeout(installInteractions, 100);
            return;
        }

        installed = true;

        map.addInteraction("hc911-incident-click", {
            type: "click",
            target: { layerId: HIT_LAYER },
            handler: ({ feature }) => {
                if (feature) {
                    openIncidentPopup(map, feature);
                }
            }
        });

        map.addInteraction("hc911-incident-mouseenter", {
            type: "mouseenter",
            target: { layerId: HIT_LAYER },
            handler: () => {
                map.getCanvas().style.cursor = "pointer";
            }
        });

        map.addInteraction("hc911-incident-mouseleave", {
            type: "mouseleave",
            target: { layerId: HIT_LAYER },
            handler: () => {
                map.getCanvas().style.cursor = "";
            }
        });

        map.addInteraction("hc911-cluster-click", {
            type: "click",
            target: { layerId: CLUSTER_LAYER },
            handler: ({ feature }) => {
                if (feature) {
                    void expandCluster(map, feature);
                }
            }
        });

        map.addInteraction("hc911-cluster-mouseenter", {
            type: "mouseenter",
            target: { layerId: CLUSTER_LAYER },
            handler: () => {
                map.getCanvas().style.cursor = "pointer";
            }
        });

        map.addInteraction("hc911-cluster-mouseleave", {
            type: "mouseleave",
            target: { layerId: CLUSTER_LAYER },
            handler: () => {
                map.getCanvas().style.cursor = "";
            }
        });
    }

    function start() {
        const map = getMap();

        if (!map) {
            retryTimer = window.setTimeout(start, 50);
            return;
        }

        installInteractions();
    }

    start();
})();
