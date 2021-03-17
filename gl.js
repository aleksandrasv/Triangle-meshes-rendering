import buildingShaderSrc from './building.vert.js' ;
import flatShaderSrc from './flat.vert.js' ;
import fragmentShaderSrc from './fragment.glsl.js' ;

var gl;

var layers = null

var modelMatrix;
var projectionMatrix;
var viewMatrix;
var anglex = 0;
var angley = 0;

var currRotate = 0;
var currZoom = 0;
var currProj = 'perspective';

/*
    Vertex shader with normals
*/
class BuildingProgram {

    constructor() {
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, buildingShaderSrc);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
        
        // TODO: set attrib and uniform locations
        this.posAttribLoc = gl.getAttribLocation(this.program, "position");
        this.normAttribLoc = gl.getAttribLocation(this.program, "normal");
        
        // set uniform locations: 
        this.modelLoc = gl.getUniformLocation(this.program, 'uModel');
        this.projLoc = gl.getUniformLocation(this.program, 'uProjection');
        this.viewLoc = gl.getUniformLocation(this.program, 'uView');
    }

    use() {
        gl.useProgram(this.program);
    }
}

/*
    Vertex shader with uniform colors
*/
class FlatProgram {

    constructor() {
        
        // set shaders
        this.vertexShader = createShader(gl, gl.VERTEX_SHADER, flatShaderSrc);
        this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
        
        // set attrib
        this.posAttribLoc = gl.getAttribLocation(this.program, "position");
        
        // set uniform locations: 
        this.modelLoc = gl.getUniformLocation(this.program, 'uModel');
        this.projLoc = gl.getUniformLocation(this.program, 'uProjection');
        this.viewLoc = gl.getUniformLocation(this.program, 'uView');
    }

    use() {
        gl.useProgram(this.program);
    }
}


/*
    Collection of layers
*/
class Layers {
    constructor() {
        this.layers = {};
        this.centroid = [0,0,0];
    }

    addBuildingLayer(name, vertices, indices, normals, color){
        var layer = new BuildingLayer(vertices, indices, normals, color);
        layer.init();
        this.layers[name] = layer;
        this.centroid = this.getCentroid();
    }

    addLayer(name, vertices, indices, color) {
        var layer = new Layer(vertices, indices, color);
        layer.init();
        this.layers[name] = layer;
        this.centroid = this.getCentroid();
    }

    removeLayer(name) {
        delete this.layers[name];
    }

    draw() {
        for(var layer in this.layers) {
            this.layers[layer].draw(this.centroid);
        }
    }

    
    getCentroid() {
        var sum = [0,0,0];
        var numpts = 0;
        for(var layer in this.layers) {
            numpts += this.layers[layer].vertices.length/3;
            for(var i=0; i<this.layers[layer].vertices.length; i+=3) {
                var x = this.layers[layer].vertices[i];
                var y = this.layers[layer].vertices[i+1];
                var z = this.layers[layer].vertices[i+2];
    
                sum[0]+=x;
                sum[1]+=y;
                sum[2]+=z;
            }
        }
        return [sum[0]/numpts,sum[1]/numpts,sum[2]/numpts];
    }
}

/*
    Layers without normals (water, parks, surface)
*/
class Layer {
    constructor(vertices, indices, color) {
        this.vertices = vertices;
        this.indices = indices;
        this.color = color;
    }

    init() {
        this.program = new FlatProgram();
        this.indexBuff = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices));
        this.vertexBuff = createBuffer(gl, gl.ARRAY_BUFFER, new Uint32Array(this.vertices));

        // TODO: create program, set vertex and index buffers, vao
        this.vao = createVAO(gl, this.program.posAttribLoc, this.vertexBuff);
    }

    draw(centroid) {
        
        // use program:
        this.program.use();
        
        // update model matrix, view matrix, projection matrix
        updateModelMatrix();
        updateProjectionMatrix();
        updateViewMatrix();
        
        // TODO: set uniforms
        gl.uniformMatrix4fv(this.modelLoc, false, new Float32Array(modelMatrix));
        gl.uniformMatrix4fv(this.projLoc, false, new Float32Array(projectionMatrix));
        gl.uniformMatrix4fv(this.viewLoc, false, new Float32Array(viewMatrix));
        
        // TODO: bind vao, bind index buffer, draw elements
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        
    }
}

/*
    Layer with normals (building)
*/
class BuildingLayer extends Layer {
    constructor(vertices, indices, normals, color) {
        super(vertices, indices, color);
        this.normals = normals;
    }

    init() {
        // create program:   
        this.program  = new BuildingProgram();
        
        // set vertex, normal and index buffers:

        this.indexBuff = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices));
        this.normalBuff = createBuffer(gl, gl.ARRAY_BUFFER, new Uint32Array(this.normals));
        this.vertexBuff = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.vertices));

        //  create  vao
        this.vao = createVAO(gl, this.program.posAttribLoc, this.vertexBuff, null, this.normalBuff );
    }

    draw(centroid) {

        // TODO: use program,
        this.program.use();

        // update model matrix, view matrix, projection matrix
        updateModelMatrix();
        updateProjectionMatrix();
        updateViewMatrix();
        
        
        // TODO: set uniforms
        gl.uniformMatrix4fv(this.modelLoc, false, new Float32Array(modelMatrix));
        gl.uniformMatrix4fv(this.projLoc, false, new Float32Array(projectionMatrix));
        gl.uniformMatrix4fv(this.viewLoc, false, new Float32Array(viewMatrix));

        // TODO: bind vao, bind index buffer, draw elements
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

/*
    Event handlers
*/
window.updateRotate = function() {
    currRotate = parseInt(document.querySelector("#rotate").value);
    console.log(currRotate);
}

window.updateZoom = function() {
    currZoom = parseFloat(document.querySelector("#zoom").value);
    console.log(currZoom);
}

window.updateProjection = function() {
    currProj = document.querySelector("#projection").value;
    console.log(currProj);
}

/*
    File handler
*/



const fileSelector = document.getElementById('fileInput');
fileSelector.addEventListener('change', (event) => {
    const file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function(evt) {
        if (evt.target.result.length == 0){
            console.log("Empty file");
        }
        else{
            parseInput(evt.target.result);
        }
    }
    console.log(layers);
    reader.readAsText(event.target.files[0]);
});

function parseInput(input){
    var parsed = JSON.parse(input);
    var coordinates, indices, normals, color;
    
    for(var layer in parsed){
        var obj = parsed[layer];
        for (var i in obj){
            switch (i){
                case "coordinates":
                    coordinates = obj[i];
                    break;
                case "indices":
                    indices = obj[i];
                    break;
                case "normals":
                    normals = obj[i];
                    break;
                case "color":
                    color = obj[i];
                    break;
                default:
                    console.log("don't know what it is")
            }
        }
        if(layer == 'buildings') {
            layers.addBuildingLayer(layer, coordinates, indices, normals, color);
        }
        else {
            layers.addLayer(layer, coordinates, indices, color);
        }
    }
}


/*
    Update transformation matrices
*/
function updateModelMatrix(centroid) {
    // TODO: update model matrix
    var scale = scaleMatrix(0.5, 0.5, 0.5);

    // Rotate a slight tilt
    var rotateX = rotateXMatrix(0.01*currRotate + 45.0 * Math.PI / 180.0);

    // Rotate according to time
    var rotateY = rotateYMatrix(0.01*currZoom + -45.0 * Math.PI / 180.0);

    // Move slightly down
    var position = translateMatrix(0, 0, -50);

    // Multiply together, make sure and read them in opposite order
    modelMatrix = multiplyArrayOfMatrices([
        position, // step 4
        rotateY,  // step 3
        rotateX,  // step 2
        scale     // step 1
    ]);
}

function updateProjectionMatrix() {
    var aspect = window.innerWidth / window.innerHeight;
    projectionMatrix = perspectiveMatrix(45.0 * Math.PI / 180.0, aspect, 1, 500);
    // projMatrix = orthographicMatrix(-aspect, aspect, -1, 1, 0, 500);
}

function updateViewMatrix() {
    var now = Date.now();
    var moveInAndOut = 5 - 50.0 * (Math.sin(now * 0.002) + 1.0) / 2.0;

    var position = translateMatrix(0, 0, moveInAndOut);
    var world2view = multiplyArrayOfMatrices([
        position
    ]);

    viewMatrix = invertMatrix(world2view);

}

/*
    Main draw function (should call layers.draw)
*/
function draw() {

    gl.clearColor(190/255, 210/255, 215/255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    layers.draw();

    requestAnimationFrame(draw);

}

/*
    Initialize everything
*/
function initialize() {

    var canvas = document.querySelector("#glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = canvas.getContext("webgl2");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    layers = new Layers();

    window.requestAnimationFrame(draw);

}


window.onload = initialize;