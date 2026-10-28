import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PARTES } from './partes.js';

const $ = (id) => document.getElementById(id);
const rico = (t) => t.split('**').map((s, i) => (i % 2 ? el('mark', 'clave', s) : s));
const el = (tag, cls, ...hijos) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...hijos);
  return e;
};

/* ---------- Ventana emergente ---------- */
const ventana = $('ventana');
let seleccion = null;

function mostrarVideo(v, lista) {
  const portada = el('button', 'v-portada');
  portada.type = 'button';
  portada.setAttribute('aria-label', 'Reproducir: ' + v.titulo);
  const img = el('img');
  img.src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
  img.alt = '';
  portada.append(img, el('span', 'v-play'));
  portada.onclick = () => {
    const f = el('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
    f.title = v.titulo;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    $('v-reproductor').replaceChildren(f);
  };
  $('v-reproductor').replaceChildren(portada);
  lista.forEach((b) => b.toggleAttribute('aria-current', b.dataset.id === v.id));
}

function abrir(parte) {
  seleccion = parte.id;
  ventana.style.setProperty('--c', parte.color);
  $('v-titulo').textContent = parte.nombre;
  $('v-resumen').textContent = parte.resumen || '';

  const videos = parte.videos || [];
  $('v-videos').hidden = !videos.length;
  const botones = videos.map((v) => {
    const b = el('button', 'v-item', el('span', null, v.titulo));
    b.type = 'button';
    b.dataset.id = v.id;
    b.onclick = () => mostrarVideo(v, botones);
    return b;
  });
  $('v-lista').replaceChildren(...botones.map((b) => el('li', null, b)));
  if (videos.length) mostrarVideo(videos[0], botones);

  const texto = $('v-texto');
  texto.replaceChildren();
  if (!parte.secciones) texto.append(el('p', 'v-vacio', 'El contenido de esta región está en preparación.'));
  (parte.secciones || []).forEach((s, i) => {
    const d = el('details', 'v-seccion', el('summary', null, s.titulo));
    d.open = i === 0;
    (s.parrafos || []).forEach((p) => d.append(el('p', null, ...rico(p))));
    if (s.items) d.append(el('dl', null, ...s.items.flatMap(([t, x]) => [el('dt', null, ...rico(t)), el('dd', null, ...rico(x))])));
    texto.append(d);
  });
  if (parte.aviso) texto.append(el('p', 'v-aviso', parte.aviso));
  if (parte.referencias) {
    const r = el('details', 'v-seccion', el('summary', null, 'Referencias'));
    parte.referencias.forEach((x) => {
      const a = el('a', null, 'Ver artículo');
      a.href = x.url; a.target = '_blank'; a.rel = 'noopener';
      r.append(el('p', 'v-ref', x.texto + ' ', a));
    });
    texto.append(r);
  }
  ventana.showModal();
  $('v-cuerpo').scrollTop = 0;
}

ventana.addEventListener('close', () => {
  $('v-reproductor').replaceChildren(); // detiene el video
  seleccion = null;
});
ventana.addEventListener('click', (e) => { if (e.target === ventana) ventana.close(); });
$('v-cerrar').onclick = () => ventana.close();

/* ---------- Leyenda ---------- */
let hover = null;
PARTES.forEach((p) => {
  const b = el('button', 'chip', el('span', 'punto'), p.nombre);
  b.type = 'button';
  b.style.setProperty('--c', p.color);
  b.onclick = () => abrir(p);
  b.onpointerenter = b.onfocus = () => { hover = p.id; };
  b.onpointerleave = b.onblur = () => { hover = null; };
  $('lista-partes').append(el('li', null, b));
});

/* ---------- Escena 3D ---------- */
const estado = $('estado');
try {
  const lienzo = $('lienzo');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  lienzo.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let girar = !sinMovimiento;
  controls.autoRotateSpeed = 0.8;
  controls.addEventListener('start', () => { girar = false; });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2c4a3a, 1.2));
  const luz = new THREE.DirectionalLight(0xffffff, 2.2);
  luz.position.set(4, 6, 5);
  const relleno = new THREE.DirectionalLight(0xd3ecdf, 0.9);
  relleno.position.set(-5, 2, -4);
  scene.add(luz, relleno);

  const porNodo = new Map(PARTES.map((p) => [p.nodo, p]));
  const materiales = new Map();
  const mallas = [];

  let tam = null;
  let base = 0;
  const encuadrar = () => {
    if (!tam) return;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const nueva = Math.max(tam.y / 2 / t, tam.x / 2 / (t * camera.aspect)) * 1.3 + tam.z / 2;
    const rel = base ? camera.position.length() / base : 1;
    base = nueva;
    camera.position.setLength(rel * base);
    camera.near = base / 100;
    camera.far = base * 10;
    camera.updateProjectionMatrix();
    controls.minDistance = base * 0.35;
    controls.maxDistance = base * 2.2;
  };
  const ajustar = () => {
    const w = lienzo.clientWidth, h = lienzo.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    encuadrar();
  };
  new ResizeObserver(ajustar).observe(lienzo);

  new GLTFLoader().loadAsync('models/brain.glb').then((gltf) => {
    const modelo = gltf.scene;
    modelo.traverse((o) => {
      if (o.isLine) { o.visible = false; return; } // aristas de SketchUp
      if (!o.isMesh) return;
      let n = o, parte = null;
      while (n && !(parte = porNodo.get(n.name))) n = n.parent;
      if (!parte) return;
      if (!materiales.has(parte.id)) {
        materiales.set(parte.id, new THREE.MeshStandardMaterial({
          color: parte.color, emissive: parte.color, emissiveIntensity: 0,
          roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide,
        }));
      }
      o.material = materiales.get(parte.id);
      o.userData.parte = parte;
      mallas.push(o);
    });
    const caja = new THREE.Box3().setFromObject(modelo);
    modelo.position.sub(caja.getCenter(new THREE.Vector3()));
    tam = caja.getSize(new THREE.Vector3());
    scene.add(modelo);
    camera.position.set(0.35, 0.18, 1);
    encuadrar();
    estado.hidden = true;
  }).catch(() => {
    estado.textContent = 'No se pudo cargar el modelo. Si abriste el archivo con doble clic, prueba desde GitHub Pages o con un servidor local. Mientras tanto puedes usar la lista de regiones.';
  });

  /* Clic y hover sobre el modelo */
  const rayo = new THREE.Raycaster();
  const punto = new THREE.Vector2();
  const parteBajo = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    punto.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(punto, camera);
    const hit = rayo.intersectObjects(mallas, false)[0];
    return hit ? hit.object.userData.parte : null;
  };
  let inicio = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { inicio = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!inicio || Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 6) return;
    const p = parteBajo(e);
    if (p) abrir(p);
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.buttons) return;
    const p = parteBajo(e);
    hover = p ? p.id : null;
    renderer.domElement.style.cursor = p ? 'pointer' : 'grab';
    $('etiqueta').hidden = !p;
    if (p) {
      $('etiqueta').textContent = p.nombre;
      $('etiqueta').style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
    }
  });
  renderer.domElement.addEventListener('pointerleave', () => { hover = null; $('etiqueta').hidden = true; });

  renderer.setAnimationLoop(() => {
    controls.autoRotate = girar && !hover && !ventana.open;
    controls.update();
    materiales.forEach((m, id) => {
      const meta = seleccion === id ? 0.55 : hover === id ? 0.35 : 0;
      m.emissiveIntensity += (meta - m.emissiveIntensity) * 0.18;
    });
    renderer.render(scene, camera);
  });
} catch (err) {
  estado.textContent = 'Tu navegador no pudo iniciar el modelo 3D (WebGL). Puedes explorar las regiones desde la lista.';
}
