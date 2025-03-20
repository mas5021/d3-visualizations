const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 30, bottom: 50, left: 60 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// GitHub Gist dataset URL (use your own if different)
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/026c349c96a9cdc0c9542ff31643432a119b2bbd/world_population.csv";

d3.csv(areaDatasetUrl).then(data => {
  console.log("Area Chart Data Loaded:", data);

  // Convert data types
  data.forEach(d => {
    d.Year = +d.Year.trim(); // ensure we have a number
    d.Population = +d.Population;
  });

  // X scale: linear scale of years
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // Y scale: population
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Population)])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // Area generator
  const area = d3.area()
    .x(d => x(d.Year))
    .y0(areaHeight - areaMargin.top - areaMargin.bottom)
    .y1(d => y(d.Population));

  // Clear old elements if any
  areaSvg.selectAll("*").remove();

  // Append the area path
  areaSvg.append("path")
    .datum(data)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("d", area);

  // X axis
  areaSvg.append("g")
    .attr("transform", `translate(0,${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // 'd' -> year format

  // Y axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));
});
