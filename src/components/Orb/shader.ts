import { Skia } from '@shopify/react-native-skia';

// A local named `pr` broke this shader on Skia's Metal backend.
const source = `
uniform float2 resolution;
uniform float time;
uniform float level;   // mic loudness, 0..1
uniform float active;  // 0 idle, 1 listening
uniform float pulse;   // short burst when listening starts
uniform float ready;   // 0 while the model loads
uniform float2 tilt;   // touch position, -1..1
uniform float light;   // 0 on a dark background, 1 on a light one

uniform float3 deep;
uniform float3 base;
uniform float3 lit;
uniform float3 tint;
uniform float3 rim;
uniform float3 sheen;
uniform float3 halo;

half4 main(float2 fragCoord) {
  float scale = min(resolution.x, resolution.y) * 0.5;
  float2 uv = (fragCoord - resolution * 0.5) / scale;
  float dist = length(uv);
  float angle = atan(uv.y, uv.x);

  // Three waves at unrelated speeds so the idle shape never visibly repeats.
  float idleWobble =
      0.016 * sin(angle * 2.0 + time * 0.53) +
      0.010 * sin(angle * 3.0 - time * 0.71 + 1.3) +
      0.005 * sin(angle * 5.0 + time * 1.13 + 2.1);

  // Kept small on purpose: visible when you talk, never jumpy.
  float voiceRipple = level * 0.02 * (
      sin(angle * 3.0 + time * 1.7) +
      0.5 * sin(angle * 5.0 - time * 2.3) +
      0.15 * sin(angle * 8.0 + time * 3.1));

  // ~1% swell.
  float breath = 0.007 * sin(time * 0.9);

  float radius = (0.66 + breath + pulse * 0.04 + active * 0.01) * (1.0 + idleWobble + voiceRipple);
  float inside = 1.0 - smoothstep(radius - 1.5 / scale, radius + 0.5 / scale, dist);

  float2 point = uv / radius;
  float depth = sqrt(1.0 - clamp(dot(point, point), 0.0, 1.0));
  float3 normal = normalize(float3(point, depth));
  // Drift keeps the highlight from sitting perfectly still.
  float2 drift = 0.08 * float2(cos(time * 0.37), sin(time * 0.29));
  float3 lightDir = normalize(float3(-0.45 + drift.x + tilt.x * 0.6, -0.55 + drift.y + tilt.y * 0.6, 0.75));
  float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);
  float fresnel = pow(1.0 - depth, 2.2);

  // About one turn every 30 s.
  float turn = time * 0.21;
  float2 swirlPoint = float2(
      point.x * cos(turn) - point.y * sin(turn),
      point.x * sin(turn) + point.y * cos(turn));
  float swirl = clamp(0.5 + 0.25 * (
      sin(swirlPoint.x * 3.7 + time * 0.6 + sin(swirlPoint.y * 5.0 - time * 0.8)) +
      sin(swirlPoint.y * 4.3 - time * 0.5 + sin(swirlPoint.x * 3.5 + time * 0.7))), 0.0, 1.0);

  float3 color = mix(deep, base, smoothstep(0.0, 0.65, diffuse));
  color = mix(color, lit, smoothstep(0.55, 1.0, diffuse) * 0.6);
  color = mix(color, tint, swirl * (0.22 + 0.08 * active + 0.15 * level) * (0.4 + 0.6 * depth));

  float transmitted = smoothstep(0.1, 1.0, dot(point, normalize(float2(0.45, 0.8)) - lightDir.xy * 0.3));
  color += tint * transmitted * (0.22 + 0.08 * level) * (1.0 - fresnel * 0.6);
  color = mix(color, rim, fresnel * 0.5);

  float edge = length(point);
  color += rim * 0.3 * smoothstep(0.82, 0.96, edge) * (1.0 - smoothstep(0.96, 1.0, edge));

  float highlight = clamp(dot(normal, normalize(lightDir + float3(0.0, 0.0, 1.0))), 0.0, 1.0);
  color += sheen * pow(highlight, 5.0) * 0.26 + pow(highlight, 140.0) * 0.55;

  float energy = 0.82 + 0.08 * active + 0.1 * level + 0.2 * pulse;
  float breathe = mix(0.93 + 0.07 * sin(time * 1.1), 1.0, active);
  float dim = mix(0.4 + 0.06 * sin(time * 3.0), 1.0, ready);
  color *= breathe * energy * mix(dim, 1.0, light);
  float luma = dot(color, float3(0.3, 0.59, 0.11));
  color = clamp(mix(float3(luma), color, mix(0.25, 1.0, ready)), 0.0, 1.0);
  // Dimming looks like a grey stone on a light page, so fade into the page instead.
  color = mix(color, float3(0.93), light * (1.0 - dim) * 0.95);

  float outside = max(dist - radius, 0.0);
  float glow = exp(-outside * (9.0 - 1.5 * active - 2.0 * level - 2.5 * light))
    * (0.3 + 0.1 * active + 0.25 * level + 0.3 * pulse) * mix(dim, dim * dim, light)
    * smoothstep(1.0, 0.82, dist);
  // Can't add light to a light page, so there the glow is a wash of the orb's brightest shade.
  float3 glowColor = mix(mix(halo, tint, 0.15 + 0.2 * level), mix(lit, sheen, 0.25), light) * glow;

  float3 result = color * inside + glowColor * (1.0 - inside);
  return half4(min(result, float3(1.0)), max(inside, clamp(glow, 0.0, 1.0)));
}
`;

export const orbShader = Skia.RuntimeEffect.Make(source)!;
