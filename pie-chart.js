const pieWidth = 600,
      pieHeight = 600,
      // Use an even smaller radius so there's more space below
      pieRadius = Math.min(pieWidth, pieHeight) / 3.0,
      innerRadius = pieRadius * 0.5;

// Shift the donut further upward to leave extra room below for the legend
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2 - 70})`);

// Replace with your CSV link (make sure the URL is correct)
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

d3.csv(pieDatasetUrl).then(data => {
  // 1) Sum 2022 population by Continent
  const continentPop2022 = d3.rollup(
    data,
    v => d3.sum(v, d => +d["2022 Population"]),
    d => d.Continent.trim()
  );

  // Convert rollup map to an array of objects
  const pieDataArray = Array.from(continentPop2022, ([Continent, Population]) => ({
    Continent,
    Population
  }));

  // 2) Create the pie layout
  const pie = d3.pie().value(d => d.Population);
  const arcs = pie(pieDataArray);

  // 3) Define the arc generator for the donut
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(pieRadius);

  // 4) Create a color scale using d3.schemeSet3, then darken the colors
  const color = d3.scaleOrdinal()
    .domain(pieDataArray.map(d => d.Continent))
    .range(d3.schemeSet3);

  // Shared tooltip selection
  const tooltip = d3.select("#tooltip");

  // Clear any existing elements
  pieSvg.selectAll("*").remove();

  // 5) Draw the donut slices, applying a darker color
  pieSvg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => d3.rgb(color(d.data.Continent)).darker(1))
    .attr("stroke", "#fff")
    .style("stroke-width", 2)
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1.05)");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
        <strong>Continent:</strong> ${d.data.Continent}<br/>
        <strong>Population (2022):</strong> ${d.data.Population.toLocaleString()}
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", event => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1)");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // 6) Add slice labels at the centroid of each arc
  pieSvg.selectAll(".arc-label")
    .data(arcs)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate
