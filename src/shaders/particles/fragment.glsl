varying vec3 vColor;

void main()
{
    // gl_PointCoord 為每個 vertex 點上的小平面上的座標點 (左上 0,0，右下 1,1)
    float strength = distance(gl_PointCoord, vec2(0.5));
    // 接近中心點呈現白色，越遠則越暗，注意到邊界要幾乎全黑
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // 讓球狀的 strength 圖案與 color 混合
    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}