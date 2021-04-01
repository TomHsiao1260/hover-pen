uniform float uSize; // 粒子大小
uniform float uTime; // 時間

attribute float aScale;     // 隨機縮放粒子
attribute vec3 aRandomness; // 三軸隨機亂數

varying vec3 vColor; // 顏色

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // 加入動畫，越外圍角度偏移越大，而且隨時間增加
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    // 隨機分散
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // 設定 size (與 fragment 有關，不是螢幕上的 pixel)
    gl_PointSize = uSize * aScale;
    // 設定 sizeAttenuation (透過 viewPosition 讓越遠的粒子越小)
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}