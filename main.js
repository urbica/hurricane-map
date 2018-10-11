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

// Parsing
const parsingSources = (data) => {
  const sources = {
    currentHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
    trajectoriesHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
    forecastPolygonHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
    forecastLineHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
    forecastPointHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
    historyPointHurricanes: {
      "type": "FeatureCollection",
      "features": []
    },
  };

  return data.currenthurricane.reduce((acc, hurricane) => {
    // currentHurricanes
    acc.currentHurricanes['features'].push({
      type: 'Feature',
      properties: flattenObject(hurricane.Current),
      geometry: {
        "type": "Point",
        coordinates: [hurricane.Current.lon, hurricane.Current.lat]
      }
    });

    // trajectoriesHurricanes
    acc.trajectoriesHurricanes['features'].push({
      type: 'Feature',
      properties: hurricane.stormInfo,
      geometry: {
        "type": "LineString",
        coordinates: hurricane.track.map(item => [item.lon, item.lat])
      }
    });

    // forecastHurricanes
    acc.forecastLineHurricanes['features'].push({
      type: 'Feature',
      properties: hurricane.stormInfo,
      geometry: {
        "type": "LineString",
        coordinates: [[hurricane.Current.lon, hurricane.Current.lat]]
          .concat(hurricane.forecast.map(item => [item.lon, item.lat]))
          .concat(hurricane.ExtendedForecast.map(item => [item.lon, item.lat]))
      }
    });

    const circlePoints = [hurricane.Current]
      .concat(hurricane.forecast)
      .concat(hurricane.ExtendedForecast)
      .map(item => {
        acc.forecastPointHurricanes['features'].push({
          type: 'Feature',
          properties: {
            ...hurricane.stormInfo,
            ...flattenObject(item),
          },
          geometry: {
            "type": "Point",
            coordinates: [item.lon, item.lat]
          }
        });

        return [item.lon, item.lat]
      });

    const errorArr = hurricane.forecast
      .concat(hurricane.ExtendedForecast)
      .map(item => +item.ErrorRadius);
    const errorValues = interpolateArray([0.1].concat(errorArr), 200);

    const circles = interpolateLineRange(circlePoints, 200)
      .map((point, i) => turf.circle(point, errorValues[i] * 200, {steps: 30, units: 'kilometers'}));

    const polygon = turf.union(...circles);
    const options = {tolerance: 0.05, highQuality: true};
    const feature = turf.simplify(polygon, options);

    // const feature = polygonSmooth(polygon1, {iterations: 3});

    // console.log(feature);

    acc.forecastPolygonHurricanes['features'].push({
      type: 'Feature',
      properties: {
        ...hurricane.stormInfo
      },
      geometry: {
        "type": "Polygon",
        coordinates: feature.geometry.coordinates
      }
    });

    hurricane.track.forEach(item => {
      acc.historyPointHurricanes['features'].push({
        type: 'Feature',
        properties: {
          ...hurricane.stormInfo,
          ...flattenObject(item),
        },
        geometry: {
          "type": "Point",
          coordinates: [item.lon, item.lat]
        }
      })
    });

    return acc;
  }, sources);
};

// utils
const flattenObject = (ob) => {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

const interpolateArray = (data, fitCount) => {
  const linearInterpolate = function (before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  const newData = new Array();
  const springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0]; // for new allocation
  for ( var i = 1; i < fitCount - 1; i++) {
    const tmp = i * springFactor;
    const before = new Number(Math.floor(tmp)).toFixed();
    const after = new Number(Math.ceil(tmp)).toFixed();
    const atPoint = tmp - before;
    newData[i] = linearInterpolate(data[before], data[after], atPoint);
  }
  newData[fitCount - 1] = data[data.length - 1]; // for new allocation
  return newData;
};

/**
 * @param {Point} pt1
 * @param {Point} pt1
 * @return number The Euclidean distance between `pt1` and `pt2`.
 */
function distance( pt1, pt2 ){
  var deltaX = pt1[0] - pt2[0];
  var deltaY = pt1[1] - pt2[1];
  return Math.sqrt( deltaX * deltaX + deltaY * deltaY );
}

/**
 * @param {Point} point The Point object to offset.
 * @param {number} dx The delta-x of the line segment from which `point` will
 *    be offset.
 * @param {number} dy The delta-y of the line segment from which `point` will
 *    be offset.
 * @param {number} distRatio The quotient of the distance to offset `point`
 *    by and the distance of the line segment from which it is being offset.
 */
function offsetPoint( point, dx, dy, distRatio ){
  return [
    point[ 0 ] - dy * distRatio,
    point[ 1 ] + dx * distRatio
  ];
}

/**
 * @param {array of Point} ctrlPoints The vertices of the (multi-segment) line
 *      to be interpolate along.
 * @param {int} number The number of points to interpolate along the line; this
 *      includes the endpoints, and has an effective minimum value of 2 (if a
 *      smaller number is given, then the endpoints will still be returned).
 * @param {number} [offsetDist] An optional perpendicular distance to offset
 *      each point from the line-segment it would otherwise lie on.
 * @param {int} [minGap] An optional minimum gap to maintain between subsequent
 *      interpolated points; if the projected gap between subsequent points for
 *      a set of `number` points is lower than this value, `number` will be
 *      decreased to a suitable value.
 */
function interpolateLineRange( ctrlPoints, number, offsetDist, minGap ){
  minGap = minGap || 0;
  offsetDist = offsetDist || 0;

  // Calculate path distance from each control point (vertex) to the beginning
  // of the line, and also the ratio of `offsetDist` to the length of every
  // line segment, for use in computing offsets.
  var totalDist = 0;
  var ctrlPtDists = [ 0 ];
  var ptOffsetRatios = [];
  for( var pt = 1; pt < ctrlPoints.length; pt++ ){
    var dist = distance( ctrlPoints[ pt ], ctrlPoints[ pt - 1 ] );
    totalDist += dist;
    ptOffsetRatios.push( offsetDist / dist );
    ctrlPtDists.push( totalDist );
  }

  if( totalDist / (number - 1) < minGap ){
    number = totalDist / minGap + 1;
  }

  // Variables used to control interpolation.
  var step = totalDist / (number - 1);
  var interpPoints = [ offsetPoint(
    ctrlPoints[ 0 ],
    ctrlPoints[ 1 ][ 0 ] - ctrlPoints[ 0 ][ 0 ],
    ctrlPoints[ 1 ][ 1 ] - ctrlPoints[ 0 ][ 1 ],
    ptOffsetRatios[ 0 ]
  )];
  var prevCtrlPtInd = 0;
  var currDist = 0;
  var currPoint = ctrlPoints[ 0 ];
  var nextDist = step;

  for( pt = 0; pt < number - 2; pt++ ){
    // Find the segment in which the next interpolated point lies.
    while( nextDist > ctrlPtDists[ prevCtrlPtInd + 1 ] ){
      prevCtrlPtInd++;
      currDist = ctrlPtDists[ prevCtrlPtInd ];
      currPoint = ctrlPoints[ prevCtrlPtInd ];
    }

    // Interpolate the coordinates of the next point along the current segment.
    var remainingDist = nextDist - currDist;
    var ctrlPtsDeltaX = ctrlPoints[ prevCtrlPtInd + 1 ][ 0 ] -
      ctrlPoints[ prevCtrlPtInd ][ 0 ];
    var ctrlPtsDeltaY = ctrlPoints[ prevCtrlPtInd + 1 ][ 1 ] -
      ctrlPoints[ prevCtrlPtInd ][ 1 ];
    var ctrlPtsDist = ctrlPtDists[ prevCtrlPtInd + 1 ] -
      ctrlPtDists[ prevCtrlPtInd ];
    var distRatio = remainingDist / ctrlPtsDist;

    currPoint = [
      currPoint[ 0 ] + ctrlPtsDeltaX * distRatio,
      currPoint[ 1 ] + ctrlPtsDeltaY * distRatio
    ];

    // Offset currPoint according to `offsetDist`.
    var offsetRatio = offsetDist / ctrlPtsDist;
    interpPoints.push( offsetPoint(
      currPoint, ctrlPtsDeltaX, ctrlPtsDeltaY, ptOffsetRatios[ prevCtrlPtInd ])
    );

    currDist = nextDist;
    nextDist += step;
  }

  interpPoints.push( offsetPoint(
    ctrlPoints[ ctrlPoints.length - 1 ],
    ctrlPoints[ ctrlPoints.length - 1 ][ 0 ] -
    ctrlPoints[ ctrlPoints.length - 2 ][ 0 ],
    ctrlPoints[ ctrlPoints.length - 1 ][ 1 ] -
    ctrlPoints[ ctrlPoints.length - 2 ][ 1 ],
    ptOffsetRatios[ ptOffsetRatios.length - 1 ]
  ));
  return interpPoints;
}