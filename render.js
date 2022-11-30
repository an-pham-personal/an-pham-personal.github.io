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
// ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]
// orange ['#feedde', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04']
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
    .attr("stroke", "#c6dbef")
    .attr("fill", "#eff3ff")
    .attr("d", path);
});

const renderMap = (cols, result) => {
  const states = new Set();
  const prices = [];
  const lookup = {};

  result.forEach((r) => {
    const name = stateAbbr[r[cols.indexOf("state")]];
    const price = r[cols.indexOf("price")];
    states.add(name);
    prices.push(price);
    lookup[name] = r;
  });

  if (result.length == 1 || states.length == 1) {
    $("#map").addClass("d-none");
    return;
  }

  $("#map").removeClass("d-none");

  const colorScale = d3
    .scaleThreshold()
    .domain(prices)
    .range(["#6baed6", "#4292c6", "#2171b5", "#084594"]);

  d3.selectAll("path")
    .attr("fill", (d) => {
      const name = d.properties.name;
      if (states.has(name)) {
        return colorScale(lookup[name][cols.indexOf("price")]);
      }
      return "#eff3ff";
    })
    .on("mouseover", (d) => {
      const name = d.properties.name;
      if (states.has(name)) {
        const h = lookup[name];
        const v = extractResult(cols, h);

        $("#tooltip-wrapper").empty();
        $("#tooltip-wrapper").hide();
        $("#tooltip-wrapper").append(rowHTML(v));
        const [x, y] = [d3.event.pageX, d3.event.pageY];
        $("#tooltip-wrapper").css({
          top: `${y - 100}px`,
          left: `${x - 250}px`,
        });
        $("#tooltip-wrapper").mouseleave(function () {
          $(this).hide();
        });
        $("#tooltip-wrapper").show();
      }
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
