/**
 * kmeans.js
 * Visualizes the k-Means clustering algorithm. 
 *
 *
 * @author: Hugo Janssen
 * @date:   6/22/2015
 */
"use strict";

function kMeans(elt, w, h, numPoints, numClusters, maxIter, goButton, outputBox) {

    // the current iteration
    var iter = 1,
        centroids = [],
        points = [];
        
    var margin = {top: 30, right: 20, bottom: 20, left: 30},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var colors = d3.scale.category20().range();
    
    var svg = d3.select(elt).append("svg")
        .style("width", width )
        .style("height", height)
        .attr("id", function(d) {return d});
        // .style("width", width + margin.left + margin.right)
        // .style("height", height + margin.top + margin.bottom);
        
    var group = svg.append("g")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .append("text")
        .attr("class", "label")
        // .attr("transform", "translate(" + (width - margin.left - margin.right) + 
        //     "," + (height + margin.top + margin.bottom) + ")")
        .text("");
    /**
     * Computes the euclidian distance between two points.
     */
    function getEuclidianDistance(a, b) {
        var dx = b.x - a.x,
            dy = b.y - a.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    
    /**
     * Returns a point with the specified type and fill color and with random 
     * x,y-coordinates.
     */
    function getRandomPoint(type, fill, i, currMovie, currGenre) {
        // Centroids (GENRE TYPE)
        if(type == "centroid"){
            return { 
                x: Math.round(Math.random() * width), 
                y: Math.round(Math.random() * height),
                type: type,
                fill: fill,
                genre: currGenre
            };
        }
        // Points (MOVIE DATA)
        else{
            return{
                x: Math.round(Math.random() * width), 
                y: Math.round(Math.random() * height),
                type: type,
                fill: fill,
                genre: currMovie.Genre,
                rating: currMovie.IMDB_Rating,
                Stars: [currMovie.Star1, currMovie.Star2, currMovie.Star3, currMovie.Star4],
                Title: currMovie.Series_Title
            }
        }
    }

    /** 
     * Generates a specified number of random points of the specified type.
     */
    function initializePoints(num, type, movieData, uniqueGenreArray) {
        var result = [];
        for (var i = 0; i < num; i++) {
            var color = colors[i];
            if (type !== "centroid") {
                color = "#ccc";
            }
            var point = getRandomPoint(type, color, i, movieData[i], uniqueGenreArray[i]);
            point.id = point.type + "-" + i;
            result.push(point);
        }
        return result;
    }

    /**
     * Find the centroid that is closest to the specified point.
     */
    function findClosestCentroid(point) {
        var closest = {i: -1, distance: width * 2};
        centroids.forEach(function(d, i) {
            var distance = getEuclidianDistance(d, point);
            // Only update when the centroid is closer
            if (distance < closest.distance) {
                closest.i = i;
                closest.distance = distance;
            }
        });
        return (centroids[closest.i]); 
    }
    
    /**
     * All points assume the color of the closest centroid.
     */
    function colorizePoints() {
        points.forEach(function(d) {
            var closest = findClosestCentroid(d);
            d.fill = closest.fill;
        });
    }

    /**
     * Computes the center of the cluster by taking the mean of the x and y 
     * coordinates.
     */
    function computeClusterCenter(cluster) {
        return [
            d3.mean(cluster, function(d) { return d.x; }), 
            d3.mean(cluster, function(d) { return d.y; })
        ];
    }
    
    /**
     * Moves the centroids to the center of their cluster.
     */
    function moveCentroids() {
        centroids.forEach(function(d) {
            // Get clusters based on their fill color
            var cluster = points.filter(function(e) {
                return e.fill === d.fill;
            });
            // Compute the cluster centers
            var center = computeClusterCenter(cluster);
            // Move the centroid
            d.x = center[0];
            d.y = center[1];
        });
    }

    /**
     * Updates the chart.
     */
    function update() {
    
        let output = document.getElementById(outputBox);
        var data = points.concat(centroids);
        
        // The data join
        var circle = group.selectAll("circle")
            .data(data);
    
        // Create new elements as needed
        circle.enter().append("circle")
            .attr("id", function(d) { return d.id; })
            .attr("class", function(d) { return d.type; })
            .attr("r", 8)
            .on("click", (d) => {
                console.log(d.Title, d.Stars);
                output.value = "Title: " + d.Title + "\nStars: " + d.Stars;
            }); //Console Log Curr Point/Centroid onClick
            
        // Update old elements as needed
        circle.transition().delay(100).duration(1000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .style("fill", function(d) { return d.fill; });
        
        // Remove old nodes
        circle.exit().remove();
    }

    /**
     * Updates the text in the label.
     */
    function setText(text) {
        svg.selectAll(".label").text(text);
    }
    
    /**
     * Executes one iteration of the algorithm:
     * - Fill the points with the color of the closest centroid (this makes it 
     *   part of its cluster)
     * - Move the centroids to the center of their cluster.
     */
    function iterate() {
        
        // Update label
        setText("Iteration " + iter + " of " + maxIter);

        // Colorize the points
        colorizePoints();
        
        // Move the centroids
        moveCentroids();
        
        // Update the chart
        update();
    }


    // Generate Lines from pointsArr
    function generateLines(pairsArr){
        const svg = d3.select("svg");
        console.log("SVG",svg);

        let linesArr = [];
        for(var i = 0; i < pairsArr.length; i++){
            // X Y Coordinats
            let x1 = pairsArr[i][0].x; let y1 = pairsArr[i][0].y;
            let x2 = pairsArr[i][1].x; let y2 = pairsArr[i][1].y;

            // Add Lines to LineArr
            var source = {
                x: x1,
                y: y1
            };
            var target = {
                x: x2,
                y: y2
            }
            var lineObj = {
                source: source,
                target: target,
                index: i
            }

            linesArr.push(lineObj);

            // Draw Lines
            svg.append('line')
            .style("stroke", "navy")
            .style("stroke-width", 0.5)
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2);
        }
        return linesArr;
    }
    function commonActor(a,b){
        for(let i = 0; i < a.length; i++){
            for(let j = 0; j < b.length; j++){
                if(a[i] == b[j]){
                    return true;
                }
            }
        }
        return false;
    }
    function moviePointPairs(points){
        let pairArr = [];
        for(let i = 0; i < points.length; i++){
            let currActors = points[i].Stars;
            for(let j = i+1; j < points.length; j++){
                let compareActors = points[j].Stars;
                if(commonActor(currActors, compareActors)){
                    let pair = [];
                    pair.push(points[i]);
                    pair.push(points[j]);
                    pairArr.push(pair);
                }
            }
        }
        return pairArr;
    }

    /** 
     * The main function initializes the algorithm and calls an iteration every 
     * two seconds.
     */
    function initialize(movieData, uniqueGenreArray) {
        // Initialize random points and centroids
        centroids = initializePoints(numClusters, "centroid", movieData, uniqueGenreArray);
        points = initializePoints(document.getElementById(numPoints).value, "point", movieData, uniqueGenreArray);

        console.log("Centroids:", centroids);
        console.log("Points:", points);

        let pairs = moviePointPairs(points);
        console.log("Pairs:", pairs);
        
        // initial drawing
        update();
        let linesArr = generateLines(pairs);
        console.log("LinesArr", linesArr);
        
        
        var interval = setInterval(function() {
            if(iter < maxIter + 1) {
                iterate();
                iter++;
            } else {
                clearInterval(interval);
                setText("Done");
            }
        }, 2 * 1000);
    }

    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    // Read CSV file of Movie DataBase
    d3.csv("./imdb_top_1000.csv", data => {
        let movieData = [];
        let genreArray = [];
        for(let i = 0; i < data.length; i++){
            movieData.push(data[i]);
            let currGenre = data[i].Genre.split(", ");
            for(let j = 0; j < currGenre.length; j++){
                genreArray.push(currGenre[j]);
            }

        }
        let uniqueGenreArray = genreArray.filter(onlyUnique);

        console.log("MovieData", movieData);
        console.log("UniqueGenreArray", uniqueGenreArray);

        // Graph Movie Data
        let go = document.getElementById(goButton); //Run
        let num = document.getElementById(numPoints); //NumPoints
        go.innerHTML = num.value;

        // On Input Change ==> update points value
        num.addEventListener("click", () => {
            go.innerHTML = num.value;
        })

        // On GO => Graph
        go.addEventListener("click", () => {
            initialize(movieData, uniqueGenreArray);
        })
    });

}