//Set the GFC image to be used:
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015');

/*
Get the Bicknell's Thrush distribution model. To get this model,
I 1) downloaded the shapefile from https://doi.org/10.6084/m9.figshare.4126782.v1,
2) opened it in QGIS, 3) saved the shapefile as a KML, and
4) imported the KML into a Google Fusion Table. The i.d. string
comes from the Fusion Table properties: File > About this Table.
*/
var BITHhaiti = ee.FeatureCollection('ft:1v75op5jJ93R9tjIpGGx8Y5qWY73jDwX9Ii8Oqpeu');
var treeCover = gfcImage.select(['treecover2000']);
var BITHtreeshaiti = treeCover.clip(BITHhaiti);
var lossImage = gfcImage.select(['loss']);
var arealossImage = lossImage.multiply(ee.Image.pixelArea());
var BITHlosshaiti = lossImage.clip(BITHhaiti);
var gainImage = gfcImage.select(['gain']);
var areagainImage = gainImage.multiply(ee.Image.pixelArea());
var BITHgainhaiti = gainImage.clip(BITHhaiti);

// Use the and() method to create the lossAndGain image.
var gainAndLoss = BITHlosshaiti.and(BITHgainhaiti);

// Add the tree cover layer in green.
Map.setCenter(-71.143, 18.797,8);
Map.addLayer(BITHtreeshaiti.updateMask(BITHtreeshaiti),
             {min: [1], max: [100], palette: '000000, 00FF00'}, 'Forest Cover');

// Add the loss layer in red.
Map.addLayer(BITHlosshaiti.updateMask(BITHlosshaiti), {palette: 'FF0000'}, 'Loss');

// Add the gain layer in blue.
Map.addLayer(BITHgainhaiti.updateMask(BITHgainhaiti), {palette: '0000FF'}, 'Gain');

// Show the loss and gain image.
Map.addLayer(gainAndLoss.updateMask(gainAndLoss), {palette: 'FF00FF'},'Gain and Loss');

//For calculating loss, we need to consider the original forest cover on each pixel.
//If forest cover was only 70%, for example, than the area of loss if that pixel
//is deforested = pixel area * 0.70.
var forest2000 = gfcImage.select('treecover2000').divide(100); // Forest cover in 2000 as a fraction
var areaImage2000 = forest2000.multiply(ee.Image.pixelArea()); // Area of cover per pixel.
var lossMask = lossImage.multiply(forest2000); // Take the loss image (above) * area per pixel.
var maskLossArea = lossMask.multiply(ee.Image.pixelArea());

// Calculate the summed area of loss pixels in Haiti winter range, assuming that 
// each pixel lost had 100% forest cover in 2000.
var statsloss = arealossImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhaiti,
  maxPixels: 5e9
});
print('area lost, pessimistic: ', statsloss.get('loss'), 'square meters');
print(statsloss.get('loss'));

// Calculate the summed area of loss pixels in Haiti winter range, assuming that
// each pixel lost only the amount of forest cover it had in 2000.
var statslossOpt =maskLossArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhaiti,
  maxPixels: 5e9
});
print('area lost, optimistic: ', statslossOpt.get('loss'), 'square meters');
print(statslossOpt.get('loss'));

var statsgain = areagainImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhaiti,
  maxPixels: 5e9
});
print('area gained: ', statsgain.get('gain'), 'square meters');
print(statsgain.get('gain'));

//Calculate total area of BITH habitat on Haiti.
var union = BITHhaiti.union();
var first = ee.Feature(union.first());
var area = first.area();
print('Area of BITH habitat, Haiti: ',area);

//Calculate the area of forested land within the habitat model
var area = areaImage2000.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhaiti,
  maxPixels: 5e9
});
print('area of forest: ', area.get('treecover2000'), 'square meters');
print(area.get('treecover2000'));
