(() => {
    const POINT_LAYER = "incident-points";
    const CLUSTER_LAYER = "incident-clusters";
    const SOURCE_ID = "active-incidents";

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

    function installInteractions() {
        const map = getMap();

        if (!map || installed) {
            return;
        }

        if (
            typeof map.addInteraction !== "function" ||
            !map.getLayer(POINT_LAYER) ||
            !map.getLayer(CLUSTER_LAYER)
        ) {
            clearTimeout(retryTimer);
            retryTimer = window.setTimeout(installInteractions, 100);
            return;
        }

        installed = true;

        map.addInteraction("hc911-incident-click", {
            type: "click",
            target: { layerId: POINT_LAYER },
            handler: ({ feature }) => {
                if (feature) {
                    openIncidentPopup(map, feature);
                }
            }
        });

        map.addInteraction("hc911-incident-mouseenter", {
            type: "mouseenter",
            target: { layerId: POINT_LAYER },
            handler: () => {
                map.getCanvas().style.cursor = "pointer";
            }
        });

        map.addInteraction("hc911-incident-mouseleave", {
            type: "mouseleave",
            target: { layerId: POINT_LAYER },
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
