const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left}, ${areaMargin.top})`);

// Replace with your raw GitHub Gist link or local file path
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

// Years to visualize
const years = [
  "1970 Population",
  "1980 Population",
  "1990 Population",
  "2000 Population",
  "2010 Population",
  "2015 Population",
  "2020 Population",
  "2022 Population"
];

d3.csv(areaDatasetUrl).then(rawData => {
  // 1) Identify unique continents
  const continents = Array.from(new Set(rawData.map(d => d.Continent.trim())));

  // 2) Create a structure like:
  // finalData = [
  //   { Year: 1970, Africa: X, Asia: Y, Europe: Z, ... },
  //   { Year: 1980, Africa: X, Asia: Y, Europe: Z, ... },
  //   ...
  // ]
  const yearMap = {};
  years.forEach(y => {
    const yearKey = y.replace(" Population", "");
    yearMap[yearKey] = {};
    continents.forEach(cont => {
      yearMap[yearKey][cont] = 0;
    });
  });

  rawData.forEach(d => {
    const c = d.Continent.trim();
    years.forEach(y => {
      const yearKey = y.replace(" Population", "");
      const val = +d[y];
      if (!isNaN(val)) {
        yearMap[yearKey][c] += val;
      }
    });
  });

  const finalData = [];
  Object.keys(yearMap).forEach(yearStr => {
    const rowObj = { Year: +yearStr };
    continents.forEach(cont => {
      rowObj[cont] = yearMap[yearStr][cont];
    });
    finalData.push(rowObj);
  });
  // Sort by Year
  finalData.sort((a, b) => a.Year - b.Year);

  // 3) X scale: force from 1970 to 2022
  const x = d3.scaleLinear()
    .domain([1970, 2022])  // Start at 1970, end at 2022 exactly
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // 4) Y scale: start at 0
  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(finalData, d => d3.sum(continents, c => d[c]))
    ])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // 5) Stack data by continent
  const stack = d3.stack().keys(continents);
  const stackedData = stack(finalData);

  // 6) Area generator
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // 7) Use a more appealing color palette
  const color = d3.scaleOrdinal()
    .domain(continents)
    .range(d3.schemeTableau10);

  // 8) Shared tooltip
  const tooltip = d3.select("#tooltip");

  // Clear old elements
  areaSvg.selectAll("*").remove();

  // Draw stacked areas
  areaSvg.selectAll(".layer")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .attr("opacity", 0.8)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("d", area)
    // Hover interactions
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>Continent:</strong> ${d.key}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X Axis
  areaSvg.append("g")
    .attr("transform", `translate(0, ${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // e.g. 1970, 1980, etc.

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // 9) Legend in the top-right corner
  const legendX = areaWidth - areaMargin.right - 150;
  const legendY = 0;

  const legend = areaSvg.selectAll(".legend")
    .data(continents)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${legendX}, ${legendY + i * 20})`);

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
