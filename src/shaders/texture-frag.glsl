#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time; 
uniform float u_Slider;

in vec2 fs_Pos;
out vec4 out_Col;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


//https://thebookofshaders.com/13/
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// based on Adam's slides
float fbm (in vec2 st) {
    // Initial values
    float total = 0.0;
    float persist = 0.5;
    int octaves = 8;
    
    // Loop for octaves
    for (int i = 0; i < octaves; i++) {
          float frequency = pow(2.75, float(i));
          float amp = pow(persist, float(i));
        total +=  abs(noise(vec2(st.x * frequency, st.y * frequency))) * amp;
       
    }
    return total;
}

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}



float worleyNoise(float x, float y,float numR,float numC){
    float xPos = x * numC / 20.0;
    float yPos = y * numR/ 20.0;
    float minDist = 60.0;

    for (float i = -1.0; i < 2.0; i++) {
        for (float j = -1.0; j < 2.0; j++) {
            vec2 currGrid = vec2(floor(xPos) + i, floor(yPos) + j);
            vec2 currNoise = currGrid + random2(currGrid + vec2(2,0));
            float currDist = distance(vec2(xPos, yPos), currNoise);
            if (currDist <= minDist) {
                minDist = currDist;
            }
        }
    }
    return minDist;
}

// functions for population density
float inWaterFunc(vec2 pos) {
	vec2 elevationPos = pos - vec2(1.1, 0.3);
	float noiseVal = fbm(elevationPos / 2.0);
	noiseVal = clamp((noiseVal - 0.4) / 0.4, 0.0, 1.0);
  if(noiseVal == 0.0){
    return 0.0;
  }
  else{
    return 1.0;
  }

}
float popDenseFunc(vec2 pos) {
	float water = inWaterFunc(pos);
  float noise = worleyNoise(pos.x, pos.y, 30.0, 30.0);
  if(water == 0.0){
    0.0;
  }
  else{
    return  noise * u_Time;
  }
}

// function for terrain elevation
float elevFunc(vec2 pos) {
	float water = inWaterFunc(pos);
	vec2 temp = pos - vec2(1.15, 0.4);
	float noise = fbm(temp / 2.02);
	noise = clamp((noise - 0.2), 0.0, 1.0);
  if(water == 0.0){
    return  0.0;
  }
  else{
    return noise*u_Slider;
  }

}



void main() {
vec2 x = fs_Pos;
float popColor =  popDenseFunc(x);
float terrainColor = elevFunc(x);
float waterCol = inWaterFunc(x);
vec3 color = vec3(waterCol, terrainColor, popColor);
out_Col = vec4(color, 1.0);
}
