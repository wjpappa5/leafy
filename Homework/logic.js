var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Maps
var lightMap = L. tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q");

var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q");

var streetmap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q"
);
var darkmap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHNsaW5kbmVyIiwiYSI6ImNqaWNhdTFzdzFuam4za21sc3ZiMmN5bDEifQ.5Il8Y1QtwyMFWCa1JkDY_Q"
);


function getColor(d) { 
  if (d >= 5) { return "#FF0000" } else
  if (d >= 4) { return "#FF6900" } else
  if (d >= 3) { return "#FFC100" } else
  if (d >= 2) { return "#E5FF00" } else
  if (d >= 1) { return "#8DFF00" } else
  if (d >= 0) { return "#00FF00" };
};


var earthquakes = new L.layerGroup();
var timelineLayer = new L.layerGroup();


var map = L.map("map", {
    center: [
      39.5, -98.35
    ],
    zoom: 3,
    layers: [satMap, earthquakes]
});


d3.json(queryUrl, function(response) {

  var getInterval = function(quake) {
          return {
            start: quake.properties.time,
            end:   quake.properties.time + quake.properties.mag * 1800000
          };
        };

  var timelineControl = L.timelineSliderControl({
    formatOutput: function(date){
      return moment(date).format("YYYY-MM-DD HH:MM:SS");
    }
  });

  // function styleData(feature) {
  //     return {
  //         stroke: true,
  //         color: "black",
  //         weight: .25,
  //         fillOpacity: .7,
  //         fillColor: getColor(feature.properties.mag),
  //         radius: feature.properties.mag * 4
  //     };
  //   }

  var timeline = L.timeline(response, {

    getInterval: getInterval,

    pointToLayer: function(feature, latlng) {
        return L.circle(latlng, {
          stroke: true,
          color: "black",
          weight: .25,
          fillOpacity: .7,
          fillColor: getColor(feature.properties.mag),
          radius: feature.properties.mag * 60000
        }
      )
    },
    // style: styleData,
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
    "</h3>" + new Date(feature.properties.time));
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);

        timelineControl.addTo(map);
        timelineControl.addTimelines(timeline);
        timeline.addTo(timelineLayer);
        timelineLayer.addTo(map);

})

// Legend

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

  var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
};

legend.addTo(map);



var faults = new L.layerGroup();

faultsURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(faultsURL, function(response) {
  function faultStyle(feature) {
    return {
      weight: 2,
      color: "orange"
    };
  }

  L.geoJSON(response, {
    style: faultStyle
  }).addTo(faults);
  faults.addTo(map)
})



var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault lines": faults
};
var baseMaps = {
    "Light map": lightMap,
    "Dark map": darkmap,
    "Street map": streetmap,
    "Satellite": satMap    
};

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);