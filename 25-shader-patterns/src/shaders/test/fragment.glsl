uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main()
{
    // gl_FragColor = vec4(vRandom, 1.0, 1.0, 1.0);
    // gl_FragColor = vec4(uColor, 1.0);

    // vec4 texture = texture2D(uTexture, vUv);
    // // texture.rgb += vElevation * 2.0 + .5;
    // texture.rgb += vElevation * 2.0 - .1;
    // gl_FragColor = texture;

    // gl_FragColor = vec4(vUv, 0.5, 1.0);

    gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0); // uv goes from 0,0 to 1,1
}