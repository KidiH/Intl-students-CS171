class Sunburst {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        //this.displayData = displayData;
        this.data = displayData
        this.formatNumber = d3.format(",d");
        this.b = {
            w: 150, h: 30, s: 3, t: 10
        };

        this.initVis();
    }


    /*
     *  Initialize sunburst
     */
    initVis () {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        ////////////EDITED///////////

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right ;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom + 150;


        // vis.width = 960
        // vis.height = 700
        vis.radius = (Math.min(vis.width, vis.height) / 2) - 10;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("id", "container")
            .attr("transform", "translate(" + (vis.width / 2) + "," + (vis.height / 2) + ")");

        vis.x = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        vis.y = d3.scaleSqrt()
            .range([0, vis.radius]);

        vis.colorScale = ["#67001f",
            "#b2182b",
            "#d6604d",
            "#f4a582",
            "#fddbc7",
            "#f7f7f7",
            "#d1e5f0",
            "#92c5de",
            "#4393c3",
            "#2166ac",
            "#053061"]

        // vis.color = d3.scaleQuantize()
        //         .range(vis.colorScale)
        // vis.displayData.children.length + 1
        vis.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRdBu, 43))
        // .interpolateInferno(t)
        // console.log(vis.color("World"), vis.color("Eng"))

        vis.circle = vis.svg.append("svg:circle")
            .attr("r", vis.radius)
            .style("opacity", 0);

        vis.partition = d3.partition();

        vis.arc = d3.arc()
            .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, vis.x(d.x0))); })
            .endAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, vis.x(d.x1))); })
            .innerRadius(function(d) {return Math.max(0, vis.y(d.y0)); })
            .outerRadius(function(d) {return Math.max(0, vis.y(d.y1)); });

        // Add the svg for breadcrumbs area.
        vis.trail = d3.select("#sequence").append("svg:svg")
            .attr("width", vis.width)
            .attr("height", 50)
            .attr("id", "trail");

        // Add the label at the end, for the percentage.
        vis.trail.append("svg:text")
            .attr("id", "endlabel")
            .style("fill", "#000");

        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;

        vis.result = {"name": "World",
            "children": [
                {"name": "Asia", "children": []},
                {"name": "Africa", "children": []},
                {"name":"North America", "children": []},
                {"name":"South America", "children": []},
                {"name":"Europe", "children": []}
            ],
            TOTAL: 400};

        vis.content = function(data, j){
            let dataPoint = {
                name: data[j].name,
                children: [
                    {name: "Humanities", children: [
                            {name: "Education", size: data[j].Education * data[j].TOTAL * 0.01},
                            {name: "Humanities", size: data[j].Humanities * data[j].TOTAL * 0.01},
                            {name: "English", size: data[j].IntensiveEnglish * data[j].TOTAL * 0.01}

                        ]},
                    {name: "STEM", children: [
                            {name: "Business",  size: data[j].BusinessandMgmt * data[j].TOTAL * 0.01},
                            {name:"Engineering", size: data[j].Engineering * data[j].TOTAL * 0.01},
                            {name: "Arts", size: data[j].FineandAppliedArts * data[j].TOTAL * 0.01},
                            {name: "Health", size: data[j].HealthProfessions * data[j].TOTAL * 0.01},
                            {name: "Math and CS", size: data[j].MathandComputerScience * data[j].TOTAL * 0.01},
                            {name: "Other", size: data[j].OtherFieldsofStudy * data[j].TOTAL * 0.01},
                            {name: "Physical Science", size: data[j].PhysicalandLifeSciences * data[j].TOTAL * 0.01},
                            {name: "Social Science", size: data[j].SocialSciences * data[j].TOTAL * 0.01},
                            // {name: "Total", size: data[j].TOTAL}

                        ]

                    },
                    {name: "Other", size: data[j].OtherFieldsofStudy * data[j].TOTAL * 0.01},
                    {name: "Undeclared", size: data[j].Undeclared * data[j].TOTAL * 0.01}
                ]
            }
            return dataPoint;

        }

        for(let j = 0; j < vis.data.length; j++){

            if(vis.data[j].Continent === "Asia"){
                let content = vis.content(vis.data, j)
                vis.result["children"][0]["children"].push(content);
            }

            else if(vis.data[j].Continent === "Africa"){
                let content = vis.content(vis.data, j)
                vis.result["children"][1]["children"].push(content);
            }
            else if(vis.data[j].Continent === "North America"){
                let content = vis.content(vis.data, j)
                vis.result["children"][2]["children"].push(content);
            }
            else if(vis.data[j].Continent === "South America"){
                let content = vis.content(vis.data, j)
                vis.result["children"][3]["children"].push(content);
            }
            else{
                let content = vis.content(vis.data, j)
                vis.result["children"][4]["children"].push(content);
            }
        }
        console.log(vis.result)
        vis.displayData = vis.result
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.root = d3.hierarchy(vis.displayData);

        vis.root.sum(function(d){
            if(d.TOTAL || d.TOTAL === 0){
                return d.TOTAL
            }
            else if(d.size || d.size === 0)
            {
                return d.size;
            }
            else{
                return d.children.TOTAL
            }
        });

        d3.select("#percentage")
            .text("World")
            .attr()
        d3.select("#content").text(Math.round(vis.partition(vis.root).descendants()[0].value).toLocaleString() + " International students")

        d3.select("#explanation")
            .style("visibility", "");

        vis.color2 = function(d) {

            let colors;

            if (!d.parent) {

                colors = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain(d3.range(0,10));

                d.color = "#fff";

            } else if (d.children) {


                var startColor = d3.hcl(d.color)
                        .darker(),
                    endColor   = d3.hcl(d.color)
                        .brighter();

                // Create the scale
                colors = d3.scaleLinear()
                    .interpolate(d3.interpolateHcl)
                    .range([
                        startColor.toString(),
                        endColor.toString()
                    ])
                    .domain([0,d.children.length+1]);
            }

            if (d.children) {
                d.children.map(function(child, i) {
                    return {value: child.value, idx: i};
                }).sort(function(a,b) {
                    return b.value - a.value
                }).forEach(function(child, i) {
                    d.children[child.idx].color = colors(i);
                });
            }

            return d.color;
        };

        // Generate a string that describes the points of a breadcrumb polygon.
        vis.breadcrumbPoints = function (d, i) {
            let points = [];
            points.push("0,0");
            points.push(vis.b.w + ",0");
            points.push(vis.b.w + vis.b.t + "," + (vis.b.h / 2));
            points.push(vis.b.w + "," + vis.b.h);
            points.push("0," + vis.b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(vis.b.t + "," + (vis.b.h / 2));
            }
            return points.join(" ");
        }

// Update the breadcrumb trail to show the current sequence and percentage.
        vis.updateBreadcrumbs = function (nodeArray, percentageString) {
            console.log(nodeArray)

            // Data join; key function combines name and depth (= position in sequence).
            //console.log(nodeArray)
            // Remove exiting nodes.
            console.log(d3.select("#trail").selectAll("g"))
            let g = d3.select("#trail")
                .selectAll("g")
                .data(nodeArray, function(d) {
                    console.log(d.data.name + d.depth)
                    return d.data.name + d.depth; })
                .attr("fill", function(d) {console.log(d)});

            // Add breadcrumb and label for entering nodes.
            let entering = g.enter().append("svg:g");
            //g.enter().append("svg:g");

            entering.append("svg:polygon")
                .attr("points", vis.breadcrumbPoints)
                .style("fill", function(d) { return "#4393c3"; });

            entering.append("svg:text")
                .attr("x", (vis.b.w + vis.b.t) / 2)
                .attr("y", vis.b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.data.name; });

            // Set position for entering and updating nodes.
            entering.attr("transform", function(d, i) {
                console.log(i,d)
                return "translate(" + i * (vis.b.w + vis.b.s) + ", 0)";
            });

            // Remove exiting nodes.
            g.exit().remove();

            // Now move and update the percentage at the end.
            d3.select("#trail").select("#endlabel")
                .attr("x", (nodeArray.length + 0.5) * (vis.b.w + vis.b.s))
                .attr("y",vis.b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(percentageString);

            // Make the breadcrumb trail visible, if it's hidden.
            d3.select("#trail")
                .style("visibility", "");

        }

        vis.click = function(event,d){
            vis.svg.transition()
                .duration(750)
                .tween("scale", function() {
                    var xd = d3.interpolate(vis.x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(vis.y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(vis.y.range(), [d.y0 ? 20 : 0, vis.radius]);
                    return function(t) { vis.x.domain(xd(t)); vis.y.domain(yd(t)).range(yr(t)); };
                })
                .selectAll("path")
                .attrTween("d", function(d) { return function() { return vis.arc(d); }; });
        }

        vis.getAncestors = function(node){
            var path = [];
            var current = node;
            while (current.parent) {
                path.unshift(current);
                current = current.parent;
            }
            return path;
        }

        vis.mouseover = function (event, d) {

            d3.select("#content").exit().remove()

            let currentParent = d

            if(d.depth > 2){
                for(let i = 0; i < d.depth - 2; i++){
                    currentParent = currentParent.parent
                }
            }

            console.log(currentParent.data.name)
            let percentage
            if (d.depth !== 0){
                percentage = Math.round((d.value/d.parent.value)* 100)
            }
            // console.log(percentage, d, d.value, d.parent.value)
            if(d.depth === 4){
                d3.select("#percentage")
                    .text(percentage + "% ")
                document.getElementById("content").innerHTML = "of students from " + (currentParent.data.name).bold() + " study " + (d.data.name).bold()
            }
            else if(d.depth === 3){
                d3.select("#percentage")
                    .text(percentage + "%")
                document.getElementById("content").innerHTML = "of students from " + (currentParent.data.name).bold() + " major in " + (d.data.name).bold()
            }
            else if (d.depth === 2 || d.depth === 1){
                let parentName = "from " + d.parent.data.name
                if(d.depth === 1){
                    parentName = " "
                }
                d3.select("#percentage")
                    .text(+ percentage + "%")
                document.getElementById("content").innerHTML = "of intl. students " +
                    (parentName).bold() + " orginate from " + (d.data.name).bold()

            }
            else{
                d3.select("#percentage")
                    .text(d.data.name)
                d3.select("#content").text(Math.round(d.value).toLocaleString() + " International students")
            }

            // console.log(d3.selectAll(".circle").node().getBBox())
            d3.select("#explanation")
                .style("visibility", "")
            //  .attr("transform", "translate(" + vis.radius + (vis.width/2) + "," + (vis.radius) + (vis.height/2) + ")");


            vis.sequenceArray = vis.getAncestors(d);
            vis.updateBreadcrumbs(vis.sequenceArray, percentage);
            console.log(vis.sequenceArray)

            // Fade all the segments.
            d3.selectAll("#paths")
                .style("opacity", 0.3);

            // Then highlight only those that are an ancestor of the current segment.
            vis.svg.selectAll("#paths")
                .filter(function(node) {
                    return (vis.sequenceArray.indexOf(node) >= 0);
                })
                .style("opacity", 1);

        }

        vis.mouseout = function(d){

            // Hide the breadcrumb trail
            d3.select("#trail")
                .style("visibility", "hidden");

            // Deactivate all segments during transition.
            d3.selectAll("#paths").on("mouseover", null);

            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll("#paths")
                .transition()
                .duration(800)
                .style("opacity", 1)
                .each(function() {
                    d3.select(this).on("mouseover", vis.mouseover);
                });


            d3.select("#explanation")
                .style("visibility", "hidden");
        }

        vis.path = vis.svg.selectAll("path")
            .data(vis.partition(vis.root).descendants())
            .enter()
            .append("path")
            // .attr("display", function(d) { return d.depth ? null : "none"; })
            .attr("d", vis.arc)
            .attr("class", d => d.data.name)
            .attr("id","paths")
            .style("fill", function (d) {

                return (vis.color2(d))
                //return vis.color((((d.children ? d : d.parent).data.name)));
            })
            .on("click", vis.click)
            .on("mouseover", vis.mouseover)
        //.on("mouseout", vis.mouseout)
        d3.select("#container").on("mouseleave", vis.mouseout);

        vis.path.append("title")
            .text(function (d) {
                return d.data.name + "\n" + vis.formatNumber(d.value);
            })

        d3.select(self.frameElement).style("height", vis.height + "px");


        $(document).ready(function(){
            $(".data").hover(function(){
                $(this).css("background-color", "yellow");
                d3.select(".China").attr("fill", "green")
            }, function(){
                $(this).css("background-color", "blue");
            });
        });

    }

}
