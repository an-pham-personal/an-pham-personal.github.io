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

var path = d3.geoPath();

// ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594']
// ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5']
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
    .attr("stroke", "#6baed6")
    .attr("fill", "#bdd7e7")
    .attr("d", path);

  // svg
  //   .append("path")
  //   .attr("class", "state-borders")
  //   .attr(
  //     "d",
  //     path(
  //       topojson.mesh(us, us.objects.states, function (a, b) {
  //         return a !== b;
  //       })
  //     )
  //   );
});

const renderMap = (cols, result) => {
  const states = new Set();
  result.forEach((r) => states.add(stateAbbr[r[21]]));

  d3.selectAll("path").attr("fill", (d) => {
    const name = d.properties.name;
    if (states.has(name)) {
      return "#2171b5";
    }
    return "#bdd7e7";
  });
};

const criteria = {
  category: "Categories",
  short_description: "Short Description",
  hospital_type: "Hospital Type",
  hospital_ownership: "Hospital Ownership",
  hospital_rating: "Hospital Rating",
  beds: "Beds",
  emergency_services: "Emergency Services",
};
