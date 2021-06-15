uniform vec2 uFrequency;
uniform float uTime;

attribute float aRandom;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main()
{
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += .5; // moving in world space

    float elevation = sin(modelPosition.x * uFrequency.x + uTime) * .1;
    elevation += sin(modelPosition.y * uFrequency.y + uTime) * .1;
    modelPosition.z += elevation;
    // modelPosition.z += aRandom * .1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectioPosition = projectionMatrix * viewPosition;

    gl_Position = projectioPosition;

    vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}