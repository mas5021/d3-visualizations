// Dimensions for the stacked area chart
const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Replace with your raw GitHub Gist link OR local file path
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

// Years we want to visualize (must match CSV column headers exactly)
const years = ["1970 Population","1980 Population","1990 Population","2000 Population","2010 Population","2015 Population","2020 Population","2022 Population"];

d3.csv(areaDatasetUrl).then(rawData => {
  console.log("✅ Area Chart Data Loaded:", rawData);

  // 1) Group by Continent
  const grouped = d3.groups(rawData, d => d.Continent.trim());
  // 2) For each continent, sum the population for each year
  //    Then we'll build a structure so we can stack by continent across these years.

  // Make an object: { Year: 1970, Africa: sum, Asia: sum, Europe: sum, ... }
  // for each year in years[].
  const yearMap = {}; 
  years.forEach(y => {
    const yearKey = y.replace(" Population", ""); // e.g. "1970"
    yearMap[yearKey] = {}; // Will hold { Africa: sum, Asia: sum, ... }
  });

  // Initialize each continent to 0 for each year
  // e.g. yearMap["1970"] = { "Africa": 0, "Asia": 0, ... }
  const continents = Array.from(new Set(rawData.map(d => d.Continent.trim())));
  years.forEach(y => {
    const yearKey = y.replace(" Population", "");
    continents.forEach(cont => {
      yearMap[yearKey][cont] = 0;
    });
  });

  // Sum population for each continent, each year
  rawData.forEach(d => {
    const c = d.Continent.trim();
    years.forEach(y => {
      const yearKey = y.replace(" Population", ""); // "1970"
      const val = +d[y]; // e.g. d["1970 Population"]
      if (!isNaN(val)) {
        yearMap[yearKey][c] += val;
      }
    });
  });

  // Convert yearMap to an array of objects: [ {Year: 1970, Africa: X, Asia: Y, ...}, {Year: 1980, ...}, ... ]
  const finalData = [];
  Object.keys(yearMap).forEach(yearStr => {
    const rowObj = { Year: +yearStr };
    continents.forEach(cont => {
      rowObj[cont] = yearMap[yearStr][cont];
    });
    finalData.push(rowObj);
  });

  // Sort finalData by year numeric
  finalData.sort((a, b) => a.Year - b.Year);

  console.log("✅ Processed Data for Stacked Area:", finalData);

  // X scale: year
  const x = d3.scaleLinear()
    .domain(d3.extent(finalData, d => d.Year)) // e.g. [1970, 2022]
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // Y scale: sum of all continents in a given year
  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => {
      // sum across all continents
      return d3.sum(continents, c => d[c]);
    })])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // Create a stack generator
  const stack = d3.stack().keys(continents);
  const stackedData = stack(finalData);
  console.log("✅ Stacked Data:", stackedData);

  // Area generator for stacked chart
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Define color scale for continents
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(continents);

  // Create a tooltip
  const tooltip = d3.select("#tooltip");

  // Clear previous elements
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
    .on("mouseover", (event, d) => {
      // highlight area
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
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X Axis
  areaSvg.append("g")
    .attr("transform", `translate(0, ${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // show e.g. 1970, 1980, etc.

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // Legend
  const legend = areaSvg.selectAll(".legend")
    .data(continents)
    .enter()
    .append("g")
    .attr("class", "legend")
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
