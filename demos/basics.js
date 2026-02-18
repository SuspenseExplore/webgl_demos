function main() {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canvas.getContext("experimental-webgl");
	}
	gl.clearColor(0.4, 0.6, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var program = loadProgramFromElmts(gl, "triangle");
	gl.useProgram(program);

	var attrPos = gl.getAttribLocation(program, "position");
	var attrColor = gl.getAttribLocation(program, "color");
	var verts = [
		-0.5, 0.5,
		0, -0.5,
		0.5, 0.5,
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1
	];

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(attrPos);
	gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, false, 4 * 2, 0);
	gl.enableVertexAttribArray(attrColor);
	gl.vertexAttribPointer(attrColor, 4, gl.FLOAT, false, 4 * 4, 4 * 2 * 3);

	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

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

function loadShaderFromElmt(gl, type, id) {
	var src = document.getElementById(id).text;
	return loadShader(gl, type, src);
}

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

main();