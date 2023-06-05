function main()
{
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    let gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    let program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, 400, 400);

    var points = [];
    points.push(vec4(0.5,-0.5,0.0,1.0));

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition")

    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0,0)
    gl.drawArrays(gl.POINTS, 0, points.length)

    //let form = document.getElementById("fileupload");
    let inputElement = document.getElementById("files");
    /*inputElement.addEventListener("submit", (e) => {
        e.preventDefault();

        let fileElement = document.getElementById("files");
        let fileReader = readTextFile(e);*/


   // });
}

function renderFile(evt)
{
    e.preventDefault();

    let fileElement = document.getElementById("files");
    let fileReader = readTextFile(e);
}


