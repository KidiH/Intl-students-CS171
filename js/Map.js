/* * * * * * * * * * * * * *
*     class Map            *
* * * * * * * * * * * * * */

class mapVis {

    constructor(parentElement, geoData, originData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.originData = originData;

        this.yearList = this.originData[0].yearList;

        // parse date method
        this.target = [-98.678503, 39.999733]
        this.parseDate = d3.timeParse("%Y");

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 3, right: 70, bottom: 5, left: 5};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add notes
        vis.svg.append('g')
            .attr('class', 'notes')
            .append('text')
            .text('Hover over the bubbles for more details')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height - 40})`)
            .attr('fill', "grey")
            .attr('text-anchor', 'middle');

        // create a projection
        vis.projection = d3.geoMercator()
            .center([0,20])                // GPS of location to zoom on
            .scale(180)                       // This is like the zoom
            .translate([ vis.width/2, vis.height/2 ]);

        // define a geo generator and pass your projection to it
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Draw the map
        vis.svg.append("g")
                .selectAll("path")
                .data(vis.geoData.features)
                .enter()
                .append("path")
                .attr('class', 'map')
                .attr("fill", "#b8b8b8")
                .attr("d", vis.path)
                .style("stroke", function(d) {
                    if (d.id == "USA") {
                        return "red"
                    }
                    else {
                        return "white"
                    }
                })
                .style("opacity", .5);

        // Add text to U.S.
        vis.svg.append('g')
            .attr('class', 'US')
            .append('text')
            .text('USA')
            .attr('transform', `translate(${vis.width / 4.5}, ${vis.height / 2.6})`)
            .attr('fill', "red")
            .attr('text-anchor', 'middle');

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
                    .attr('class', "tooltip tooltip1")

        // add links
        vis.curve = d3.line().curve(d3.curveNatural);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        function arraySum(total, num ) {
            return total + num
        };

        vis.displayData = [];
        vis.totalAll = [];

        for (let i = 0; i < vis.originData.length; i++) {
            let d = vis.originData[i];
            let numYearly = [];
            for (let j = 0; j < d.yearList.length; j++) {
                if (selectedTimeRange[0] < selectedTimeRange[1] || selectedTimeRange[0] > selectedTimeRange[1])
                {
                    if (vis.parseDate(d.yearList[j]).getTime() >= selectedTimeRange[0].getTime() && vis.parseDate(d.yearList[j]).getTime() <= selectedTimeRange[1].getTime()) {
                        numYearly.push(d.yearEach[j]);
                    }
                }
                else {
                    numYearly.push(d.yearEach[j]);
                }

            }

            vis.totalAll.push(numYearly.reduce(arraySum,0))

            vis.displayData.push({
                country: d['country'],
                region: d["region"],
                latitude: +d['latitude'],
                longitude: +d['longitude'],
                total: numYearly.reduce(arraySum,0)
            });
        }
        console.log(vis.displayData)

       vis.totalAll.sort((a,b) => {
            return a - b
        });

       vis.valuesToShow = [vis.totalAll[parseInt(vis.totalAll.length / 3)], vis.totalAll[parseInt(vis.totalAll.length * 2 / 3)], vis.totalAll[vis.totalAll.length]]



        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Add a scale for bubble size
        let valueExtent = d3.extent(vis.displayData, function(d) { return d.total; })
        let size = d3.scaleSqrt()
            .domain(valueExtent)  // What's in the data
            .range([ 1, 40])  // Size in pixel

        // links
        vis.link = vis.svg.append('path')

        // plane
        vis.plane = vis.svg.append("path")
                        .attr("class", "plane")
                        .style('fill', 'none')
                        .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z");

        function transition(plane, route) {
            let l = route.node().getTotalLength();
            plane.transition()
                .duration(3000)
                .attrTween("transform", delta(route.node()));
        }

        function delta(path) {
            let l = path.getTotalLength();
            vis.plane.style('fill', 'red')
            return function(i) {
                return function(t) {
                    let p = path.getPointAtLength(t * l);
                    let t2 = Math.min(t + 0.05, 1);
                    let p2 = path.getPointAtLength(t2 * l);

                    let x = p2.x - p.x;
                    let y = p2.y - p.y;
                    let r = 90 - Math.atan2(-y, x) * 180 / Math.PI;

                    return "translate(" + p.x + "," + p.y + ") scale(0.7) rotate(" + r + ")";
                }
            }
        }

        // Hover over effect
        let mouseOver = function(event, d) {
            // fade other circles and map and focus on the selected bubble
            d3.selectAll(".circles")
                .style("opacity", .3)
            d3.selectAll(".map")
                .style("opacity", .3)
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black")
            // draw link from source country to the U.S.
            let link = {type: "LineString", coordinates: [[d.longitude, d.latitude], vis.target]};

            vis.link.attr('d', vis.path(link))
                .style("stroke", "darkgrey")
                .style("stroke-width", 2)
                .attr('fill', 'none')
                .transition()
                .duration(2500)
                .ease(d3.easeLinear)
                .attrTween("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return d3.interpolate(`0,${length}`, `${length},${length}`);
                });

            transition(vis.plane, vis.link);

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div>
                         <p> <b>${d.country} :</b> ${d3.format(",")(d.total)}</p>                     
                     </div>`);
        }

        let mouseLeave = function(event, d) {
            d3.selectAll(".circles")
                .style("opacity", .8)
            d3.selectAll(".map")
                .style("opacity", .5)
            d3.select(this)
                .style("stroke", "transparent")
            vis.link.style("stroke", "none")
            vis.plane.style('fill', 'none')
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        }

        // Add circles:
        let circles = vis.svg
            .selectAll("circle")
            .data(vis.displayData);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr('class', 'circles')
            .attr("cx", function(d){ return vis.projection([d.longitude, d.latitude])[0] })
            .attr("cy", function(d){ return vis.projection([d.longitude, d.latitude])[1] })
            .attr('fill', 'steelblue')
            .attr("r", function(d){ return size(+d.total) })
            .attr("stroke", 'grey')
            .attr("stroke-width", .5)
            .attr("fill-opacity", .8)
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave );

        circles.exit().remove();

        vis.findTop();
    }

    findTop() {
        let vis = this;

        vis.displayData.sort(function(a, b){
            return b.total - a.total});

        // Take top 10
        vis.displayData = vis.displayData.slice(0,10);

        document.getElementById("top10").innerHTML = '<b style="font-size: 20px;">Top 10 Countries</b>';

        for (let i = 0; i < vis.displayData.length; i++) {
            document.getElementById("top10").innerHTML +=
                '<br><b>' + vis.displayData[i].country + '</b> (' + d3.format(',')(vis.displayData[i].total) + ')';
        }


    }

}

