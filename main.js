let program = null;
let gl = null;
let canvas = null;
let viewBox= [];
function main()
{
     //Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Get the rendering context for WebGL


    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);
    gl.viewport(0,0,400,400);





    document.getElementById("files").addEventListener("change",
        function (evt) {
            let fileReader = readTextFile(evt);
            fileReader.onload = function () {
                //console.log(fileReader)
                var parser = new DOMParser();
                const defaultColor = {r: 0, g: 0, b: 0, a:1};
                viewBox = xmlGetViewbox(parser.parseFromString(fileReader.result.toString(), "image/svg+xml"), [0, 0, 1, 1]);
                let pointsAndColors = xmlGetLines(parser.parseFromString(fileReader.result.toString(), "image/svg+xml"), {
                    defaultColor
                })
                //console.log(viewBox);
                //console.log(pointsAndColors);
                var points = pointsAndColors[0];
                var colors = pointsAndColors[1];



                /*for (let i = 0; i < pointsAndColors.length; i++) {
                    points.push(vec4(pointsAndColors[0][i][0], pointsAndColors[0][i][1], 0.0, 1.0));
                }
                var colors = [];
                for (let i = 0; i < pointsAndColors.length; i++) {
                    colors.push(vec4(pointsAndColors[1][i][0], pointsAndColors[1][i][1], pointsAndColors[1][i][2], pointsAndColors[1][i][3]));
                }*/

                let width = viewBox[2];
                let height = viewBox[3]

                //console.log(viewBox);

                if (width > height) {
                    gl.viewport(0, 0, canvas.width, canvas.height * height / width);
                } else if (width < height) {
                    gl.viewport(0, 0, canvas.width * width / height, canvas.height);
                } else {
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }

                projMatrix = ortho(viewBox[0], viewBox[0] + viewBox[2], viewBox[3] + viewBox[1], viewBox[1], -1, 1);

                let projMatrixLoc = gl.getUniformLocation(program, "projMatrix");

                gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix));



                render(points, colors);
            }
        });



    // Initialize shaders
    // Get the rendering context for WebGL
    //let gl = WebGLUtils.setupWebGL(canvas, undefined);
}
function render(points, colors) {
    console.log(points);
    console.log(colors);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition")
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0)
    gl.enableVertexAttribArray(vPosition);


    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor")
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0,0)
    gl.enableVertexAttribArray(vColor);


    gl.drawArrays(gl.LINES, 0, points.length);

}


