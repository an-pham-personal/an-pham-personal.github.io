var margin = { top: 20, right: 20, bottom: 20, left: 20 },
  padding = { top: 60, right: 60, bottom: 60, left: 60 },
  outerWidth = 1000,
  outerHeight = 700,
  innerWidth = outerWidth - margin.left - margin.right,
  innerHeight = outerHeight - margin.top - margin.bottom,
  width = innerWidth - padding.left - padding.right,
  height = innerHeight - padding.top - padding.bottom;

var svg = d3
  .select("svg")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

// enter code to create color scale
// var colorScale = d3.scaleQuantile().range(d3.schemeBlues[4]);

var path = d3.geoPath();

// d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
d3.json("states-albers-10m.json", function (error, us) {
  if (error) throw error;

  svg
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append("path")
    .attr("name", function (d) {
      return d.properties.name;
    })
    .attr("d", path);

  svg
    .append("path")
    .attr("class", "state-borders")
    .attr(
      "d",
      path(
        topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        })
      )
    );
});

const criteria = {
  category: "Categories",
  short_description: "Short Description",
  hospital_type: "Hospital Type",
  hospital_ownership: "Hospital Ownership",
  hospital_rating: "Hospital Rating",
  beds: "Beds",
  emergency_services: "Emergency Services",
};

// d3.csv("final_table_sample_v2.csv", function (error, masterData) {
//   if (error) throw error;

//   let processed = processData(masterData);
//   console.log(processed);
// });

// processData = (data) => {
//   console.log(data);
//   let processed = {};

//   criteria.forEach((c) => {
//     processed[c] = new Set();
//   });

//   data.forEach((e) => {
//     criteria.forEach((c) => {
//       processed[c].add(e[c]);
//     });
//   });

//   if ("beds" in processed) {
//     processed["beds"] = Array.from(processed["beds"]).map((e) =>
//       parseInt(e, 10)
//     );
//   }

//   return processed;
// };
