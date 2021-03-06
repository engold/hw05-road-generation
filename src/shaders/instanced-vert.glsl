#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
// Columns for overall transformation matrix - unique to each instance
in vec4 vs_TransformC1;
in vec4 vs_TransformC2;
in vec4 vs_TransformC3;
in vec4 vs_TransformC4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor; // normals

void main() {
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;

    mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, vs_TransformC4);
    vec4 finalPos = overallTransforms * vs_Pos;
    vec3 remappedPos = finalPos.xyz / 1000.0 - 1.0;

    //gl_Position =  fs_Pos;//instance square in the middle of the screen
    gl_Position = vec4(remappedPos.x, remappedPos.z, 0.0, 1.0); // some roads not quite in the right place
   //gl_Position = u_ViewProj * finalPos;
   //gl_Position = finalPos;
}