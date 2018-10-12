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
          'fill-color': '#5c6cd6',
          'fill-opacity': 0.6,
        }
      });

      map.addLayer({
        'id': 'forecastOutlinePolygonHurricanes',
        'type': 'line',
        'source': 'forecastPolygonHurricanes',
        'paint': {
          'line-color': '#5265e0',
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
          'circle-color': '#FE8181',
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 1,
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
            0,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.64.NE"
                ],
                [
                  "get",
                  "WindRadius.64.NW"
                ],
                [
                  "get",
                  "WindRadius.64.SE"
                ],
                [
                  "get",
                  "WindRadius.64.SW"
                ]
              ],
              30
            ],
            3,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.64.NE"
                ],
                [
                  "get",
                  "WindRadius.64.NW"
                ],
                [
                  "get",
                  "WindRadius.64.SE"
                ],
                [
                  "get",
                  "WindRadius.64.SW"
                ]
              ],
              6
            ],
            5,
            [
              "/",
              [
                "max",
                [
                  "get",
                  "WindRadius.64.NE"
                ],
                [
                  "get",
                  "WindRadius.64.NW"
                ],
                [
                  "get",
                  "WindRadius.64.SE"
                ],
                [
                  "get",
                  "WindRadius.64.SW"
                ]
              ],
              3
            ],
            22,
            [
              "max",
              [
                "get",
                "WindRadius.64.NE"
              ],
              [
                "get",
                "WindRadius.64.NW"
              ],
              [
                "get",
                "WindRadius.64.SE"
              ],
              [
                "get",
                "WindRadius.64.SW"
              ]
            ]
          ],
          'circle-color': '#fe8191',
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0,
        }
      });

      map.addLayer({
        'id': 'currentHurricanes',
        'type': 'circle',
        'source': 'currentHurricanes',
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
          'circle-color': 'red',
          'circle-stroke-color': '#FFF',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0,
        }
      });


    })
});
