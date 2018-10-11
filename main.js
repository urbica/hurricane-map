// Init map
mapboxgl.accessToken = 'pk.eyJ1IjoidGF5YWNoaWxsIiwiYSI6ImNpbGtxeHdnNzAwNzRvMGtxcWV4bXlmenQifQ.ymQiP_8v2syh79ZH9HU4Eg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tayachill/cjn4rvudk085g2smerfhmsbp3',
  zoom: 2
});

map.on('load', () => {
  fetch('http://api.wunderground.com/api/63bd21da7558e560/currenthurricane/view.json')
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

      // add layers
      map.addLayer({
        'id': 'forecastPolygonHurricanes',
        'type': 'fill',
        'source': 'forecastPolygonHurricanes',
        'paint': {
          'fill-color': 'blue',
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        'id': 'trajectoriesHurricanes',
        'type': 'line',
        'source': 'trajectoriesHurricanes',
        'paint': {
          'line-width': 2,
          'line-color': 'green'
        }
      });

      map.addLayer({
        'id': 'forecastLineHurricanes',
        'type': 'line',
        'source': 'forecastLineHurricanes',
        'paint': {
          'line-width': 2,
          'line-color': 'yellow'
        }
      });

      map.addLayer({
        'id': 'forecastPointHurricanes',
        'type': 'circle',
        'source': 'forecastPointHurricanes',
        'paint': {
          'circle-radius': 5,
          'circle-color': 'yellow'
        }
      });

      map.addLayer({
        'id': 'historyPointHurricanes',
        'type': 'circle',
        'source': 'historyPointHurricanes',
        'paint': {
          'circle-radius': 3,
          'circle-color': 'green'
        }
      });

      map.addLayer({
        'id': 'currentHurricanes',
        'type': 'circle',
        'source': 'currentHurricanes',
        'paint': {
          'circle-radius': 5,
          'circle-color': 'red'
        }
      });
    })
});