// Init map
mapboxgl.accessToken = 'pk.eyJ1IjoidGF5YWNoaWxsIiwiYSI6ImNpbGtxeHdnNzAwNzRvMGtxcWV4bXlmenQifQ.ymQiP_8v2syh79ZH9HU4Eg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tayachill/cjn4rvudk085g2smerfhmsbp3',
  center: [-23.458504, 33.315297],
  zoom: 2
});

const info = document.getElementById('info');

let hoveredStateId = null;

map.on('load', () => {
  fetch('https://api.wunderground.com/api/63bd21da7558e560/currenthurricane/view.json')
    .then(response => response.json())
    .then(data => {
      const {year, mon, mday, hour} = data.currenthurricane[0].Current.TimeGMT;
      const offset = new Date().getTimezoneOffset() / 60;
      const currentDate = new Date(+year, +mon - 1, +mday, (+hour - offset));

      info.textContent = `Updated: ${currentDate.toLocaleString()}`;
      return parsingSources(data)
    })

    .then(sources => {
      // add sources
      Object.keys(sources).forEach(id => {
        map.addSource(id, {
          type: 'geojson',
          data: sources[id]
        })
      });

      // add layer
      map.addLayer({
        'id': 'forecastPolygonHurricanes',
        'type': 'fill',
        'source': 'forecastPolygonHurricanes',
        'paint': {
          'fill-color': '#6b6eff',
          'fill-opacity': 0.4,
        }
      });

      map.addLayer({
        'id': 'forecastOutlinePolygonHurricanes',
        'type': 'line',
        'source': 'forecastPolygonHurricanes',
        'paint': {
          'line-color': '#4042ff',
          'line-opacity': 1,
          'line-width': 10,
          'line-blur': 10
        }
      });

      map.addLayer({
        'id': 'trajectoriesHurricanes',
        'type': 'line',
        'source': 'trajectoriesHurricanes',
        'paint': {
          'line-width': [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            10,
            6
          ],
          'line-color': '#fe8191'
        }
      });

      map.addLayer({
        'id': 'forecastLineHurricanes',
        'type': 'line',
        'source': 'forecastLineHurricanes',
        'paint': {
          'line-width': [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            10,
            6
          ],
          'line-dasharray': [0.8, 0.8],
          'line-opacity': 1,
          'line-color': '#fe8191'
        }
      });

      map.addLayer({
        'id': 'forecastPointHurricanes_bg',
        'type': 'circle',
        'source': 'forecastPointHurricanes',
        'paint': {
          'circle-radius': [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            4,
            10,
            22,
            20
          ],
          'circle-color': '#Fff',
          'circle-blur': 1,
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 1,
        }
      });

      map.addLayer({
        'id': 'forecastPointHurricanes',
        'type': 'circle',
        'source': 'forecastPointHurricanes',
        'paint': {
          'circle-radius': [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            4,
            5,
            22,
            10
          ],
          'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            "#980027",
            '#4042ff'
          ],
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 1,
        }
      });

      map.addLayer({
        'id': 'forecastPointHurricanesHover',
        'type': 'circle',
        'source': 'forecastPointHurricanes',
        'paint': {
          'circle-radius': 10,
          'circle-opacity': 0
        }
      });

      map.addLayer({
        'id': 'historyPointHurricanes_bg',
        'type': 'circle',
        'source': 'historyPointHurricanes',
        'paint': {
          'circle-radius': [
            "interpolate",
            ["linear"],
            ["zoom"],
            2,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.34.NE"
                ],
                [
                  "get",
                  "WindRadius.34.NW"
                ],
                [
                  "get",
                  "WindRadius.34.SE"
                ],
                [
                  "get",
                  "WindRadius.34.SW"
                ]
              ],
              40
            ],
            4,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.34.NE"
                ],
                [
                  "get",
                  "WindRadius.34.NW"
                ],
                [
                  "get",
                  "WindRadius.34.SE"
                ],
                [
                  "get",
                  "WindRadius.34.SW"
                ]
              ],
              15
            ],
            22,
            [
              "max",
              [
                "get",
                "WindRadius.34.NE"
              ],
              [
                "get",
                "WindRadius.34.NW"
              ],
              [
                "get",
                "WindRadius.34.SE"
              ],
              [
                "get",
                "WindRadius.34.SW"
              ]
            ]
          ],
          'circle-color': "hsla(352, 0%, 100%, 0)",
          'circle-stroke-opacity': 1,
          'circle-stroke-color': '#d0c4f3',
          'circle-stroke-width': [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.5,
            4,
            4,
            6,
            15,
            22,
            20
          ],
          'circle-blur': 1
        }
      });

      map.addLayer({
        'id': 'historyPointHurricanes',
        'type': 'circle',
        'source': 'historyPointHurricanes',
        'paint': {
          'circle-radius': [
            "interpolate",
            ["linear"],
            ["zoom"],
            2,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.34.NE"
                ],
                [
                  "get",
                  "WindRadius.34.NW"
                ],
                [
                  "get",
                  "WindRadius.34.SE"
                ],
                [
                  "get",
                  "WindRadius.34.SW"
                ]
              ],
              40
            ],
            4,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.34.NE"
                ],
                [
                  "get",
                  "WindRadius.34.NW"
                ],
                [
                  "get",
                  "WindRadius.34.SE"
                ],
                [
                  "get",
                  "WindRadius.34.SW"
                ]
              ],
              15
            ],
            22,
            [
              "max",
              [
                "get",
                "WindRadius.34.NE"
              ],
              [
                "get",
                "WindRadius.34.NW"
              ],
              [
                "get",
                "WindRadius.34.SE"
              ],
              [
                "get",
                "WindRadius.34.SW"
              ]
            ]
          ],
          'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            "#980027"
            ,
            [
              "interpolate",
              ["linear"],
              ["get", "WindSpeed.Kph"],
              55,
              "hsl(47, 100%, 90%)",
              120,
              "hsl(340, 100%, 82%)",
              220,
              "#ff0040"
            ]
          ],
          'circle-stroke-opacity': 0
        }
      });

      map.addLayer({
        'id': 'historyPointHurricanes_txt',
        'type': 'symbol',
        'source': 'historyPointHurricanes',
        "filter": [">=", "SaffirSimpsonCategory", 1],
        "layout": {
          "text-field": ["to-string", ["get", "SaffirSimpsonCategory"]],
          "text-font": ["DIN Offc Pro Black", "Arial Unicode MS Regular"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            4,
            14,
            22,
            46
          ]
        },
        'paint': {
          "text-color": "#fff",
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3.99,
            0,
            4,
            1
          ]
        }
      });

      // Create a popup, but don't add it to the map yet.
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      const onMouseEnter = (sourceName, e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const {properties} = e.features[0];
        const {stormName} = properties;

        const WindSpeedKph = properties['WindSpeed.Kph'];
        const WindSpeedMph = properties['WindSpeed.Mph'];

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        if (e.features.length > 0) {
          if (hoveredStateId) {
            map.setFeatureState({source: sourceName, id: hoveredStateId}, {hover: false});
            hoveredStateId = null;
          }
          hoveredStateId = e.features[0].id;
          map.setFeatureState({source: sourceName, id: hoveredStateId}, {hover: true});
        }

        const year = properties['TimeGMT.year'];
        const mon = properties['TimeGMT.mon'];
        const mday = properties['TimeGMT.mday'];
        const hour = properties['TimeGMT.hour'] || 0;
        const category = sourceName === 'historyPointHurricanes' ?
          properties['Category'] : null;
        const offset = new Date().getTimezoneOffset() / 60;
        const date = new Date(+year, +mon - 1, +mday, (+hour - offset));

        const popupElement = (
          `<div>
              <div>Name: ${stormName}</div>
              <div>${category ? `Category: ${category}` : ''}</div>
              <div>WindSpeed: ${WindSpeedKph} Kph / ${WindSpeedMph} Mph</div>
              <div><b>Time: ${date.toLocaleString()}</b></div>
          </div>`
        );

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
          .setHTML(popupElement)
          .addTo(map);
      }
    ;

          const onMouseLeave = (sourceName) => {
            map.getCanvas().style.cursor = '';
            popup.remove();

            if (hoveredStateId) {
              map.setFeatureState({source: sourceName, id: hoveredStateId}, { hover: false});
            }
            hoveredStateId = null;
          };

          map.on('mouseenter', 'forecastPointHurricanesHover', (e) => {
            onMouseEnter('forecastPointHurricanes', e);
          });

          map.on('mouseenter', 'historyPointHurricanes', (e) => {
            onMouseEnter('historyPointHurricanes', e);
          });

          map.on('mouseleave', 'forecastPointHurricanesHover', () => {
            onMouseLeave('forecastPointHurricanes')
          });

          map.on('mouseleave', 'historyPointHurricanes', () => {
            onMouseLeave('historyPointHurricanes')
          });
        })
    });
