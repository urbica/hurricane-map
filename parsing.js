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

  return data.currenthurricane.reduce((acc, hurricane, numberHurricane) => {
    // currentHurricanes
    acc.currentHurricanes['features'].push({
      type: 'Feature',
      id: numberHurricane,
      properties: {
        ...hurricane.stormInfo,
        ...flattenObject(hurricane.Current)
      },
      geometry: {
        "type": "Point",
        coordinates: [hurricane.Current.lon, hurricane.Current.lat]
      }
    });

    // trajectoriesHurricanes
    acc.trajectoriesHurricanes['features'].push({
      type: 'Feature',
      id: numberHurricane,
      properties: hurricane.stormInfo,
      geometry: {
        "type": "LineString",
        coordinates: hurricane.track.map(item => [item.lon, item.lat])
      }
    });

    // forecastHurricanes
    acc.forecastLineHurricanes['features'].push({
      type: 'Feature',
      id: numberHurricane,
      properties: hurricane.stormInfo,
      geometry: {
        "type": "LineString",
        coordinates: [[hurricane.Current.lon, hurricane.Current.lat]]
          .concat(hurricane.forecast.map(item => [item.lon, item.lat]))
          .concat(hurricane.ExtendedForecast.map(item => [item.lon, item.lat]))
      }
    });

    hurricane.forecast
      .concat(hurricane.ExtendedForecast)
      .forEach((item, i) => {
        acc.forecastPointHurricanes['features'].push({
          id: (numberHurricane + 100) * (i + 1),
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

    const { polygons } = [hurricane.Current]
      .concat(hurricane.forecast)
      .concat(hurricane.ExtendedForecast)
      .reduce((acc, item) => {
        const errorRadiusDeg = parseFloat(item['ErrorRadius'] || '0.1');
        const ruler = cheapRuler(item.lat);

        const errorRadius = ruler.distance([item.lon, item.lat], [item.lon + errorRadiusDeg, item.lat]);

        if (!acc.prevPoint) {
          const circle = turf.circle([item.lon, item.lat], errorRadius, {steps: 32, units: 'kilometers'});
          acc.polygons.push(circle);
          acc.prevPoint = {
            errorRadius,
            geom: [item.lon, item.lat]
          };
          return acc;
        }

        const firstPoint = acc.prevPoint.geom;
        const nextPoint = [item.lon, item.lat];

        let bearing = ruler.bearing(firstPoint, nextPoint);
        let p1 = ruler.destination(nextPoint, errorRadius, bearing + 90);
        let p2 = ruler.destination(firstPoint, acc.prevPoint.errorRadius, bearing + 90);
        let p3 = ruler.destination(firstPoint, acc.prevPoint.errorRadius, bearing - 90);
        let p4 = ruler.destination(nextPoint, errorRadius, bearing - 90);

        const polygon = turf.polygon([[p1, p2, p3, p4, p1]]);
        const circle = turf.circle(nextPoint, errorRadius, {steps: 32, units: 'kilometers'});
        acc.prevPoint = {
          errorRadius,
          geom: [item.lon, item.lat]
        };
        acc.polygons.push(polygon);
        acc.polygons.push(circle);
        return acc;
      }, { prevPoint: null, polygons: [] });

    const forecastPolygon = turf.union(...polygons);

    acc.forecastPolygonHurricanes['features'].push({
      type: 'Feature',
      properties: {
        ...hurricane.stormInfo
      },
      geometry: {
        "type": "Polygon",
        coordinates: forecastPolygon.geometry.coordinates
      }
    });

    hurricane.track.forEach((item, i) => {
      acc.historyPointHurricanes['features'].push({
        id: (numberHurricane + 100) * (i + 1),
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
