// Init map
mapboxgl.accessToken = 'pk.eyJ1IjoidGF5YWNoaWxsIiwiYSI6ImNpbGtxeHdnNzAwNzRvMGtxcWV4bXlmenQifQ.ymQiP_8v2syh79ZH9HU4Eg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tayachill/cjn4rvudk085g2smerfhmsbp3',
  center: [-23.458504,33.315297],
  zoom: 2
});

map.on('load', () => {
  fetch('https://api.wunderground.com/api/63bd21da7558e560/currenthurricane/view.json')
    .then(response => response.json())
    .then(data => {
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
          'circle-color': '#4042ff',
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 1,
        }
      });

      map.addLayer({
        'id': 'historyPointHurricanes_bg',
        'type': 'circle',
        'source': 'historyPointHurricanes',
        'paint': {
          'circle-radius':[
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
          ] ,
          'circle-color': "hsla(352, 0%, 100%, 0)",
          'circle-stroke-opacity': 1,
          'circle-stroke-color': '#d0c4f3',
          'circle-stroke-width':[
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
          'circle-radius':[
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
          ] ,
          'circle-color': [
            "interpolate",
            ["linear"],
            ["get", "WindSpeed.Kph"],
            55,
            "hsl(47, 100%, 90%)",
            120,
            "hsl(340, 100%, 82%)",
            220,
            "#ff0040"
          ],
          'circle-stroke-opacity': 0,
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
        'paint':{
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

      // map.addLayer({
      //   'id': 'currentHurricanes',
      //   'type': 'circle',
      //   'source': 'currentHurricanes',
      //   'paint': {
      //     'circle-radius': [
      //       "interpolate",
      //       ["linear"],
      //       ["zoom"],
      //       0,
      //       1,
      //       4,
      //       5,
      //       22,
      //       10
      //     ],
      //     'circle-color': 'red',
      //     'circle-stroke-color': '#FFF',
      //     'circle-stroke-width': 1,
      //     'circle-stroke-opacity': 0,
      //   }
      // });


    })
});
