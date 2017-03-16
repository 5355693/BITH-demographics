//Call up the image collection for the 
//MOD13Q1.006 Vegetation Indices 16-Day Global 250m. 
//I chose this index because it has good temporal coverage
//and small-scale resolution.
var mod13q1 = ee.ImageCollection('MODIS/006/MOD13Q1')
.filterDate('2015-12-01','2016-03-31');

var ndvi = mod13q1.select(['NDVI']);//select the band we want
var median = ndvi.median();

var BITHwinter = ee.FeatureCollection('ft:1UwanB0CJVvOx8j-ebrM8B3g5KVAfGOzSjyxt5-ub');
var countries = ee.FeatureCollection('ft:1tdSwUL7MVpOauSgRzqVTOwdfy17KDbw-1d9omPw');
var hispaniola = countries.filter(ee.Filter.or(ee.Filter.eq('Country', 'Dominican Republic'),
ee.Filter.eq('Country','Haiti'))).geometry();
var BITHhispaniola = BITHwinter.filterBounds(hispaniola);
var medianclip = median.clip(BITHhispaniola);

var ndvi_image = median.reduceRegion({
  reducer: ee.Reducer.median(),
  geometry: BITHhispaniola,
  maxPixels: 5e9,
  scale: 250
});
print(ndvi_image.get('NDVI'));

Map.setCenter(-70,19,6);
Map.addLayer(medianclip,
{bands: ["NDVI"],min: -1363, max: 9069, palette: ['FFFFFF','CC9966','CC9900', 
'996600', '33CC00', '009900','006600','000000']}, 'NDVI');

