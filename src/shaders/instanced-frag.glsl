#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor; // normals

out vec4 out_Col;

void main()
{
out_Col = fs_Col;//vec4(1.0, 1.0, 0.0, 1.0);
}