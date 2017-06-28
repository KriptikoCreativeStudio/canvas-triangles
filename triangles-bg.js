function TrianglesBg() {
    var canvas_el = document.getElementById("canvas"),
        context = canvas_el.getContext("2d");

    var canvas = {
        w: 0,
        h: 0,
        cols: 0,
        rows: 0,
        cell_width: 0,
        cell_height: 0,
        cell_padding: {
            vert: 0,
            horiz: 0
        },
        mouse: {
            x: null,
            y: null
        }
    };

    var points_arr = [],
        raf = 0;

    var opts = {
        colors: {
            // fill: ['#ffffff', '#fdfdfd', '#fbfbfb', '#f9f9f9', '#f7f7f7', '#f5f5f5', '#f3f3f4', '#f1f1f1'],
            fill: ['#464646', '#444444', '#424242', '#404040', '#3e3e3e', '#3c3c3c', '#3a3a3c'],
            stroke: '#111111',
            highlight: '#f30061'
        },
        cols: 4,
        rows: 3,
        cell_padding: 50,   // in percentage,
        min_velocity: 2,    // in pixels
        max_velocity: 3,    // in pixels,
        proximity: 200,     // in pixxels
        fps: 60,
        transition: {
            duration: 2500
        },
        opacity: {
            min: .6,
            max: .6
        }
    };

    /**
     * Sets the canvas
     */
    function setCanvas() {
        canvas.w = canvas_el.parentNode.clientWidth;
        canvas.h = canvas_el.parentNode.clientHeight;

        canvas.cols = Math.ceil(opts.cols + (opts.cols / canvas.w * 100));
        canvas.rows = Math.ceil(opts.rows + (opts.rows / canvas.h * 100));

        if (canvas.cols % 2 != 0) {
            canvas.cols++;
        }
        if (canvas.rows % 2 != 0) {
            canvas.rows++;
        }

        canvas.cell_width = canvas.w / canvas.cols;
        canvas.cell_height = canvas.h / canvas.rows;

        canvas.cell_padding = {
            vert: canvas.cell_height * opts.cell_padding / 100,
            horiz: canvas.cell_width * opts.cell_padding / 100
        }

        canvas_el.width = canvas.w;
        canvas_el.height = canvas.h;

        createPoints();

        cancelRequestAnimFrame(raf);
        raf = requestAnimFrame(randMove);
    }

    /**
     * Keep track of mouse coordinates
     */
    function recMouseCoords(event) {
        canvas.mouse = {
            x: event.pageX - canvas_el.offsetLeft,
            y: event.pageY - canvas_el.offsetTop
        }
    }

    /**
     * Reset mouse coordinates
     */
    function resetMouseCoords() {
        canvas.mouse = {
            x: null,
            y: null
        }
    }

    /**
     * Generate a random float within an interval
     * @param  {float} min
     * @param  {float} max
     * @return {float} random_number
     */
    function randFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate a random int within an interval
     * @param  {int} min
     * @param  {int} max
     * @return {int} random_number
     */
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Get a random color from colors array
     * @param {array} colors
     * @return {string} color
     */
    function randomColor(colors) {
        var color = colors[randInt(0, colors.length - 1)];
        return color;
    }

    /**
     * Calculates the next index of colors array
     */
    function nextColorIndex(index){
        var next_index = index + 1;

        if(next_index >= opts.colors.fill.length){
            next_index = 0;
        }

        return next_index;
    }


    /**
     * Generates the data for a point
     */
    function generatePointData(c, r) {
        var color_index = randInt(0, opts.colors.fill.length - 1),
            alpha = parseFloat(randFloat(opts.opacity.min, opts.opacity.max).toFixed(3));

        var data = {
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            orig_coords: generateCoords(c, r),
            dest_coords: generateCoords(c, r),
            fill_color: opts.colors.fill[color_index],
            stroke_color: opts.colors.stroke,
            line_width: randInt(1, 3),
            alpha: {
                original: alpha,
                current: alpha
            }
        }

        return data;
    }

    /**
     * Generates x and y coordinates
     */
    function generateCoords(c, r) {
        var min_x = c * canvas.cell_width,
            max_x = (c + 1) * canvas.cell_width,
            min_y = r * canvas.cell_height,
            max_y = (r + 1) * canvas.cell_height,
            x, y;

        if (c > 0 && c < canvas.cols && r > 0 && r < canvas.rows) {
            x = randInt(min_x - canvas.cell_width + canvas.cell_padding.horiz, max_x - canvas.cell_padding.horiz);
            y = randInt(min_y - canvas.cell_height + canvas.cell_padding.vert, max_y - canvas.cell_padding.vert);
        } else if (c == 0 && r > 0 && r < canvas.rows) {
            x = min_x;
            y = randInt(min_y - canvas.cell_height + canvas.cell_padding.vert, max_y - canvas.cell_padding.vert);
        } else if (r == 0 && c > 0 && c < canvas.cols) {
            x = randInt(min_x - canvas.cell_width + canvas.cell_padding.horiz, max_x - canvas.cell_padding.horiz);
            y = min_y;
        } else {
            x = min_x;
            y = min_y;
        }

        return {
            x: x,
            y: y
        };
    }

    /**
     * Generates random points throughout the grid
     */
    function createPoints() {
        var color_set_index, color_set, color_index, max_index = 7;

        for (var c = 0; c <= canvas.cols; c++) {
            points_arr[c] = [];

            for (var r = 0; r <= canvas.rows; r++) {
                points_arr[c][r] = generatePointData(c, r);
            }
        }
    }

    /**
     * Connects the points
     */
    function draw() {
        // clear canvas
        context.clearRect(0, 0, canvas.w, canvas.h);

        var point,
            points = [];

        for (var c = 1; c < canvas.cols; c = c + 2) {
            for (var r = 1; r < canvas.rows; r = r + 2) {
                point = points_arr[c][r],
                points = [];

                points.push(points_arr[c - 1][r - 1]); // tlPoint
                points.push(points_arr[c][r - 1]); // tPoint
                points.push(points_arr[c + 1][r - 1]); // trPoint
                points.push(points_arr[c + 1][r]); // rPoint
                points.push(points_arr[c + 1][r + 1]); // brPoint
                points.push(points_arr[c][r + 1]); // bPoint
                points.push(points_arr[c - 1][r + 1]); // blPoint
                points.push(points_arr[c - 1][r]); // lPoint
                points.push(points_arr[c - 1][r - 1]); // tlPoint

                /* make triangles */
                for (var p = 0; p < points.length - 1; p++) {
                    context.beginPath();
                    context.moveTo(point.orig_coords.x, point.orig_coords.y);
                    context.lineTo(points[p].orig_coords.x, points[p].orig_coords.y);
                    context.lineTo(points[p + 1].orig_coords.x, points[p + 1].orig_coords.y);
                    context.fillStyle = points[p].fill_color;
                    context.globalAlpha = point.alpha.current;
                    context.fill();
                    context.lineWidth = .5;
                    context.strokeStyle = points[p].stroke_color;
                    context.stroke()
                    context.closePath();
                }

                points = [];
            }
        }
    }

    function randMove() {
        raf = requestAnimationFrame(randMove);

        var mouse_dist, mouse_total_dist;

        for (var c = 0; c <= canvas.cols; c++) {
            for (var r = 0; r <= canvas.rows; r++) {
                var point = points_arr[c][r],
                    distance_x = point.dest_coords.x - point.orig_coords.x,
                    distance_y = point.dest_coords.y - point.orig_coords.y,
                    elapsed_time, alpha, variation, percentage;

                point.stroke_color = opts.colors.stroke;

                /* calculate distance between point and mouse cursor */
                if(canvas.mouse.x && canvas.mouse.y){
                    mouse_dist = {
                        x: canvas.mouse.x - point.orig_coords.x,
                        y: canvas.mouse.y - point.orig_coords.y
                    };
                    mouse_total_dist = Math.round(Math.sqrt(Math.pow(Math.abs(mouse_dist.x), 2) + Math.pow(Math.abs(mouse_dist.y), 2)));

                    /* change border color */
                    if(mouse_total_dist <= opts.proximity){
                        point.stroke_color = opts.colors.highlight;

                        /* change triangle alpha */
                        elapsed_time = point.updated_at - point.created_at;

                        point.updated_at = new Date().getTime();

                        variation = 1 - point.alpha.original;
                        percentage = variation * (elapsed_time * 2 / opts.transition.duration);

                        alpha = point.alpha.original + percentage;

                        if(alpha > 1){
                            alpha = 1 - (alpha - 1);
                        }

                        point.alpha.current = parseFloat(alpha.toFixed(3));

                        if(elapsed_time >= opts.transition.duration){
                            point.created_at = point.updated_at;
                        }
                    }
                }

                /* update coordinates */
                if (distance_x != 0 || distance_y != 0) {
                    if (distance_x != 0) {
                        point.orig_coords.x += distance_x / Math.abs(distance_x);
                    }
                    if (distance_y != 0) {
                        point.orig_coords.y += distance_y / Math.abs(distance_y);
                    }
                } else {
                    point.dest_coords = generateCoords(c, r);
                }
            }
        }

        draw();
    }

    /**
     * Initializes the application
     */
    function init() {
        window.addEventListener('load', function() {
            setCanvas();
        }, false);
        window.addEventListener('resize', function() {
            setCanvas();
        }, false);
        window.addEventListener('mousemove', function(e) {
            recMouseCoords(e);
        }, false);
        canvas_el.addEventListener('mouseleave', function() {
            resetMouseCoords();
        }, false);
    }

    init();
}


/*-------------------------- Request Animation Frame -------------------------*/

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
})();


/*------------------------------- Canvas class -------------------------------*/

var Canvas = Canvas || {};

/**
 * Draws a square in canvas
 * @param  {int} x
 * @param  {int} y
 * @param  {int} side
 */
Canvas.square = function(context, x, y, side, fill_color) {
    context.beginPath();
    context.rect(x - side / 2, y - side / 2, side, side);
    context.fillStyle = fill_color;
    context.fill();
    context.closePath();
}

/**
 * Draws a circle in canvas
 * @param  {int} x
 * @param  {int} y
 * @param  {int} side
 */
Canvas.circle = function(context, x, y, radius, fill_color) {
    context.beginPath();
    context.arc(x, y, radius / 2, 0, 2 * Math.PI, false);
    context.fillStyle = fill_color;
    context.fill();
    context.closePath();
}
