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

// shader uniform data
var uniforms = {
	mousePos: {
		location: -1,
		value: [0, 0]
	},
	color: {
		location: -1,
		value: [0, 0.5, 0, 1]
	},
	sideCount: {
		location: -1,
		value: 3
	},
	viewportSize: {
		location: -1,
		value: [800, 600]
	},
	radius: {
	location: -1,
	value: 100
	}
};

/**
 * Initialize WebGL
 */
function init() {
	var canvas = document.getElementById("canvas");
	setCanvasSize(uniforms.viewportSize.value);

	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canvas.getContext("experimental-webgl");
	}
	gl.clearColor(0.4, 0.6, 1, 1);

	var program = loadProgramFromElmts(gl, "triangle");
	gl.useProgram(program);
	
	uniforms.mousePos.location = gl.getUniformLocation(program, "mousePos");
	uniforms.color.location = gl.getUniformLocation(program, "color");
	uniforms.sideCount.location = gl.getUniformLocation(program, "sideCount");
	uniforms.viewportSize.location = gl.getUniformLocation(program, "viewportSize");
	uniforms.radius.location = gl.getUniformLocation(program, "radius");

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

	gl.uniform2fv(uniforms.mousePos.location, uniforms.mousePos.value);
	gl.uniform4fv(uniforms.color.location, uniforms.color.value);
	gl.uniform1f(uniforms.sideCount.location, uniforms.sideCount.value);
	gl.uniform2fv(uniforms.viewportSize.location, uniforms.viewportSize.value);
	gl.uniform1f(uniforms.radius.location, uniforms.radius.value);

	gl.drawArrays(gl.TRIANGLE_FAN, 0, uniforms.sideCount.value + 2);
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
	uniforms.mousePos.value[0] = pos.offsetX;
	uniforms.mousePos.value[1] = uniforms.viewportSize.value[1] - pos.offsetY;
}

/**
 * Set the canvas size.
 * 
 * @param {[int, int]} size 
 */
function setCanvasSize(size) {
	var canvas = document.getElementById("canvas");
	[canvas.width, canvas.height] = size;
	uniforms.viewportSize.value = size;
}

/**
 * Set the number of sides for the shape.
 * 
 * @param {number} count 
 */
function setSideCount(count) {
	uniforms.sideCount.value = count;
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

	uniforms.color.value = [r, g, b, 1];
}

/**
 * Set the shape's radius.
 * 
 * @param {number} r 
 */
function setRadius(r) {
	uniforms.radius.value = r;
	document.getElementById("lblRadius").textContent = r;
	render();
}

init();