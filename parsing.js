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
      .map((point, i) => turf.circle(point, errorValues[i] * 200, {steps: 16, units: 'kilometers'}));

    const polygon = turf.union(...circles);
    // console.log(polygonSmooth(polygon, { iterations: 1 }));
    const options = {tolerance: 0.1, highQuality: false};
    const feature = polygonSmooth(turf.simplify(polygon, options), { iterations: 3 }).features[0];

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
