var vertData = [
	// triangle
	0, 0,
	-0.5, -0.5,
	0, 0.5,
	0.5, -0.5,
	-0.5, -0.5,

	// square
	0, 0,
	-0.5, -0.5,
	0.5, -0.5,
	0.5, 0.5,
	-0.5, 0.5,
	-0.5, -0.5

];

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
var attrPos;

/**
 * Initialize WebGL
 */
function init() {
	var canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canvas.getContext("experimental-webgl");
	}
	gl.clearColor(0.4, 0.6, 1, 1);

	var program = loadProgramFromElmts(gl, "triangle");
	gl.useProgram(program);

	attrPos = gl.getAttribLocation(program, "position");
	gl.enableVertexAttribArray(attrPos);

	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertData), gl.STATIC_DRAW);
	gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 4 * 2, 0);

	render();
}

/**
 * Render the scene
 */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	var shape = document.getElementById("slcShape").value;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 4 * 2, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, shapeData[shape].offset, shapeData[shape].count);
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

init();