/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// DATA
// Place of Origin
let myTotalNum;
let myBrush;
let myMap;
let sunburst;
let myIncome;

let selectedTimeRange = [];

d3.csv("data/Census-Fields-of-Study-by-Place-of-Origin (1) - Sheet1.csv", (row) => {
    row.BusinessandMgmt = +row.BusinessandMgmt
    row.Education = +row.Education
    row.Engineering = +row.Engineering
    row.FineandAppliedArts = +row.FineandAppliedArts
    row.HealthProfessions = +row.HealthProfessions
    row.Humanities = +row.Humanities
    row.IntensiveEnglish = +row.IntensiveEnglish
    row.MathandComputerScience = +row.MathandComputerScience
    row.OtherFieldsofStudy = +row.OtherFieldsofStudy
    row.PhysicalandLifeSciences = +row.PhysicalandLifeSciences
    row.SocialSciences = +row.SocialSciences
    row.TOTAL = +row.TOTAL
    row.Undeclared = +row.Undeclared
    return row
}).then( (data) => {
    sunburst = new Sunburst("sunburst", data)
    console.log(data)
})

// load data using promises
let promises = [
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), // World shape
    d3.csv("data/geoOrigin.csv"), // Place of Origin Data
    d3.csv("data/income.csv") // Income Data
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


function initMainPage(dataArray) {
    console.log(dataArray);

    // get all features from the data
    let featureList = Object.keys(dataArray[1][0]);

    // get all years from the features
    let yearList = [];
    for (feature of featureList) {
        if (!['Country', 'Region', 'latitude', 'longitude'].includes(feature)) {
            yearList.push(+feature);
        }
    }
    console.log(yearList);

    // get the total number for each year
    let yearSum = [];

    for (year of yearList) {
        let total = 0;
        dataArray[1].forEach(d => {
                if (d[year] != '-') {
                    d[year] = +d[year];
                    total += d[year];
                }
        })
        // yearSum[year] = total;
        yearSum.push({
            year: d3.timeParse("%Y")(year),
            total: total
        });
    }

    console.log(yearSum);
    // Initialize line chart
    myTotalNum = new TotalNum('TotalNumber', yearSum);
    myBrush = new Brush('Brush', yearSum);

    // map data
    let mapData = [];
    dataArray[1].forEach(d => {
        let country = {};
        let eachYear = [];
        if (d['latitude'] != '') {
            for (year of yearList) {
                if (d[year] != '-') {
                    eachYear.push(d[year]);
                }
                else {
                    eachYear.push(0);
                }

                country = {
                    country: d['Country'],
                    region: d["Region"],
                    latitude: +d['latitude'],
                    longitude: +d['longitude'],
                    yearList: yearList,
                    yearEach: eachYear
                }
            }
        mapData.push(country)
        }

    })
    console.log(mapData);

    // Initialize Map
    myMap = new mapVis('Map', dataArray[0], mapData);

    // Initialize Income Map
    myIncome = new mapIncome('MapIncome', dataArray[0], dataArray[2])

}

let selectedCategory = $('#categorySelector').val();

function categoryChange() {
    selectedCategory = $('#categorySelector').val();
    myMap.wrangleData();
}




