#define PI 3.1415926535897932384626433832795

uniform float uTime;        // normalized progress time  
uniform sampler2D uTexture; // texture for particles
uniform vec3 uColorShift;   // normalized color shift

varying vec3 vColor;        // particles color
varying float vBlink;       // 1D random value for particles

void main()
{
    float theta = 2.0 * PI * vBlink + 2.0 * uTime;
    float opacity = sin(theta);

    gl_FragColor  = texture2D(uTexture, gl_PointCoord);
    // gl_FragColor *= vec4(vColor, opacity);
    gl_FragColor *= vec4(vColor, 1.0);
    gl_FragColor.rgb += uColorShift;
}