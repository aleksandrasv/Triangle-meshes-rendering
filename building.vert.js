export default `#version 300 es

uniform mat4 uModel;
uniform mat4 uProjection;
uniform mat4 uView;
uniform vec4 uColor;

in vec3 position;
in vec3 normal;

out vec4 vColor;

void main() {
    // TODO: set color as the dot product between a light direction, and the vertex normal
    vec3 lightDir = normalize(vec3(1,0,1));
    vColor.rbg *= dot(lightDir,normal);
    // TODO: transform position
    gl_Position = uProjection * uView * uModel * vec4(position, 1);
    
}
`;