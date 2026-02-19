var shapeData = {
	triangle: {
		offset: 0,
		count: 5
	},
	square: {
		offset: 5,
		count: 6
	}
};
var vertexBuffer = null;

var gl;

// shader uniform locations
var uMousePos = -1;
var uColor = -1;
var uSideCount = -1;

var canvasSize = [800, 800];
var mousePos = [0, 0];
var shapeColor = [0, 0.5, 0, 1]; // Default green color
var sideCount = 3;

/**
 * Initialize WebGL
 */
function init() {
	var canvas = document.getElementById("canvas");
	setCanvasSize(canvasSize);

	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canvas.getContext("experimental-webgl");
	}
	gl.clearColor(0.4, 0.6, 1, 1);

	var program = loadProgramFromElmts(gl, "triangle");
	gl.useProgram(program);
	uMousePos = gl.getUniformLocation(program, "mousePos");
	uColor = gl.getUniformLocation(program, "color");
	uSideCount = gl.getUniformLocation(program, "sideCount");

	var attrVertId = gl.getAttribLocation(program, "vertId");
	gl.enableVertexAttribArray(attrVertId);

	// Create a buffer with vertex ids from 0 to 21 (enough for a 20 sided shape + center vertex)
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...Array(22).keys()]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(attrVertId, 1, gl.FLOAT, false, 0, 0);

	render();
}

/**
 * Render the scene
 */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.uniform2fv(uMousePos, mousePos);
	gl.uniform4fv(uColor, shapeColor);
	gl.uniform1f(uSideCount, sideCount);

	console.log(sideCount);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, sideCount + 2);
}

/**
 * Create a shader object, load the source, and compile it.
 * 
 * @param {GL} gl the GL context
 * @param {GLenum} type the type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source the source code of the shader
 * @returns {Shader} the compiled shader or null if compilation failed
 */
function loadShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Error compiling shader: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

/**
 * Get the text from a script element and make a shader for it.
 * 
 * @param {GL} gl the GL context
 * @param {GLenum} type the type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} id the id of the script element to load
 * @returns {Shader} the compiled shader or null if compilation failed
 */
function loadShaderFromElmt(gl, type, id) {
	var src = document.getElementById(id).text;
	return loadShader(gl, type, src);
}

/**
 * Creates a shader program from vertex and fragment shader script elements with the given base name.
 * For example, if name is "triangle", this will look for "triangleVS" and "triangleFS".
 * 
 * @param {GL} gl the GL context
 * @param {string} name the base name of the shaders to load
 * @returns {Program} the created program or null if creation failed
 */
function loadProgramFromElmts(gl, name) {
	var vs = loadShaderFromElmt(gl, gl.VERTEX_SHADER, name + "VS");
	var fs = loadShaderFromElmt(gl, gl.FRAGMENT_SHADER, name + "FS");

	var program = gl.createProgram();
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Error linking program: " + gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

/**
 * Store the mouse position.
 * 
 * @param {[number, number]} pos 
 */
function setMousePos(pos) {
	mousePos[0] = pos.offsetX * 2.0 / canvasSize[0] - 1.0;
	mousePos[1] = -(pos.offsetY * 2.0 / canvasSize[1] - 1.0);
}

/**
 * Set the canvas size.
 * 
 * @param {[int, int]} size 
 */
function setCanvasSize(size) {
	var canvas = document.getElementById("canvas");
	[canvas.width, canvas.height] = size;
	canvasSize = size;
}

/**
 * Set the number of sides for the shape.
 * 
 * @param {number} count 
 */
function setSideCount(count) {
	sideCount = count;
	document.getElementById("lblSideCount").textContent = count;
	render();
}

/**
 * Set the shape color.
 * 
 * @param {string} color Hex color string
 */
function setShapeColor(color) {
	// Convert hex color to RGBA array
	var r = parseInt(color.slice(1, 3), 16) / 255;
	var g = parseInt(color.slice(3, 5), 16) / 255;
	var b = parseInt(color.slice(5, 7), 16) / 255;

	shapeColor = [r, g, b, 1];
}

init();