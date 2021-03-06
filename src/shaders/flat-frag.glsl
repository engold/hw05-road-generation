#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time; 

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


vec3 waterFunc(vec2 pos) {
	vec2 elevationPos = pos - vec2(1.1, 0.3);
	float noiseVal = fbm(elevationPos / 2.0);
	noiseVal = clamp((noiseVal - 0.4) / 0.4, 0.0, 1.0);
  if(noiseVal == 0.0){
    return vec3(0.1098, 0.4941, 1.0); // water color
  }
  else{
    return  vec3(0.2627, 0.9686, 0.3216); // land color
  }

}


void main() {
vec2 x = fs_Pos;
vec3 color = waterFunc(x);
	out_Col = vec4(color, 1.0);
}
