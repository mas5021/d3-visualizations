const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Replace with your actual Gist raw link
const datasetUrl = "https://gist.githubusercontent.com/YOUR_USERNAME/raw/YOUR_GIST_ID/world_population_extended.csv";

d3.csv(datasetUrl).then(data => {
  console.log("Area Chart Data Loaded:", data);

  // Convert data types
  data.forEach(d => {
    d.Year = +d.Year.trim(); // Ensure Year is a number
    d.Population = +d.Population;
  });

  // Group data by Year
  const nestedData = d3.groups(data, d => d.Year)
    .map(([year, values]) => {
      let entry = { Year: year };
      values.forEach(d => entry[d.Region] = d.Population);
      return entry;
    });

  // Extract unique regions
  const keys = Object.keys(nestedData[0]).filter(d => d !== "Year");

  // X scale: years
  const x = d3.scaleLinear()
    .domain(d3.extent(nestedData, d => d.Year)) // [2000, 2030]
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // Y scale: sum of all regions
  const y = d3.scaleLinear()
    .domain([0, d3.max(nestedData, d => d3.sum(keys, key => d[key]))])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // Stack data by region
  const stack = d3.stack().keys(keys);
  const stackedData = stack(nestedData);

  // Define Area Generator
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Define Color Scale
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);

  // Clear previous elements
  areaSvg.selectAll("*").remove();

  // Append stacked areas
  areaSvg.selectAll(".area")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "area")
    .attr("fill", d => color(d.key))
    .attr("opacity", 0.8)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("d", area);

  // X Axis
  areaSvg.append("g")
    .attr("transform", `translate(0, ${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format as integer years

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // Add Legend
  const legend = areaSvg.selectAll(".legend")
    .data(keys)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${areaWidth - 200}, ${i * 20})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 14)
    .style("font-size", "14px")
    .text(d => d);
});
