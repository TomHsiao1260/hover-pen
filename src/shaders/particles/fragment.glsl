#define PI 3.1415926535897932384626433832795

uniform float uTime;        // normalized progress time  
uniform sampler2D uTexture; // texture for particles

varying vec3 vColor;        // particles color

void main()
{
    gl_FragColor  = texture2D(uTexture, gl_PointCoord);
    gl_FragColor *= vec4(vColor, 1.0);
}