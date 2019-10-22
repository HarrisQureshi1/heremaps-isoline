import { $, $$, to24HourFormat, formatRangeLabel, toDateInputFormat } from './helpers.js';
import { center, hereCredentials } from './config.js';
import { isolineMaxRange, requestIsolineShape } from './here.js';


//Height calculations
const height = $('#content-group-1').clientHeight || $('#content-group-1').offsetHeight;
$('.content').style.height = height + 'px';



// Initialize HERE Map
const platform = new H.service.Platform({ apikey: hereCredentials.apikey });
const defaultLayers = platform.createDefaultLayers();
const map = new H.Map(document.getElementById('map'),       defaultLayers.vector.normal.map, {
   center,
   zoom: 12,
   pixelRatio: window.devicePixelRatio || 1
});
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
const provider = map.getBaseLayer().getProvider();

//Initialize router and geocoder
const router = platform.getRoutingService();
const geocoder = platform.getGeocodingService();

window.addEventListener('resize', () => map.getViewPort().resize());

export { router, geocoder }




/* ...
 * DRAGGABLE MARKER
 * ...
 */

let polygon;
const marker = new H.map.Marker(center, {volatility: true});
marker.draggable = true;
map.addObject(marker);

// Add event listeners for marker movement
map.addEventListener('dragstart', evt => {
   if (evt.target instanceof H.map.Marker) behavior.disable();
}, false);
map.addEventListener('dragend', evt => {
   if (evt.target instanceof H.map.Marker) {
      behavior.enable();
      calculateIsoline(); 
   }
}, false);
map.addEventListener('drag', evt => {
   const pointer = evt.currentPointer;
   if (evt.target instanceof H.map.Marker) {
      evt.target.setGeometry(map.screenToGeo(pointer.viewportX, pointer.viewportY));
   }
}, false);


// API CALL TO CALCULATE ISOLINE
async function calculateIsoline() {
   console.log('updating...')
   
   async function calculateIsoline() {

      //Configure the options object
      const options = {
         mode: $('#car').checked ? 'car' : $('#pedestrian').checked ? 'pedestrian' : 'truck',
         range: $('#range').value,
         rangeType: $('#distance').checked ? 'distance' : 'time',
         center: marker.getGeometry(),
         date: $('#date-value').value === '' ? toDateInputFormat(new Date()) : $('#date-value').value,
         time: to24HourFormat($('#hour-slider').value)
      }

      //Limit max ranges
      if (options.rangeType === 'distance') {
         if (options.range > isolineMaxRange.distance) {
            options.range = isolineMaxRange.distance
         }
         $('#range').max = isolineMaxRange.distance;
      } else if (options.rangeType == 'time') {
         if (options.range > isolineMaxRange.time) {
            options.range = isolineMaxRange.time
         }
         $('#range').max = isolineMaxRange.time;
      }

      //Format label
      $('#slider-val').innerText = formatRangeLabel(options.range, options.rangeType);

      //Center map to isoline
      map.setCenter(options.center, true);
   
   
      /* initialize an empty LineString to hold our isoline response data.
      add the isoline response data to the linestring.
      create a polygon object from the isoline response (and remove the existing polygon).
      add the polygon to the map. */
      const linestring = new H.geo.LineString();
   
      const isolineShape = await requestIsolineShape(options);
      isolineShape.forEach(p => linestring.pushLatLngAlt.apply(linestring, p));
   
      if (polygon !== undefined) {
         map.removeObject(polygon);
      }
   
      polygon = new H.map.Polygon(linestring, {
         style: {
            fillColor: 'rgba(74, 134, 255, 0.3)',
            strokeColor: '#4A86FF',
            lineWidth: 2
         }
      });
      map.addObject(polygon);
   }
   
   calculateIsoline();
   
}

