import * as THREE from 'three';

interface CatShaderOptions {
  rimColor?: string;
  rimPower?: number;
  sssColor?: string;
  sssStrength?: number;
}

/**
 * Patch MeshToonMaterial để bổ sung Fresnel Rim Light và Subsurface Scattering (SSS) giả lập
 * Dùng onBeforeCompile để tương thích hoàn toàn với hệ thống ánh sáng/bóng đổ mặc định của Three.js.
 */
export function patchCatToonMaterial(
  material: THREE.MeshToonMaterial,
  options: CatShaderOptions = {}
) {
  material.onBeforeCompile = (shader) => {
    // 1. Khởi tạo các Uniforms bổ sung
    shader.uniforms.uRimColor = { value: new THREE.Color(options.rimColor || '#ffe8b5') };
    shader.uniforms.uRimPower = { value: options.rimPower !== undefined ? options.rimPower : 2.5 };
    shader.uniforms.uSssColor = { value: new THREE.Color(options.sssColor || '#ff9e7a') };
    shader.uniforms.uSssStrength = { value: options.sssStrength !== undefined ? options.sssStrength : 0.6 };

    // 2. Chèn Varyings vào Vertex Shader để truyền Normal và ViewPosition ra Fragment Shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vNormalWorld;
       varying vec3 vViewPositionWorld;`
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `#include <beginnormal_vertex>
       vNormalWorld = normalize(normalMatrix * normal);`
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
       vViewPositionWorld = -mvPosition.xyz;`
    );

    // 3. Chèn Varyings và Uniforms vào Fragment Shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vNormalWorld;
       varying vec3 vViewPositionWorld;
       uniform vec3 uRimColor;
       uniform float uRimPower;
       uniform vec3 uSssColor;
       uniform float uSssStrength;`
    );

    // 4. Chèn công thức tính Fresnel Rim và SSS vào phần đầu ra màu sắc cuối cùng
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       
       vec3 normalVec = normalize(vNormalWorld);
       vec3 viewVec = normalize(vViewPositionWorld);
       
       // A. Fresnel Rim Lighting (Viền sáng mềm bao bọc cơ thể)
       float rim = 1.0 - max(0.0, dot(viewVec, normalVec));
       float rimFactor = pow(rim, uRimPower);
       vec3 finalRimGlow = uRimColor * rimFactor;
       
       // B. Subsurface Scattering giả lập (Ánh sáng xuyên thấu qua các bộ phận mỏng như tai)
       // Giả lập nguồn sáng ngược (Backlight) từ phía sau để cộng ánh sáng tán xạ
       vec3 backlightDir = normalize(vec3(0.0, 1.0, -1.0));
       float sssAmount = max(0.0, dot(-backlightDir, viewVec)) * uSssStrength;
       vec3 finalSssGlow = uSssColor * sssAmount;
       
       // Cộng trực tiếp vào đầu ra màu sắc
       gl_FragColor.rgb += finalRimGlow + finalSssGlow;`
    );
  };
}
