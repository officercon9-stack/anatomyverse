
(function () {
  'use strict';
  var META = [{"id":"hippocampus_r","label":"Hippocampus (right)","group":"Deep structures","side":"right","c":[-27.1,-11.8,9.6],"tris":1020},{"id":"hippocampus_l","label":"Hippocampus (left)","group":"Deep structures","side":"left","c":[27.5,-11.7,9.0],"tris":980},{"id":"pituitary","label":"Pituitary gland","group":"Deep structures","side":"mid","c":[0.2,-21.4,34.8],"tris":1164},{"id":"hypothalamus","label":"Hypothalamus","group":"Deep structures","side":"mid","c":[0.1,-8.6,29.8],"tris":5684},{"id":"lat_vent_r","label":"Lateral ventricle (right)","group":"Ventricles","side":"right","c":[-17.1,5.1,13.2],"tris":18016},{"id":"lat_vent_l","label":"Lateral ventricle (left)","group":"Ventricles","side":"left","c":[17.2,5.3,13.1],"tris":17968},{"id":"third_vent","label":"Third ventricle","group":"Ventricles","side":"mid","c":[0.1,0.6,17.2],"tris":3870},{"id":"fourth_vent","label":"Fourth ventricle","group":"Ventricles","side":"mid","c":[0.1,-43.1,-7.5],"tris":6940},{"id":"aqueduct","label":"Cerebral aqueduct","group":"Ventricles","side":"mid","c":[0.3,-11.6,5.2],"tris":518},{"id":"cerebellum","label":"Cerebellum","group":"Hindbrain","side":"mid","c":[0.0,-37.9,-26.0],"tris":47700},{"id":"midbrain","label":"Midbrain","group":"Brainstem","side":"mid","c":[0.1,-12.5,8.6],"tris":13624},{"id":"pons","label":"Pons","group":"Brainstem","side":"mid","c":[0.2,-34.2,9.1],"tris":20650},{"id":"medulla","label":"Medulla oblongata","group":"Brainstem","side":"mid","c":[0.4,-56.9,-1.7],"tris":12096},{"id":"frontal_r","label":"Frontal lobe (right)","group":"Cerebrum","side":"right","c":[-26.6,41.5,36.3],"tris":17110},{"id":"frontal_l","label":"Frontal lobe (left)","group":"Cerebrum","side":"left","c":[27.1,41.4,36.9],"tris":17200},{"id":"parietal_r","label":"Parietal lobe (right)","group":"Cerebrum","side":"right","c":[-31.6,32.3,-35.2],"tris":15112},{"id":"parietal_l","label":"Parietal lobe (left)","group":"Cerebrum","side":"left","c":[32.0,32.4,-35.3],"tris":14900},{"id":"temporal_r","label":"Temporal lobe (right)","group":"Cerebrum","side":"right","c":[-39.9,-16.9,4.4],"tris":8030},{"id":"temporal_l","label":"Temporal lobe (left)","group":"Cerebrum","side":"left","c":[40.8,-16.7,3.5],"tris":7732},{"id":"occipital_r","label":"Occipital lobe (right)","group":"Cerebrum","side":"right","c":[-18.9,-9.3,-54.8],"tris":4564},{"id":"occipital_l","label":"Occipital lobe (left)","group":"Cerebrum","side":"left","c":[18.4,-9.0,-54.9],"tris":4390},{"id":"insula_r","label":"Insula (right)","group":"Cerebrum","side":"right","c":[-36.6,14.2,28.5],"tris":2448},{"id":"insula_l","label":"Insula (left)","group":"Cerebrum","side":"left","c":[37.0,14.6,28.5],"tris":2448},{"id":"deep_r","label":"Deep cerebral structures (right)","group":"Deep structures","side":"right","c":[-24.6,17.0,2.8],"tris":39600},{"id":"deep_l","label":"Deep cerebral structures (left)","group":"Deep structures","side":"left","c":[24.9,16.8,2.8],"tris":38698},{"id":"brain_other","label":"Other brain parts","group":"Deep structures","side":"mid","c":[0.1,-4.6,-3.5],"tris":964},{"id":"circle","label":"Cerebral arterial circle","group":"Blood vessels","side":"mid","c":[0.8,-17.1,30.9],"tris":1052},{"id":"spinal","label":"Spinal cord (upper)","group":"Brainstem","side":"mid","c":[0.2,-75.4,-13.6],"tris":728},{"id":"neurocranium","label":"Neurocranium (skull vault and base)","group":"Skull","side":"mid","c":[-0.1,-0.4,17.5],"tris":85312}];

  /* ---------- teaching notes (pending expert review) ---------- */
  var INFO = {
    frontal: { where: 'Front of each hemisphere, ahead of the central sulcus.', fn: 'Planning, decision making and voluntary movement. The primary motor cortex lies in its precentral gyrus, and in the dominant hemisphere Broca’s area helps produce speech.', clin: 'Damage can change personality, judgement and motivation, and cause weakness on the opposite side of the body.' },
    parietal: { where: 'Top and back of each hemisphere, between the central sulcus and the occipital lobe.', fn: 'Processes touch, pain and body position (primary somatosensory cortex in the postcentral gyrus) and builds awareness of space.', clin: 'Damage can cause neglect of one side of space, or trouble reading and calculating when the dominant side is affected.' },
    temporal: { where: 'Side of each hemisphere, below the lateral sulcus.', fn: 'Hearing (primary auditory cortex), understanding speech (Wernicke’s area, dominant side), recognising objects and faces, and memory together with the hippocampus.', clin: 'A common origin of epileptic seizures. Damage can make speech hard to understand.' },
    occipital: { where: 'Back of each hemisphere.', fn: 'Receives and first processes visual information. The primary visual cortex (area V1) lies along the calcarine sulcus.', clin: 'Damage causes loss of vision in part of the opposite visual field.' },
    insula: { where: 'Folded cortex hidden deep inside the lateral sulcus.', fn: 'Linked to taste, sensing the state of the body (interoception), pain and emotion.', clin: '' },
    hippocampus: { where: 'Curved structure on the inner surface of the temporal lobe.', fn: 'Helps form new long-term memories and supports spatial navigation.', clin: 'Among the first regions affected in Alzheimer’s disease. Loss on both sides causes severe difficulty forming new memories.' },
    pituitary: { where: 'Pea-sized gland in a hollow of the sphenoid bone (sella turcica), under the hypothalamus.', fn: 'Releases hormones that control growth, thyroid and adrenal glands, reproduction and water balance.', clin: 'Tumours can press on the optic chiasm and cause loss of the outer parts of both visual fields.' },
    hypothalamus: { where: 'Below the thalamus, forming the floor and lower walls of the third ventricle.', fn: 'Regulates body temperature, hunger, thirst, sleep cycles and hormone release through the pituitary.', clin: '' },
    ventricle_lat: { where: 'C-shaped cavity inside each cerebral hemisphere.', fn: 'Makes and holds cerebrospinal fluid (CSF), produced by the choroid plexus. Each drains to the third ventricle through an interventricular foramen.', clin: 'Blocked drainage lets CSF build up and causes hydrocephalus.' },
    third_vent: { where: 'Narrow midline slit between the two halves of the thalamus.', fn: 'Receives CSF from both lateral ventricles and passes it on through the cerebral aqueduct.', clin: '' },
    aqueduct: { where: 'Narrow canal running through the midbrain.', fn: 'Joins the third ventricle to the fourth ventricle.', clin: 'Because it is so narrow it is a common place for a blockage (aqueductal stenosis) leading to hydrocephalus.' },
    fourth_vent: { where: 'Diamond-shaped cavity behind the pons and medulla, in front of the cerebellum.', fn: 'CSF leaves the ventricles here, through the median and lateral apertures, and enters the space around the brain and spinal cord.', clin: '' },
    cerebellum: { where: 'Behind the brainstem, under the occipital lobes.', fn: 'Coordinates movement, balance and the timing of fine motor actions. It contains more than half of all the neurons in the brain.', clin: 'Damage causes unsteady walking and clumsy movements, usually on the same side as the damage.' },
    midbrain: { where: 'Uppermost part of the brainstem.', fn: 'Controls eye movements and visual and auditory reflexes. Its substantia nigra contains dopamine-producing neurons.', clin: 'Loss of those neurons causes Parkinson’s disease.' },
    pons: { where: 'Middle part of the brainstem, in front of the cerebellum.', fn: 'Relays signals between the cerebrum and cerebellum, contains nuclei of several cranial nerves and helps regulate breathing rhythm and sleep.', clin: '' },
    medulla: { where: 'Lowest part of the brainstem, continuing into the spinal cord.', fn: 'Controls heart rate, breathing and reflexes such as swallowing and coughing. Most motor fibres cross to the opposite side here.', clin: 'Damage can be life threatening because it houses vital centres.' },
    deep: { where: 'Deep inside each cerebral hemisphere.', fn: 'In this model it groups the white matter (the fibre bundles linking cortical areas) and other deep structures. The exact contents follow the grouping of the source model.', clin: '' },
    other: { where: 'Scattered small pieces.', fn: 'Remaining small parts of the source brain model that do not belong to the structures listed above.', clin: '' },
    circle: { where: 'Ring of arteries on the underside of the brain.', fn: 'The circle of Willis links the carotid and basilar blood supplies, giving back-up routes if one vessel narrows.', clin: 'A common site for berry aneurysms.' },
    spinal: { where: 'Upper end of the spinal cord, below the medulla.', fn: 'Carries signals between the brain and the body.', clin: '' },
    neurocranium: { where: 'Bones that enclose the brain.', fn: 'The skull vault and base protect the brain and anchor the membranes around it. Facial bones are not included in this viewer.', clin: 'A fracture of the base can tear the meninges and let CSF leak.' }
  };
  function infoFor(id) {
    if (id.indexOf('frontal') === 0) return INFO.frontal;
    if (id.indexOf('parietal') === 0) return INFO.parietal;
    if (id.indexOf('temporal') === 0) return INFO.temporal;
    if (id.indexOf('occipital') === 0) return INFO.occipital;
    if (id.indexOf('insula') === 0) return INFO.insula;
    if (id.indexOf('hippocampus') === 0) return INFO.hippocampus;
    if (id.indexOf('lat_vent') === 0) return INFO.ventricle_lat;
    if (id.indexOf('deep') === 0) return INFO.deep;
    if (id === 'brain_other') return INFO.other;
    return INFO[id] || { where: '', fn: '', clin: '' };
  }
  var COLORS = {
    frontal: 0x5B8DEF, parietal: 0x4FC48A, temporal: 0xF2A93B, occipital: 0xA56BE0, insula: 0x2CC3C3,
    cerebellum: 0xD9B38C, midbrain: 0xE07A5F, pons: 0xE8967A, medulla: 0xF0B1A0, spinal: 0xF4D6A0,
    hippocampus: 0xE86AA6, pituitary: 0xFF8A3D, hypothalamus: 0xFFB454, lat_vent: 0x3FD0FF, third_vent: 0x3FD0FF,
    fourth_vent: 0x3FD0FF, aqueduct: 0x3FD0FF, circle: 0xE5384F, deep: 0xC9CFD9, brain_other: 0x9AA7B8, neurocranium: 0xE8DFCB
  };
  function colorFor(id) {
    var keys = Object.keys(COLORS);
    for (var i = 0; i < keys.length; i++) if (id.indexOf(keys[i]) === 0) return COLORS[keys[i]];
    return 0xBBBBBB;
  }
  var BASE_OP = { neurocranium: 0.14 };

  var $ = function (id) { return document.getElementById(id); };
  var byId = {};
  META.forEach(function (m) { byId[m.id] = m; });

  /* ---------- three.js setup ---------- */
  var stage = $('stage');
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  stage.insertBefore(renderer.domElement, stage.firstChild);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 5, 3000);
  camera.position.set(250, 140, 320);
  scene.add(camera);
  camera.add(new THREE.HemisphereLight(0xffffff, 0x556677, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(0.6, 1, 1.2); camera.add(key);
  var fill = new THREE.DirectionalLight(0xbcd6ff, 0.35); fill.position.set(-1, -0.4, 0.5); camera.add(fill);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minDistance = 90; controls.maxDistance = 900; controls.target.set(0, 0, 0);
  controls.autoRotateSpeed = 1.2;

  var clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);
  var mats = {}, meshes = {}, state = {};
  META.forEach(function (m) {
    state[m.id] = { vis: true, ghost: false, offset: new THREE.Vector3() };
  });
  var selected = null, hovered = null;
  var sceneId = 'none', playing = false, t = 0, speed = 1;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
  resize();

  /* particles for CSF flow */
  var dotTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  var NP = 16;
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  var pMat = new THREE.PointsMaterial({ map: dotTex, color: 0x9FF6FF, size: 7, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  var points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; points.visible = false; points.renderOrder = 10;
  scene.add(points);

  /* ---------- load ---------- */
  function b64ToBuf(b64) {
    var bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }
  function fail() { $('loading').innerHTML = '<b>The 3D models could not be loaded</b><span>Check your connection and reload the page.</span>'; }
  var loaded = false;
  if (!window.BRAIN_GLB_B64) { fail(); } else new THREE.GLTFLoader().parse(b64ToBuf(window.BRAIN_GLB_B64), '', function (gltf) {
    var found = [];
    gltf.scene.traverse(function (o) { if (o.isMesh) found.push(o); });
    found.forEach(function (o) {
      var id = o.name; if (!byId[id]) return;
      o.geometry.computeVertexNormals();
      var op = BASE_OP[id] !== undefined ? BASE_OP[id] : 1;
      var isVent = /vent|aqueduct/.test(id);
      var mat = new THREE.MeshStandardMaterial({
        color: colorFor(id), roughness: isVent ? 0.3 : 0.55, metalness: 0.0, side: THREE.DoubleSide,
        transparent: true, opacity: op, clippingPlanes: [clip], emissive: 0x000000, emissiveIntensity: 0
      });
      mat.userData.baseColor = new THREE.Color(colorFor(id));
      o.material = mat; mats[id] = mat; meshes[id] = o; o.userData.id = id;
      scene.add(o);
    });
    $('loading').hidden = true;
    resize(); buildList(); setPreset('brain'); setView('front', true);
    loaded = true;
  }, fail);

  /* ---------- views ---------- */
  var VIEWS = { front: [0, 20, 1], back: [0, 20, -1], right: [-1, 20, 0.0001], left: [1, 20, 0.0001], top: [0, 1, 0.0001], bottom: [0, -1, 0.0001] };
  var camAnim = null;
  function setView(name, instant) {
    var v = VIEWS[name]; if (!v) return;
    var d = new THREE.Vector3(v[0], v[1], v[2]);
    if (name === 'front' || name === 'back' || name === 'left' || name === 'right') d.y = 0.25 * Math.max(Math.abs(d.x), Math.abs(d.z));
    var dist = 340 * Math.max(1, 1.25 / camera.aspect);
    d.normalize().multiplyScalar(dist);
    if (name === 'front' && instant) d.set(0.55, 0.3, 0.8).normalize().multiplyScalar(dist);
    if (instant || reduceMotion) { camera.position.copy(d); controls.update(); return; }
    camAnim = { from: camera.position.clone(), to: d, t0: performance.now(), dur: 650 };
  }
  $('views').addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) setView(b.dataset.v); });
  var spin = $('spin');
  spin.addEventListener('click', function () {
    controls.autoRotate = !controls.autoRotate;
    spin.setAttribute('aria-pressed', String(controls.autoRotate));
  });

  /* ---------- structure list and visibility ---------- */
  var rowEls = {};
  function buildList() {
    var list = $('list'); list.textContent = '';
    var groups = {}, order = [];
    META.forEach(function (m) { if (!groups[m.group]) { groups[m.group] = []; order.push(m.group); } groups[m.group].push(m); });
    order.forEach(function (g, gi) {
      var d = document.createElement('details'); d.className = 'grp'; if (gi < 2) d.open = true;
      var s = document.createElement('summary'); s.textContent = g + ' (' + groups[g].length + ')'; d.appendChild(s);
      var rows = document.createElement('div'); rows.className = 'rows';
      groups[g].forEach(function (m) {
        var r = document.createElement('div'); r.className = 'row'; r.dataset.sel = 'false';
        var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = true; cb.setAttribute('aria-label', 'Show ' + m.label);
        cb.addEventListener('change', function () { state[m.id].vis = cb.checked; state[m.id].ghost = false; });
        var sw = document.createElement('span'); sw.className = 'sw'; sw.style.background = '#' + ('000000' + colorFor(m.id).toString(16)).slice(-6);
        var b = document.createElement('button'); b.type = 'button'; b.textContent = m.label;
        b.addEventListener('click', function () { select(selected === m.id ? null : m.id); });
        r.appendChild(cb); r.appendChild(sw); r.appendChild(b); rows.appendChild(r);
        rowEls[m.id] = { row: r, cb: cb };
      });
      d.appendChild(rows); list.appendChild(d);
    });
  }
  function syncChecks() { Object.keys(rowEls).forEach(function (id) { rowEls[id].cb.checked = state[id].vis; }); }

  var PRESETS = {
    brain: { show: function (m) { return m.group !== 'Skull'; } },
    skull: { show: function () { return true; } },
    midline: { show: function (m) { return m.group !== 'Skull'; }, cut: ['x', 0, false], view: 'right' },
    deep: { show: function (m) { return /^(hippocampus|pituitary|hypothalamus|lat_vent|third_vent|fourth_vent|aqueduct|midbrain|pons|medulla|circle|deep)/.test(m.id); }, ghost: /^(deep|circle)/ },
    stem: { show: function (m) { return /^(cerebellum|midbrain|pons|medulla|spinal|fourth_vent|aqueduct|circle)/.test(m.id); }, view: 'back' }
  };
  function setPreset(name) {
    var p = PRESETS[name]; if (!p) return;
    META.forEach(function (m) { var s = state[m.id]; s.vis = p.show(m); s.ghost = !!(p.ghost && p.ghost.test(m.id)); });
    if (p.cut) setCut(p.cut[0], p.cut[1], p.cut[2]); else setCut('', 0, false);
    if (name === 'skull') { $('skullOp').value = 14; }
    if (p.view) setView(p.view);
    select(null); syncChecks();
    Array.prototype.forEach.call(document.querySelectorAll('#presets .chip'), function (c) { c.setAttribute('aria-pressed', String(c.dataset.p === name)); });
    if (sceneId !== 'none') setScene('none');
  }
  $('presets').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b && loaded) setPreset(b.dataset.p); });
  $('showAll').addEventListener('click', function () {
    META.forEach(function (m) { state[m.id].vis = true; state[m.id].ghost = false; }); syncChecks();
  });
  $('clearSel').addEventListener('click', function () { select(null); });

  /* ---------- section cut and explode ---------- */
  var cutAxis = '', cutFlip = false;
  function setCut(axis, pos, flip) {
    cutAxis = axis; cutFlip = flip;
    $('cutAxis').value = axis; $('cutPos').value = pos;
    updateCut();
  }
  function updateCut() {
    var on = !!cutAxis, pos = +$('cutPos').value;
    $('cutPos').disabled = !on; $('cutFlip').disabled = !on;
    if (!on) { clip.normal.set(0, 1, 0); clip.constant = 1e6; $('cutVal').textContent = 'off'; return; }
    var sign = cutFlip ? -1 : 1, n = new THREE.Vector3();
    n[cutAxis] = sign; clip.normal.copy(n); clip.constant = -sign * pos;
    var names = { x: 'sagittal', y: 'horizontal', z: 'coronal' };
    $('cutVal').textContent = names[cutAxis] + ' ' + pos + ' mm';
  }
  $('cutAxis').addEventListener('change', function () { cutAxis = this.value; updateCut(); });
  $('cutPos').addEventListener('input', updateCut);
  $('cutFlip').addEventListener('click', function () { cutFlip = !cutFlip; updateCut(); });
  function updateExplode() {
    var a = +$('explode').value; $('expVal').textContent = a + ' mm';
    META.forEach(function (m) {
      var c = new THREE.Vector3(m.c[0], m.c[1], m.c[2]);
      var dir = m.id === 'neurocranium' ? new THREE.Vector3(0, 1, 0.25) : (c.length() < 4 ? new THREE.Vector3(0, 1, 0) : c.clone());
      dir.normalize(); state[m.id].offset.copy(dir).multiplyScalar(a * (m.id === 'neurocranium' ? 1.1 : 0.7));
    });
  }
  $('explode').addEventListener('input', updateExplode);
  $('skullOp').addEventListener('input', function () {
    BASE_OP.neurocranium = (+this.value) / 100; $('skVal').textContent = this.value + '%';
  });

  /* ---------- selection and picking ---------- */
  function select(id) {
    selected = id;
    Object.keys(rowEls).forEach(function (k) { rowEls[k].row.dataset.sel = String(k === id); });
    $('clearSel').disabled = !id;
    if (id && rowEls[id]) { var dd = rowEls[id].row.closest('details'); if (dd) dd.open = true; }
    var box = $('info'); box.textContent = '';
    if (!id) { var p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Tap any structure on the model or in the list below.'; box.appendChild(p); return; }
    var m = byId[id], n = infoFor(id);
    var h = document.createElement('h3'); h.textContent = m.label; box.appendChild(h);
    var tags = document.createElement('div'); tags.className = 'meta';
    [m.group, m.side === 'mid' ? 'midline' : m.side, m.tris.toLocaleString() + ' triangles'].forEach(function (x) { var s = document.createElement('span'); s.className = 'tag'; s.textContent = x; tags.appendChild(s); });
    box.appendChild(tags);
    function para(label, text, cls) {
      if (!text) return; var p = document.createElement('p'); if (cls) p.className = cls;
      if (label) { var b = document.createElement('b'); b.textContent = label; p.appendChild(b); if (cls) { p.appendChild(document.createTextNode(text)); } else { p.appendChild(document.createTextNode(' ' + text)); } }
      else p.textContent = text;
      box.appendChild(p);
    }
    para('Where:', n.where); para('Role:', n.fn); para('Clinical note', n.clin, 'clin');
    var a = document.createElement('div'); a.className = 'actions';
    var iso = document.createElement('button'); iso.type = 'button'; iso.className = 'btn'; iso.textContent = 'Isolate';
    iso.addEventListener('click', function () { META.forEach(function (x) { state[x.id].vis = x.id === id; state[x.id].ghost = false; }); syncChecks(); });
    var hid = document.createElement('button'); hid.type = 'button'; hid.className = 'btn'; hid.textContent = 'Hide';
    hid.addEventListener('click', function () { state[id].vis = false; syncChecks(); });
    a.appendChild(iso); a.appendChild(hid); box.appendChild(a);
  }

  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(ev) {
    var r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var list = [];
    Object.keys(meshes).forEach(function (id) { var m = meshes[id]; if (m.visible && m.material.opacity > 0.3) list.push(m); });
    var hits = ray.intersectObjects(list, false);
    for (var i = 0; i < hits.length; i++) {
      if (cutAxis && clip.distanceToPoint(hits[i].point) < 0) continue;
      return hits[i].object.userData.id;
    }
    return null;
  }
  var down = null;
  renderer.domElement.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', function (e) {
    if (!down || !loaded) return;
    var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 5) return;
    var id = pick(e); select(id);
  });
  var lastHover = 0, tip = $('tip');
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' || e.buttons || !loaded) return;
    var now = performance.now(); if (now - lastHover < 90) return; lastHover = now;
    hovered = pick(e);
    if (hovered) {
      var r = stage.getBoundingClientRect(); tip.hidden = false; tip.textContent = byId[hovered].label;
      tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px';
      renderer.domElement.style.cursor = 'pointer';
    } else { tip.hidden = true; renderer.domElement.style.cursor = ''; }
  });
  renderer.domElement.addEventListener('pointerleave', function () { hovered = null; tip.hidden = true; });

  /* ---------- 4D scenes ---------- */
  function win(t, a, b) { if (t <= a || t >= b) return 0; return Math.pow(Math.sin(Math.PI * (t - a) / (b - a)), 1.4); }
  function ramp(t, a, b) { var x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); }
  var SCENES = {
    signal: {
      dur: 10, glow: 0xFFC247, dim: 0.35,
      inv: /^(occipital|parietal|temporal|frontal|hippocampus)/,
      at: function (t) {
        var o = {};
        META.forEach(function (m) {
          var v = 0;
          if (m.id.indexOf('occipital') === 0) v = win(t, 0, 2.4);
          else if (m.id.indexOf('parietal') === 0) v = win(t, 1.8, 4.6);
          else if (m.id.indexOf('temporal') === 0) v = win(t, 1.8, 4.6);
          else if (m.id.indexOf('hippocampus') === 0) v = win(t, 3.4, 6.2);
          else if (m.id.indexOf('frontal') === 0) v = win(t, 4.4, 8.2);
          if (v) o[m.id] = v;
        });
        return o;
      },
      cap: function (t) {
        if (t < 1.8) return ['Step 1: seeing', 'Visual information from the eyes reaches the occipital lobes at the back of the brain, where primary visual cortex (V1) first processes it.'];
        if (t < 4.4) return ['Step 2: two streams', 'The dorsal stream runs to the parietal lobe (where an object is and how to reach it). The ventral stream runs to the temporal lobe (what the object is). The hippocampus starts to lay down memory.'];
        if (t < 8.4) return ['Step 3: deciding and acting', 'The frontal lobe combines the information, plans a response and, through the motor cortex, sends commands to move.'];
        return ['Rest', 'Activity settles before the cycle repeats.'];
      },
      note: 'Illustration of a typical order of processing, not recorded activity.'
    },
    csf: {
      dur: 12, glow: 0x6FF3FF, dim: 0.14,
      inv: /^(lat_vent|third_vent|aqueduct|fourth_vent|spinal)/,
      at: function (t) {
        var o = {};
        o.lat_vent_r = o.lat_vent_l = 0.25 + 0.75 * win(t, 0, 4.2);
        o.third_vent = win(t, 2.4, 6.4);
        o.aqueduct = win(t, 4.6, 8.0);
        o.fourth_vent = win(t, 6.4, 11.4);
        o.spinal = 0.8 * win(t, 8.8, 12);
        return o;
      },
      cap: function (t) {
        if (t < 2.6) return ['Made in the lateral ventricles', 'Choroid plexus in the lateral ventricles produces CSF, roughly half a litre a day.'];
        if (t < 4.8) return ['Into the third ventricle', 'CSF passes from each lateral ventricle through an interventricular foramen into the midline third ventricle.'];
        if (t < 6.6) return ['Through the cerebral aqueduct', 'A narrow canal through the midbrain carries CSF down to the fourth ventricle.'];
        if (t < 9.0) return ['Out of the fourth ventricle', 'CSF leaves through the median and lateral apertures into the space around the brain and spinal cord.'];
        return ['Around the brain and cord', 'It cushions the brain, then is absorbed back into the blood through arachnoid granulations.'];
      },
      note: 'Simplified flow path through the ventricles.'
    },
    pulse: {
      dur: 4.15, glow: 0xFF4D6D, dim: 0.3,
      inv: /^(circle)/,
      at: function (t) {
        var beat = 60 / 72, x = (t % beat) / beat;
        var v = x < 0.14 ? ramp(x, 0, 0.14) : Math.exp(-(x - 0.14) * 4.5);
        return { circle: v };
      },
      cap: function (t) {
        var beat = 60 / 72, x = (t % beat) / beat;
        return x < 0.35 ? ['Systole', 'Each heartbeat sends a pressure wave into the arteries of the circle of Willis.'] : ['Diastole', 'Pressure falls again between beats. At 72 beats a minute the cycle lasts 0.83 s.'];
      },
      note: 'The brain receives about 15% of the heart’s output at rest.'
    }
  };
  var sceneSel = $('scene'), playBtn = $('play'), scrub = $('scrub'), spdSel = $('speed');

  // CSF path points (scene units, mm)
  function C(id) { var m = byId[id]; return new THREE.Vector3(m.c[0], m.c[1], m.c[2]); }
  var csfCurves = null;
  function buildCurves() {
    if (csfCurves) return;
    var common = [C('third_vent'), C('aqueduct'), C('fourth_vent'), new THREE.Vector3(0, byId.fourth_vent.c[1] - 22, byId.fourth_vent.c[2] - 10)];
    csfCurves = ['lat_vent_r', 'lat_vent_l'].map(function (s) { return new THREE.CatmullRomCurve3([C(s)].concat(common)); });
  }
  function setScene(id) {
    sceneId = id; t = 0; playing = id !== 'none' && !reduceMotion;
    sceneSel.value = id;
    var on = id !== 'none';
    playBtn.disabled = !on; scrub.disabled = !on; spdSel.disabled = !on;
    playBtn.textContent = playing ? 'Pause' : 'Play';
    $('explode').disabled = on;
    if (on) { $('explode').value = 0; updateExplode(); buildCurves(); }
    $('caption').dataset.k = '';
    points.visible = id === 'csf';
    if (!on) $('caption').textContent = 'Choose a 4D scene to watch a process unfold over time on the 3D model.';
    if (on) {
      META.forEach(function (m) { if (m.group !== 'Skull') { state[m.id].vis = true; state[m.id].ghost = false; } else state[m.id].vis = false; });
      syncChecks(); select(null);
      Array.prototype.forEach.call(document.querySelectorAll('#presets .chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
      if (id === 'pulse') setView('bottom');
      if (id === 'signal') setView('left');
      setCut('', 0, false);
      if (id === 'csf') setView('right');
    }
  }
  sceneSel.addEventListener('change', function () { if (loaded) setScene(this.value); });
  playBtn.addEventListener('click', function () { playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; });
  spdSel.addEventListener('change', function () { speed = +this.value; });
  scrub.addEventListener('input', function () { if (sceneId === 'none') return; t = (+this.value) / 1000 * SCENES[sceneId].dur; });

  /* ---------- frame loop ---------- */
  var clock = new THREE.Clock(), glowColor = new THREE.Color();
  var tmp = new THREE.Vector3();
  function frame() {
    requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.1);
    if (camAnim) {
      var k = Math.min(1, (performance.now() - camAnim.t0) / camAnim.dur), e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(camAnim.from, camAnim.to, e);
      if (k >= 1) camAnim = null;
    }
    controls.update();
    if (!loaded) { renderer.render(scene, camera); return; }

    var S = sceneId !== 'none' ? SCENES[sceneId] : null, glow = {};
    if (S) {
      if (playing) { t += dt * speed; if (t > S.dur) t -= S.dur; }
      glow = S.at(t);
      scrub.value = Math.round(t / S.dur * 1000);
      $('tlTime').textContent = t.toFixed(1) + ' / ' + S.dur.toFixed(1) + ' s';
      var c = S.cap(t);
      var cap = $('caption');
      var html = c[0] + '|' + c[1];
      if (cap.dataset.k !== html) {
        cap.dataset.k = html; cap.textContent = '';
        var b = document.createElement('b'); b.textContent = c[0] + '. '; cap.appendChild(b); cap.appendChild(document.createTextNode(c[1]));
        var sm = document.createElement('small'); sm.textContent = S.note; cap.appendChild(sm);
      }
      glowColor.setHex(S.glow);
      if (sceneId === 'csf') updateParticles();
    } else {
      $('tlTime').textContent = '0.0 / 0.0 s';
    }

    Object.keys(meshes).forEach(function (id) {
      var m = meshes[id], s = state[id], mat = m.material;
      var op = BASE_OP[id] !== undefined ? BASE_OP[id] : 1;
      if (!s.vis) op = 0;
      if (s.ghost) op *= 0.22;
      if (selected && id !== selected) op *= 0.2;
      if (S && !S.inv.test(id)) op *= S.dim;
      mat.opacity = op;
      mat.depthWrite = op > 0.95;
      m.visible = op > 0.01;
      m.position.copy(s.offset);
      var g = glow[id] || 0;
      if (g > 0) { mat.emissive.copy(glowColor); mat.emissiveIntensity = g * 1.0; }
      else if (id === selected) { mat.emissive.copy(mat.userData.baseColor); mat.emissiveIntensity = 0.35; }
      else if (id === hovered) { mat.emissive.copy(mat.userData.baseColor); mat.emissiveIntensity = 0.22; }
      else mat.emissiveIntensity = 0;
    });
    renderer.render(scene, camera);
  }
  function updateParticles() {
    var arr = pGeo.attributes.position.array, per = NP / 2;
    for (var side = 0; side < 2; side++) {
      for (var i = 0; i < per; i++) {
        var u = ((t / SCENES.csf.dur) + i / per) % 1;
        csfCurves[side].getPoint(u, tmp);
        var j = (side * per + i) * 3; arr[j] = tmp.x; arr[j + 1] = tmp.y; arr[j + 2] = tmp.z;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
  }
  if (reduceMotion) { spin.disabled = false; }
  requestAnimationFrame(frame);
})();
