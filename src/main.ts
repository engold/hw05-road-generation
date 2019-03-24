import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import MySquare from './geometry/MySquare'; // Added for HW5
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import ExpansionRules from './LSystem/ExpansionRules'; // for LSystem
import LSystem from './LSystem/LSystem'; // for LSystem
import LSystemHighway from './LSystem/LSystemHighway'; // 

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  // Added GUI controls for HW5
  'Display Elevation' : false, 
  'Display Population Density': false, 
  'PopDensity': 1.3,
  'BranchAngle': 3.0,
  'TerrainElevation': 1.0,   
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
// HW 5 ROADS -----------------------
let tempVar: number; 
tempVar = 45.0;
let roadSystem: MySquare;
let myLSystem: LSystem;
let myLSystemHighway: LSystemHighway;
// gui vars for hw5
let guiPopDensity = 1.3;
let guiBranchAngle = 3.0;
let guiTerrainElevation = 1.0;


function generateLSystemHighway() {
 myLSystemHighway.createLSysHighway(controls.BranchAngle);

 // get vbo data
  let vboData: any = myLSystemHighway.getVBOs();
  roadSystem.setInstanceVBOs(vboData.c1, vboData.c2, vboData.c3, vboData.c4, vboData.cols);
  roadSystem.setNumInstances(vboData.c1.length / 4.0);
  //console.log(roadSystem);
 // console.log(myLSystemHighway);
}



// ADDED FOR HW5
let elevationQuad: ScreenQuad; // for the terrain elevation map to be displayed on
let popQuad: ScreenQuad; // to display the population density map

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // ADDED FOR HW5
  elevationQuad = new ScreenQuad();
  elevationQuad.create();
  popQuad = new ScreenQuad();
  popQuad.create();  

  // CREATE THE ROAD SYSTEM
  roadSystem = new MySquare();
  roadSystem.create();
 // createLSystem(); // populate the buffers for the LSystem (the road system)

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU

  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles" 
   
}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  // ADDED FOR HW5
  gui.add(controls, 'Display Elevation');  
  gui.add(controls, 'Display Population Density');
  gui.add(controls, 'PopDensity', 1.0, 2.0).step(0.1);
  gui.add(controls, 'BranchAngle', 1.0, 5.0).step(0.5);
  gui.add(controls, 'TerrainElevation', 1.0, 1.5).step(0.05);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST); // not gl.blend
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // ADDED FOR HW5
  const elevationShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/Terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/Terrain-frag.glsl')),
  ]);

  const populationShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/Density-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/Density-frag.glsl')),
  ]);

  const bothShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/combo-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/combo-frag.glsl')),
  ]);
  const textureShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/texture-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
  ]);
 //Texture Stuff ----------------------------------------------------------------------------
const texturecanvas = <HTMLCanvasElement> document.getElementById('texturecanvas');
const textureRenderer = new OpenGLRenderer(texturecanvas);
// width of the texture, this is our resolution for our L-system
const width = 2000;
const height = 2000;
textureRenderer.setSize(width, height);
//textureRenderer.setClearColor(0, 0, 1, 1);
// put noise coloring into textureData to be sampled later
let textureData: Uint8Array = textureRenderer.renderTexture(camera, textureShader, [screenQuad]);
 myLSystemHighway = new LSystemHighway(textureData);
 generateLSystemHighway(); // intial setup
 //--------------------------------------------------------------------------------------------------------------------------

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);    
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // for hw5
    if(controls.PopDensity - guiPopDensity != 0.0){
      guiPopDensity = controls.PopDensity;
      generateLSystemHighway();
    }
    if(controls.BranchAngle - guiBranchAngle != 0.0){
      guiBranchAngle = controls.BranchAngle;
      generateLSystemHighway();
    }
    if(controls.TerrainElevation - guiTerrainElevation != 0.0){
      guiTerrainElevation = controls.TerrainElevation;
      generateLSystemHighway();
    }

    renderer.clear();
    // ADDED FOR HW5
    //renderer.render(camera, flat, [screenQuad]);
    // if elevation box is checked, display terrain elevation map
    populationShader.setTime(controls.PopDensity); // pass value to shader through U_Time var name
    bothShader.setTime(controls.PopDensity);
    bothShader.setSliderVar(controls.TerrainElevation);
    textureShader.setTime(controls.PopDensity);
    textureShader.setSliderVar(controls.TerrainElevation);
    elevationShader.setTime(controls.TerrainElevation);
    if(controls["Display Elevation"] && controls["Display Population Density"] == false){
      renderer.render(camera, elevationShader, [screenQuad]);
    }
    // if population density box is checked, display population density map
    if(controls["Display Population Density"] && controls["Display Elevation"] == false){
      renderer.render(camera, populationShader, [screenQuad]);
    }
    // if neither box is checked, display plain land and water set up
    if(controls["Display Elevation"] == false && controls["Display Population Density"] == false){
     renderer.render(camera, flat, [screenQuad]);
    // renderer.render(camera, textureShader, [screenQuad]); // visualize whats in textureBuffer shader
    }
    // if both are checked, display both maps
    if(controls["Display Elevation"] && controls["Display Population Density"]){
      renderer.render(camera, bothShader, [screenQuad]);
    }
    // draw rods/highways last so they are drawn on top of everything else
    renderer.render(camera, instancedShader, [
      //square,
      roadSystem, // the roads
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
