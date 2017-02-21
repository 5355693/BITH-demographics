//Set the GFC image to be used:
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015');

/*
Get the Bicknell's Thrush distribution model. To get this model,
I 1) downloaded the shapefile from https://doi.org/10.6084/m9.figshare.4126782.v1,
2) opened it in QGIS, 3) saved the shapefile as a KML, and
4) imported the KML into a Google Fusion Table. The i.d. string
comes from the Fusion Table properties: File > About this Table.
*/
var BITHwinter = ee.FeatureCollection('ft:1UwanB0CJVvOx8j-ebrM8B3g5KVAfGOzSjyxt5-ub');

/*
In order to clip the winter distribution model just to Hispaniola, we 
need to have a file that defines the country boundaries for DR and
Haiti. We focus on forest-cover change in these two countries as the support nearly all
of the known wintering population. This table is a public data table that is available
by searching Google Fusion Tables for "world country boundaries".
*/
//Clip the winter habitat model to DR and Haiti:
var countries = ee.FeatureCollection('ft:1tdSwUL7MVpOauSgRzqVTOwdfy17KDbw-1d9omPw');
var hispaniola = countries.filter(ee.Filter.or(ee.Filter.eq('Country', 'Dominican Republic'),
ee.Filter.eq('Country','Haiti'))).geometry();
var BITHhispaniola = BITHwinter.filterBounds(hispaniola);

//Define variables for elements of the GFC data to map:
var treeCover = gfcImage.select(['treecover2000']);
var BITHtreesHisp = treeCover.clip(BITHhispaniola);
var lossMask = gfcImage.select(['loss']);
var lossImage = gfcImage.select(['lossyear']).eq(1);//change this value from 1-15; this is for 2001
var arealossImage = lossImage.multiply(ee.Image.pixelArea());
var BITHlossHisp = lossImage.clip(BITHhispaniola);
var lossImageHisp = lossMask.clip(BITHhispaniola);

// Add the tree cover layer in green.
Map.setCenter(-71.143, 18.797,8);
Map.addLayer(BITHtreesHisp.updateMask(BITHtreesHisp),
             {min: [1], max: [100], palette: '000000, 00FF00'}, 'Forest Cover');

// Add the loss layer in red.
Map.addLayer(BITHlossHisp.updateMask(BITHlossHisp), {palette: 'FF0000'}, 'Loss');


//For calculating loss, we need to consider the original forest cover on each pixel.
//If forest cover was only 70%, for example, than the area of loss if that pixel
//is deforested = pixel area * 0.70.
var forest2000 = gfcImage.select('treecover2000').divide(100); // Forest cover in 2000 as a fraction
var areaImage2000 = forest2000.multiply(ee.Image.pixelArea()); // Area of cover per pixel.
var lossMask = lossImage.multiply(forest2000); // Take the loss image (above) * area per pixel.
var maskLossArea = lossMask.multiply(ee.Image.pixelArea());

// Calculate the summed area of loss pixels in Hispaniola winter range, assuming that 
// each pixel lost had 100% forest cover in 2000.
var statsloss = arealossImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhispaniola,
  maxPixels: 5e9
});
print('area lost, pessimistic: ', statsloss.get('lossyear'), 'square meters');
print(statsloss.get('lossyear'));

// Calculate the summed area of loss pixels in Hispaniola winter range, assuming that
// each pixel lost only the amount of forest cover it had in 2000.
var statslossOpt =maskLossArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: BITHhispaniola,
  maxPixels: 5e9
});
print('area lost, optimistic: ', statslossOpt.get('lossyear'), 'square meters');
print(statslossOpt.get('lossyear'));