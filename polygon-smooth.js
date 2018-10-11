// Smoth
function polygonSmooth(inputPolys, options) {
  var outPolys = [];
  // Optional parameters
  var iterations = options.iterations || 1;
  if (!inputPolys) throw new Error('inputPolys is required');

  turf.geomEach(inputPolys, function (geom, geomIndex, properties) {
    var outCoords;
    var poly;
    var tempOutput;

    switch (geom.type) {
      case 'Polygon':
        outCoords = [[]];
        for (var i = 0; i < iterations; i++) {
          tempOutput = [[]];
          poly = geom;
          if (i > 0) poly = turf.polygon(outCoords).geometry;
          processPolygon(poly, tempOutput);
          outCoords = tempOutput.slice(0);
        }
        outPolys.push(turf.polygon(outCoords, properties));
        break;
      case 'MultiPolygon':
        outCoords = [[[]]];
        for (var y = 0; y < iterations; y++) {
          tempOutput = [[[]]];
          poly = geom;
          if (y > 0) poly = multiPolygon(outCoords).geometry;
          processMultiPolygon(poly, tempOutput);
          outCoords = tempOutput.slice(0);
        }
        outPolys.push(multiPolygon(outCoords, properties));
        break;
      default:
        throw new Error('geometry is invalid, must be Polygon or MultiPolygon');
    }
  });
  return turf.featureCollection(outPolys);
}

function processPolygon(poly, tempOutput) {
  var prevGeomIndex = 0;
  var subtractCoordIndex = 0;

  turf.coordEach(poly, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
    if (geometryIndex > prevGeomIndex) {
      prevGeomIndex = geometryIndex;
      subtractCoordIndex = coordIndex;
      tempOutput.push([]);
    }
    var realCoordIndex = coordIndex - subtractCoordIndex;
    var p1 = poly.coordinates[geometryIndex][realCoordIndex + 1];
    var p0x = currentCoord[0];
    var p0y = currentCoord[1];
    var p1x = p1[0];
    var p1y = p1[1];
    tempOutput[geometryIndex].push([0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y]);
    tempOutput[geometryIndex].push([0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y]);
  }, true);
  tempOutput.forEach(function (ring) {
    ring.push(ring[0]);
  });

  function processMultiPolygon(poly, tempOutput) {
    var prevGeomIndex = 0;
    var subtractCoordIndex = 0;
    var prevMultiIndex = 0;

    turf.coordEach(poly, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
      if (multiFeatureIndex > prevMultiIndex) {
        prevMultiIndex = multiFeatureIndex;
        subtractCoordIndex = coordIndex;
        tempOutput.push([[]]);
      }
      if (geometryIndex > prevGeomIndex) {
        prevGeomIndex = geometryIndex;
        subtractCoordIndex = coordIndex;
        tempOutput[multiFeatureIndex].push([]);
      }
      var realCoordIndex = coordIndex - subtractCoordIndex;
      var p1 = poly.coordinates[multiFeatureIndex][geometryIndex][realCoordIndex + 1];
      var p0x = currentCoord[0];
      var p0y = currentCoord[1];
      var p1x = p1[0];
      var p1y = p1[1];
      tempOutput[multiFeatureIndex][geometryIndex].push([0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y]);
      tempOutput[multiFeatureIndex][geometryIndex].push([0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y]);
    }, true);

    tempOutput.forEach(function (poly) {
      poly.forEach(function (ring) {
        ring.push(ring[0]);
      });
    });
  }
}