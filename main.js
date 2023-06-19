let program = null;
let gl = null;
let canvas = null;
let viewBox= [];
let drag = false;
let width = null;
let height = null;
let dragx = 0;
let dragy = 0;
let start =0;
let angle = 0;
let fMatrix;
let scaleFactor=1;

function main()
{
     //Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    gl = WebGLUtils.setupWebGL(canvas, undefined);

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

                width = viewBox[2];
                height = viewBox[3]

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


                canvas.addEventListener('mousedown', (evt) =>{

                    start = {x: evt.clientX, y:evt.clientY};
                });

                canvas.addEventListener('mousemove', (evt)=>{
                    if(evt.buttons === 1){
                        const current = {x:evt.clientX, y: evt.clientY};
                        dragx=((current.x-start.x) *width)/canvas.width;
                        dragy=((current.y-start.y) *height)/canvas.height;
                        gl.clear(gl.COLOR_BUFFER_BIT);
                        //start=current;
                        render(points, colors);
                    }
                });

                canvas.addEventListener("onwheel" in document ? "wheel" : "mousewheel", function(e) {
                    //console.log(e.deltaX);
                    console.log(e.deltaY);

                    if( e.deltaY<0 ){

                        if(angle===360){
                            angle=0;
                        }else{
                            angle+=1;
                        }

                    } else {

                        if(angle===-360){
                            angle=0;
                        }else{
                            angle-=1;
                        }
                    }
                    if(e.deltaY<0 && scaleFactor<10){
                        console.log("hi");
                        scaleFactor+=0.1;
                    }else if(e.deltaY>0&& scaleFactor>0.1){
                        console.log("bye");
                        scaleFactor-=0.1;
                    }


                    render(points, colors);
                });
                /*canvas.addEventListener("onwheel" in document ? "wheel" : "mousewheel", function(e) {

                    if(e.deltaY<0 && scaleFactor<10){
                        console.log("hi");
                        scaleFactor+=0.1;
                    }else if(e.deltaY>0&& scaleFactor>0.1){
                        console.log("bye");
                        scaleFactor-=0.1;
                    }
                    render(points,colors);
                });*/


                render(points, colors);
            }
        });

}


function render(points, colors) {
    let translateMatrix = translate(width/2 + viewBox[0], height/2 + viewBox[1], 0);
    let btranslateMatrix = translate(-(width/2+viewBox[0]), -(height/2+viewBox[1]), 0);
    const dtranslateMatrix = translate(dragx, dragy, 0);
    const rotateMatrix = rotate(angle, [0, 0, 1]);
    const scaleMatrix = scalem(scaleFactor, scaleFactor, 1);
    fMatrix = mult(translateMatrix, scaleMatrix);
    fMatrix = mult(fMatrix, rotateMatrix);
    fMatrix = mult(fMatrix, dtranslateMatrix);
    fMatrix = mult(fMatrix, btranslateMatrix);
    const modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, flatten(fMatrix));

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


