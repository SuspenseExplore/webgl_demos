function main() {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canvas.getContext("experimental-webgl");
	}
	gl.clearColor(0.4, 0.6, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

main();