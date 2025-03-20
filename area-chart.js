const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Change datasetUrl to a different variable name
const areaDatasetUrl = "https://gist.githubusercontent.com/YOUR_USERNAME/raw/YOUR_GIST_ID/world_population_extended.csv";

d3.csv(areaDatasetUrl).then(data => {
  console.log("✅ Area Chart Data Loaded:", data);

  // Convert data types
  data.forEach(d => {
    d.Year = +d.Year.trim(); // Ensure Year is a number
    d.Population = +d.Population;
  });

  // Group data by Year
  const nestedData = d3.groups(data, d => d.Year)
    .map(([year, values]) => {
      let entry = { Year: +year };
      values.forEach(d => entry[d.Region] = d.Population);
      return entry;
    });

  console.log("✅ Nested Data:", nestedData);
});
