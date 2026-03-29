import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { SCENE_CONFIG } from '@/lib/scene-config';
import { SPHERE_IDENTITIES, TABLE_POSITIONS, hexToNumber, lightenColor } from '@/lib/sphere-identities';
import type { SphereId, SphereStatus, SubAgentInfo } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { soundSystem } from '@/lib/sound-system';

// ═══ SPHERE MESH MANAGER ═══

interface SphereMesh {
  id: SphereId;
  group: THREE.Group;
  core: THREE.Mesh;
  halo: THREE.Mesh;
  tescito: THREE.Group;
  tablePos: THREE.Vector3;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  pulsePhase: number;
  status: SphereStatus;
}

interface SubSphereMesh {
  id: string;
  parentId: SphereId;
  group: THREE.Group;
  core: THREE.Mesh;
  halo: THREE.Mesh;
  targetPos: THREE.Vector3;
  status: SubAgentInfo['status'];
  // Dissolution particles
  particles?: THREE.Points;
  particleStartTime?: number;
}

interface ArcMesh {
  from: SphereId;
  to: SphereId;
  line: THREE.Line;
  particleGroup: THREE.Group;
  active: boolean;
}

// ═══ HELPERS ═══

function createSphereGeom(radius: number): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, 32, 32);
}

function createGlowMaterial(color: number, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
}

function makeCandleLight(color: string, x: number, z: number): THREE.PointLight {
  const light = new THREE.PointLight(new THREE.Color(color), SCENE_CONFIG.restaurant.candleGlow.intensity, 4);
  light.position.set(x, 0.8, z);
  return light;
}

function buildTableGeom(): THREE.Group {
  const group = new THREE.Group();
  // Table top
  const topGeo = new THREE.CylinderGeometry(SCENE_CONFIG.restaurant.tableRadius, SCENE_CONFIG.restaurant.tableRadius, 0.05, 32);
  const topMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(SCENE_CONFIG.restaurant.tableLinen) });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.75;
  group.add(top);
  // Leg
  const legGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.75, 12);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x2a1f0a });
  const leg = new THREE.Mesh(legGeo, legMat);
  leg.position.y = 0.375;
  group.add(leg);
  return group;
}

function buildTescitoGroup(color: string): THREE.Group {
  const group = new THREE.Group();
  // Glass stem
  const stemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.14, 8);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0,
    metalness: 0,
    transmission: 0.9,
  });
  const stem = new THREE.Mesh(stemGeo, glassMat);
  stem.position.y = 0.07;
  group.add(stem);
  // Bowl
  const bowlGeo = new THREE.SphereGeometry(0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowl = new THREE.Mesh(bowlGeo, glassMat);
  bowl.position.y = 0.14;
  bowl.rotation.x = Math.PI;
  group.add(bowl);
  // Liquid
  const liquidGeo = new THREE.SphereGeometry(0.055, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const liquidMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: SCENE_CONFIG.spheres.tescito.liquidOpacity,
  });
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = 0.13;
  liquid.rotation.x = Math.PI;
  group.add(liquid);

  group.position.set(0.2, 0.78, 0); // offset from table center
  return group;
}

function buildArcCurve(from: THREE.Vector3, to: THREE.Vector3): THREE.CatmullRomCurve3 {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.y += SCENE_CONFIG.arcs.arcHeight;
  return new THREE.CatmullRomCurve3([from, mid, to]);
}

// ═══ STAR FIELD ═══

function buildStarField(): THREE.Points {
  const { count, size, depth } = SCENE_CONFIG.environment.starField;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * depth * 2;
    positions[i * 3 + 1] = Math.random() * 60 + 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity: SCENE_CONFIG.environment.starField.opacity,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// ═══ BAY WATER PLANE ═══

function buildBayWater(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(300, 200);
  const mat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(SCENE_CONFIG.bay.waterColor),
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -8, -80);
  return mesh;
}

// ═══ CITY LIGHTS HORIZON ═══

function buildCityLights(): THREE.Points {
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = Math.random() * 8 - 10;
    positions[i * 3 + 2] = -60 - Math.random() * 40;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(SCENE_CONFIG.bay.cityLights.color),
    size: 0.25,
    transparent: true,
    opacity: SCENE_CONFIG.bay.cityLights.intensity,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// ═══ FLOOR ═══

function buildFloor(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(40, 40);
  const mat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  return mesh;
}

// ═══ DISSOLUTION PARTICLES ═══

function buildDissolveParticles(position: THREE.Vector3, color: THREE.Color): THREE.Points {
  const count = 200;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.2 * (0.8 + Math.random() * 0.2);
    positions[i * 3]     = position.x + r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = position.z + r * Math.cos(phi);
    sizes[i] = Math.random() * 6 + 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.08,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// ═══ MAIN SCENE COMPONENT ═══

export function ElPanoramaScene() {
  const { state, transitionToKanban, endCouncil } = useApp();
  const mountRef = useRef<HTMLDivElement>(null);

  // Scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshesRef = useRef<Map<SphereId, SphereMesh>>(new Map());
  const subSphereMeshesRef = useRef<Map<string, SubSphereMesh>>(new Map());
  const arcMeshesRef = useRef<ArcMesh[]>([]);
  const animFrameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const councilBeamRef = useRef<THREE.Mesh | null>(null);
  const councilTextRef = useRef<THREE.Group | null>(null);

  // Track current state in ref for animation loop
  const stateRef = useRef(state);
  stateRef.current = state;

  const buildSphereMesh = useCallback((id: SphereId): SphereMesh => {
    const identity = SPHERE_IDENTITIES[id];
    const tablePos2d = TABLE_POSITIONS[identity.tablePosition];
    const baseRadius = SCENE_CONFIG.spheres.baseRadius * identity.size;
    const colorNum = hexToNumber(identity.color);
    const tablePos = new THREE.Vector3(tablePos2d.x, SCENE_CONFIG.spheres.floatHeight, tablePos2d.z);

    const group = new THREE.Group();
    group.position.copy(tablePos);

    // Core sphere
    const coreGeo = createSphereGeom(baseRadius);
    const coreMat = new THREE.MeshPhongMaterial({
      color: colorNum,
      emissive: colorNum,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: SCENE_CONFIG.spheres.innerGlow.opacity,
      shininess: 80,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Halo
    const haloGeo = createSphereGeom(baseRadius * SCENE_CONFIG.spheres.outerHalo.scale);
    const haloMat = createGlowMaterial(colorNum, SCENE_CONFIG.spheres.outerHalo.opacity);
    haloMat.side = THREE.BackSide;
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // Tescito (tea glass) placed on table
    const tescito = buildTescitoGroup(identity.tescito);

    return {
      id,
      group,
      core,
      halo,
      tescito,
      tablePos,
      currentPos: tablePos.clone(),
      targetPos: tablePos.clone(),
      pulsePhase: Math.random() * Math.PI * 2,
      status: 'activa',
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── SCENE SETUP ──
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(SCENE_CONFIG.environment.backgroundColor);
    scene.fog = new THREE.Fog(
      SCENE_CONFIG.environment.fogColor,
      SCENE_CONFIG.environment.fogNear,
      SCENE_CONFIG.environment.fogFar
    );

    // ── CAMERA ──
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      500
    );
    const cp = SCENE_CONFIG.camera.defaultPosition;
    camera.position.set(cp.x, cp.y, cp.z);
    camera.lookAt(new THREE.Vector3(
      SCENE_CONFIG.camera.defaultTarget.x,
      SCENE_CONFIG.camera.defaultTarget.y,
      SCENE_CONFIG.camera.defaultTarget.z,
    ));
    cameraRef.current = camera;

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── LIGHTS ──
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color(SCENE_CONFIG.environment.ambientLight.color),
      SCENE_CONFIG.environment.ambientLight.intensity
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    dirLight.position.set(5, 15, 10);
    scene.add(dirLight);

    // ── ENVIRONMENT ──
    scene.add(buildStarField());
    scene.add(buildBayWater());
    scene.add(buildCityLights());
    scene.add(buildFloor());

    // ── TABLES + CANDLES + SPHERES ──
    const sphereIds = Object.keys(SPHERE_IDENTITIES) as SphereId[];
    sphereIds.forEach((id) => {
      const identity = SPHERE_IDENTITIES[id];
      const tp = TABLE_POSITIONS[identity.tablePosition];

      // Table
      const table = buildTableGeom();
      table.position.set(tp.x, 0, tp.z);
      scene.add(table);

      // Candle light
      scene.add(makeCandleLight(SCENE_CONFIG.restaurant.candleGlow.color, tp.x, tp.z));

      // Tescito on table
      const tescito = buildTescitoGroup(identity.tescito);
      tescito.position.set(tp.x, 0, tp.z);
      scene.add(tescito);

      // Sphere
      const mesh = buildSphereMesh(id);
      scene.add(mesh.group);
      sphereMeshesRef.current.set(id, mesh);
    });

    // ── RESIZE HANDLER ──
    const onResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── ANIMATION LOOP ──
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const s = stateRef.current;

      // Orbit camera slowly
      const orbitAngle = elapsed * SCENE_CONFIG.camera.orbitSpeed;
      const camDist = Math.sqrt(cp.x * cp.x + cp.z * cp.z) || 18;
      camera.position.x = Math.sin(orbitAngle) * camDist;
      camera.position.z = Math.cos(orbitAngle) * camDist;
      camera.position.y = cp.y;
      camera.lookAt(new THREE.Vector3(0, 2, 0));

      // Animate each sphere
      sphereMeshesRef.current.forEach((mesh) => {
        const status = s.sphereStatuses[mesh.id];
        const isCouncil = s.councilActive && status === 'en_consejo';

        // Pulse logic
        let pulseSpeed = SCENE_CONFIG.spheres.pulseSpeed;
        if (status === 'trabajando') pulseSpeed = 1.8;
        if (status === 'descansando') pulseSpeed = 0.3;
        if (status === 'bloqueada') pulseSpeed = 2.5 + Math.sin(elapsed * 8) * 1.5;

        const pulse = Math.sin(elapsed * pulseSpeed + mesh.pulsePhase) * SCENE_CONFIG.spheres.pulseAmplitude;
        mesh.group.position.y = SCENE_CONFIG.spheres.floatHeight + pulse;

        // Council gather — move toward center
        if (isCouncil) {
          const councilPos = SCENE_CONFIG.council.gatherPosition;
          const angle = (Array.from(sphereMeshesRef.current.keys()).indexOf(mesh.id) / 6) * Math.PI * 2;
          const r = SCENE_CONFIG.council.formationRadius;
          mesh.targetPos.set(
            councilPos.x + Math.cos(angle) * r,
            councilPos.y,
            councilPos.z + Math.sin(angle) * r
          );
        } else {
          mesh.targetPos.copy(mesh.tablePos);
        }

        // Lerp to target
        mesh.group.position.x += (mesh.targetPos.x - mesh.group.position.x) * 0.05;
        mesh.group.position.z += (mesh.targetPos.z - mesh.group.position.z) * 0.05;

        // Opacity / halo
        const coreMat = mesh.core.material as THREE.MeshPhongMaterial;
        const haloMat = mesh.halo.material as THREE.MeshBasicMaterial;
        const baseOpacity = status === 'descansando' ? 0.6 : 1.0;
        const haloTarget = isCouncil ? 0.6 : status === 'trabajando' ? 0.4 : 0.25;

        coreMat.opacity = baseOpacity;
        haloMat.opacity = haloTarget * (0.8 + 0.2 * Math.sin(elapsed * 2));

        // Council gold emissive override
        if (isCouncil) {
          coreMat.emissive.set(new THREE.Color('#ffd060'));
          coreMat.emissiveIntensity = 0.8 + 0.2 * Math.sin(elapsed * 3);
        } else {
          coreMat.emissive.set(new THREE.Color(SPHERE_IDENTITIES[mesh.id].color));
          coreMat.emissiveIntensity = 0.6;
        }
      });

      // Animate sub-sphere meshes
      subSphereMeshesRef.current.forEach((sub, id) => {
        if (sub.status === 'dissolving' && sub.particles) {
          const now = performance.now();
          const t = Math.min((now - (sub.particleStartTime ?? now)) / 1200, 1);
          const mat = sub.particles.material as THREE.PointsMaterial;
          mat.opacity = 1 - t;

          // Drift particles upward
          const pos = sub.particles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < pos.count; i++) {
            pos.setY(i, pos.getY(i) + 0.003);
          }
          pos.needsUpdate = true;

          if (t >= 1) {
            scene.remove(sub.group);
            scene.remove(sub.particles);
            subSphereMeshesRef.current.delete(id);
          }
        } else if (sub.status === 'working') {
          // Float bob
          sub.group.position.y = sub.targetPos.y + Math.sin(elapsed * 1.5 + parseInt(id, 36) * 0.5) * 0.05;
        }
      });

      // Council beam
      if (s.councilActive && councilBeamRef.current) {
        const beam = councilBeamRef.current;
        const beamMat = beam.material as THREE.MeshBasicMaterial;
        beamMat.opacity = 0.3 + 0.3 * Math.abs(Math.sin(elapsed * 2));
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      rendererRef.current = null;
      sphereMeshesRef.current.clear();
    };
  }, [buildSphereMesh]);

  // ── React to council state changes ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (state.councilActive) {
      soundSystem.playEvent('council_start');
      soundSystem.setCouncilMode(true);
      // Add council beam
      const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 20, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(SCENE_CONFIG.council.decisionBeam.color),
        transparent: true,
        opacity: 0.4,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 10, 0);
      scene.add(beam);
      councilBeamRef.current = beam;
    } else {
      soundSystem.setCouncilMode(false);
      if (councilBeamRef.current) {
        scene.remove(councilBeamRef.current);
        councilBeamRef.current = null;
      }
    }
  }, [state.councilActive]);

  // ── React to sub-agent changes ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Spawn new sub-agents
    state.subAgents.forEach((sa) => {
      if (subSphereMeshesRef.current.has(sa.id)) return;

      const parentIdentity = SPHERE_IDENTITIES[sa.parentId];
      const subColor = lightenColor(parentIdentity.color, 0.4);
      const subColorNum = hexToNumber(subColor);
      const subRadius = SCENE_CONFIG.spheres.baseRadius * SCENE_CONFIG.spheres.subSphere.radiusFactor * parentIdentity.size;

      const group = new THREE.Group();
      const coreGeo = createSphereGeom(subRadius);
      const coreMat = new THREE.MeshPhongMaterial({
        color: subColorNum, emissive: subColorNum, emissiveIntensity: 0.5, transparent: true, opacity: 0.85,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      const haloGeo = createSphereGeom(subRadius * 1.5);
      const haloMat = createGlowMaterial(subColorNum, 0.2);
      haloMat.side = THREE.BackSide;
      const halo = new THREE.Mesh(haloGeo, haloMat);
      group.add(halo);

      // Start at parent position
      const parentMesh = sphereMeshesRef.current.get(sa.parentId);
      const startPos = parentMesh?.group.position.clone() ?? new THREE.Vector3(0, 1, 0);
      group.position.copy(startPos);

      const targetPos = new THREE.Vector3(sa.position.x, sa.position.y, sa.position.z);
      scene.add(group);

      subSphereMeshesRef.current.set(sa.id, {
        id: sa.id,
        parentId: sa.parentId,
        group,
        core,
        halo,
        targetPos,
        status: sa.status,
      });

      soundSystem.playEvent('sphere_activate');
    });

    // Handle dissolving
    state.subAgents.forEach((sa) => {
      const existing = subSphereMeshesRef.current.get(sa.id);
      if (!existing || existing.status === sa.status) return;

      if (sa.status === 'dissolving' && existing.status !== 'dissolving') {
        // Start dissolution
        const particles = buildDissolveParticles(
          existing.group.position,
          new THREE.Color(SPHERE_IDENTITIES[existing.parentId].color)
        );
        scene.add(particles);
        existing.particles = particles;
        existing.particleStartTime = performance.now();
        existing.status = 'dissolving';
        scene.remove(existing.group);
        soundSystem.playEvent('sub_dissolve');
      } else {
        existing.status = sa.status;
      }
    });
  }, [state.subAgents]);

  return (
    <div className="el-panorama-root">
      <div ref={mountRef} className="three-canvas" />
      {/* Back to Kanban button */}
      <button
        className="btn-return-kanban"
        onClick={() => {
          endCouncil();
          transitionToKanban();
        }}
      >
        ← LA VISTA
      </button>
    </div>
  );
}
