
# JavaScript - Complete Three.js Application
js_content = '''// ===== NEURAL ATLAS PRO =====
// Advanced 3D Nervous System Visualization
// Three.js r128

(function() {
  'use strict';

  // ===== CONFIG =====
  const CONFIG = {
    particleCount: 3000,
    signalCount: 12,
    brainColor: 0x7c3aed,
    cerebellumColor: 0x06b6d4,
    brainstemColor: 0xf59e0b,
    spinalColor: 0x3b82f6,
    nerveColor: 0xef4444,
    eyeColor: 0xec4899,
    heartColor: 0xdc2626,
    gutColor: 0x10b981,
    vagusColor: 0xa855f7,
    bgColor: 0x02040a
  };

  // ===== STATE =====
  let scene, camera, renderer, controls;
  let brainGroup, particleSystem, signalSystems = [];
  let animationSpeed = 1.0;
  let lightIntensity = 1.0;
  let isMicroView = false;
  let currentOrgan = 'brain';
  let clock = new THREE.Clock();
  let frameCount = 0;
  let lastTime = performance.now();

  // ===== ORGAN DATA =====
  const ORGANS = {
    brain: {
      icon: '🧠',
      name: 'الدماغ',
      en: 'Brain — Central Nervous System',
      stats: [
        { num: '86B', label: 'خلية عصبية' },
        { num: '1.4kg', label: 'الوزن' },
        { num: '20%', label: 'استهلاك الطاقة' }
      ],
      desc: 'الدماغ هو مركز التحكم الرئيسي في الجسم. يحتوي على <strong>86 مليار خلية عصبية</strong> موزعة على القشرة الدماغية (Cerebral Cortex) المسؤولة عن التفكير العالي واللغة والوعي، والجهاز الحوفي (Limbic System) المسؤول عن المشاعر والذاكرة، والمخيخ (Cerebellum) المسؤول عن التوازن والتنسيق الحركي.',
      functions: ['التفكير', 'اللغة', 'الذاكرة', 'المشاعر', 'الرؤية', 'السمع', 'اتخاذ القرار', 'الوعي'],
      details: [
        'القشرة الدماغية: 2-4 ملم سُمك، 16 مليار عصبون',
        'المخيخ: يحتوي على >50% من عصبونات الدماغ رغم صغر حجمه',
        'جذع الدماغ: يتحكم في التنفس والنبض والوعي الأساسي',
        'الحُصين: مركز تكوين الذاكرة طويلة المدى'
      ],
      color: CONFIG.brainColor,
      position: new THREE.Vector3(0, 2, 0)
    },
    cerebellum: {
      icon: '🌀',
      name: 'المخيخ',
      en: 'Cerebellum — 69 Billion Neurons',
      stats: [
        { num: '69B', label: 'خلية عصبية' },
        { num: '10%', label: 'من حجم الدماغ' },
        { num: '>50%', label: 'من العصبونات' }
      ],
      desc: 'رغم أن حجم المخيخ لا يتجاوز <strong>10% من حجم الدماغ</strong>، إلا أنه يحتوي على أكثر من نصف عصبونات الدماغ (~69 مليار خلية عصبية). يتحكم في التوازن والتنسيق الحركي الدقيق وتعلم الحركات المتكررة.',
      functions: ['التوازن', 'التنسيق الحركي', 'تعلم الحركات', 'معالجة اللغة', 'الانتباه', 'التوقيت'],
      details: [
        'يحتوي على طبقات عصبية منظمة بشكل متكرر',
        'يستقبل إشارات من القشرة الحركية والحواس',
        'لا يتحكم في الحركة مباشرة بل يُحسّنها',
        'يُعالج المعلومات بشكل متوازٍ (Parallel Processing)'
      ],
      color: CONFIG.cerebellumColor,
      position: new THREE.Vector3(0, -1.5, 2)
    },
    brainstem: {
      icon: '🔗',
      name: 'جذع الدماغ',
      en: 'Brain Stem — Vital Functions',
      stats: [
        { num: '3', label: 'أجزاء رئيسية' },
        { num: '100%', label: 'حيوية للحياة' },
        { num: '12', label: 'زوج عصبي' }
      ],
      desc: 'يربط الدماغ بالحبل الشوكي ويتحكم في <strong>الوظائف الحيوية التلقائية</strong>. يتكون من النخاع المستطيل (Medulla Oblongata) المسؤول عن التنفس والنبض، والجسر (Pons) الذي يربط بين أجزاء الدماغ، والمهد (Midbrain) المسؤول عن الرؤية والسمع.',
      functions: ['التنفس', 'النبض', 'الوعي الأساسي', 'البلع', 'التقيؤ', 'النوم', 'الاستيقاظ'],
      details: [
        'النخاع المستطيل: مركز التنفس والدورة الدموية',
        'الجسر: يربط المخ بالمخيخ والنخاع',
        'الجهاز الشبكي المنشط (RAS): يتحكم في اليقظة',
        'يمر عبره 10 من 12 زوجًا من الأعصاب الجمجمية'
      ],
      color: CONFIG.brainstemColor,
      position: new THREE.Vector3(0, -3.5, 0.5)
    },
    spinal: {
      icon: '🦴',
      name: 'الحبل الشوكي',
      en: 'Spinal Cord — 1 Billion Neurons',
      stats: [
        { num: '1B', label: 'خلية عصبية' },
        { num: '31', label: 'زوج عصبي' },
        { num: '45cm', label: 'الطول في البالغين' }
      ],
      desc: 'الطريق الرئيسي بين الدماغ والجسم. ينقل <strong>الأوامر الحركية</strong> من الدماغ إلى العضلات، وينقل <strong>الإحساس</strong> بالألم والحرارة واللمس إلى الدماغ. يدير الانعكاسات السريعة مثل سحب اليد من النار قبل أن "تفكر".',
      functions: ['نقل الإحساس', 'الأوامر الحركية', 'الانعكاسات', 'الحماية', 'التنسيق', 'التكامل'],
      details: [
        'يحتوي على مادة رمادية (Gray Matter) على شكل فراشة',
        'المادة البيضاء (White Matter) تحيط بالمادة الرمادية',
        '31 زوجًا من الأعصاب الشوكية تنشأ منه',
        'سرعة الإشارة: 70-120 متر/ثانية'
      ],
      color: CONFIG.spinalColor,
      position: new THREE.Vector3(0, -7, 0)
    },
    nerves: {
      icon: '🕸️',
      name: 'الأعصاب الطرفية',
      en: 'Peripheral Nervous System',
      stats: [
        { num: '43', label: 'زوجًا من الأعصاب' },
        { num: '1M+', label: 'كيلومتر ألياف' },
        { num: '2', label: 'نوع: حسي/حركي' }
      ],
      desc: 'شبكة ضخمة تمتد في <strong>اليدين والقدمين والوجه والأعضاء والجلد</strong>. العصب الوركي (Sciatic Nerve) أطول عصب في الجسم يمتد من أسفل الظهر حتى القدم ويحتوي آلاف المحاور العصبية.',
      functions: ['الإحساس باللمس', 'الألم', 'الحرارة', 'البرودة', 'الحركة الإرادية', 'الاستجابة اللاإرادية'],
      details: [
        'العصب الوركي: أطول وأعرض عصب (>1 متر)',
        'الأعصاب الحسية (Afferent): تنقل إلى الدماغ',
        'الأعصاب الحركية (Efferent): تنقل من الدماغ',
        'الجهاز العصبي الذاتي: Sympathetic & Parasympathetic'
      ],
      color: CONFIG.nerveColor,
      position: new THREE.Vector3(3, -5, 1)
    },
    eye: {
      icon: '👁️',
      name: 'العين',
      en: 'Eye — Retina 120 Million Neurons',
      stats: [
        { num: '120M', label: 'خلية في الشبكية' },
        { num: '6M', label: 'خلايا مخروطية' },
        { num: '120M', label: 'خلايا عصوية' }
      ],
      desc: 'الشبكية (Retina) هي في الواقع <strong>جزء من الدماغ</strong>! تحتوي على 120 مليون مستقبل ضوئي (6 ملايين مخروطية للألوان، 120 مليون عصوية للضوء الخافت). تترجم الضوء إلى إشارات كهربائية ترسل عبر العصب البصري.',
      functions: ['الرؤية', 'اكتشاف الضوء', 'الألوان', 'العمق', 'الحركة', 'التباين'],
      details: [
        'الشبكية: طبقة عصبية داخل العين',
        'الخلايا المخروطية: 3 أنواع (أحمر، أخضر، أزرق)',
        'الخلايا العصوية: حساسة جدًا للضوء الخافت',
        'العصب البصري: ينقل 1 مليون إشارة/ثانية'
      ],
      color: CONFIG.eyeColor,
      position: new THREE.Vector3(-3, 1, 2)
    },
    heart: {
      icon: '🫀',
      name: 'القلب العصبي',
      en: 'Cardiac Nervous System — 40,000 Neurons',
      stats: [
        { num: '40K', label: 'خلية عصبية' },
        { num: 'ذاتي', label: 'النبض' },
        { num: '100K', label: 'نبضة/يوم' }
      ],
      desc: 'القلب يمتلك <strong>شبكته العصبية الخاصة</strong> (Intrinsic Cardiac Nervous System). تُنظم إيقاع ضربات القلب بشكل مستقل وتستجيب للعواطف. يتواصل مع الدماغ عبر العصب المبهم (Vagus Nerve).',
      functions: ['تنظيم النبض', 'الاستجابة العصبية', 'التكيف مع الرياضة', 'الاستجابة للعواطف', 'التنسيق الداخلي'],
      details: [
        'العقدة الجيبية الأذينية (SA Node): منظم النبض الطبيعي',
        'الجهاز العصبي القلبي الداخلي: ~40,000 خلية',
        'يتأثر بالعصب المبهم (يبطئ) والودي (يسرع)',
        'يستجيب للهرمونات والمواد الكيميائية'
      ],
      color: CONFIG.heartColor,
      position: new THREE.Vector3(-2, -5, 1)
    },
    gut: {
      icon: '🫁',
      name: 'الأمعاء',
      en: 'Enteric Nervous System — 500M Neurons',
      stats: [
        { num: '500M', label: 'خلية عصبية' },
        { num: '90%', label: 'السيروتونين' },
        { num: '2', label: 'طبقات عصبية' }
      ],
      desc: 'يُسمى <strong>"الدماغ الثاني"</strong>. يحتوي على 500 مليون خلية عصبية — أكثر من الحبل الشوكي! يُنتج 90% من السيروتونين في الجسم. يعمل بشكل مستقل عن الدماغ وينظم الهضم وحركة الأمعاء.',
      functions: ['الهضم', 'حركة الأمعاء', 'إنتاج السيروتونين', 'التواصل مع الدماغ', 'المناعة', 'الامتصاص'],
      details: [
        'طبقتان عصبيتان: Plexus Myenteric و Plexus Submucosal',
        'يُنتج 90% من السيروتونين (Serotonin) في الجسم',
        'يحتوي على أنواع متعددة من العصبونات',
        'يعمل بشكل مستقل حتى لو انقطع الاتصال بالدماغ'
      ],
      color: CONFIG.gutColor,
      position: new THREE.Vector3(2, -5, 1)
    }
  };

  // ===== INIT =====
  function init() {
    const container = document.getElementById('canvas-container');
    if (!container) {
      console.error('Canvas container not found!');
      return;
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.bgColor);
    scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.015);

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 14);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.target.set(0, -1, 0);
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;

    // Lighting
    setupLighting();

    // Build 3D Scene
    buildBrainModel();
    buildNerveNetwork();
    buildParticleField();
    buildSignalNetwork();
    buildEnvironment();

    // UI Setup
    setupOrganList();
    setupInfoPanel('brain');
    setupEventListeners();
    setupSpeedControl();
    setupLightControl();
    setupViewButtons();

    // Hide loading
    simulateLoading();

    // Start loop
    animate();
  }

  // ===== LIGHTING =====
  function setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x1a1a3e, 0.5);
    scene.add(ambient);

    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x7c3aed, 0x02040a, 0.6);
    scene.add(hemi);

    // Main directional (key light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x00f0ff, 0.4);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // Rim lights
    const rim1 = new THREE.PointLight(0xf59e0b, 0.8, 20);
    rim1.position.set(0, -5, -5);
    scene.add(rim1);

    const rim2 = new THREE.PointLight(0x10b981, 0.5, 15);
    rim2.position.set(0, -8, 0);
    scene.add(rim2);

    const rim3 = new THREE.PointLight(0xec4899, 0.3, 15);
    rim3.position.set(-5, 2, 5);
    scene.add(rim3);
  }

  // ===== BUILD BRAIN MODEL =====
  function buildBrainModel() {
    brainGroup = new THREE.Group();

    // Material for brain - glossy, semi-transparent
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.brainColor,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      emissive: 0x2e1065,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    // Left hemisphere - deformed sphere for organic look
    const leftGeo = new THREE.SphereGeometry(2.2, 64, 64);
    deformGeometry(leftGeo, 0.15);
    const leftHemisphere = new THREE.Mesh(leftGeo, brainMat.clone());
    leftHemisphere.position.set(-1.2, 2.2, 0);
    leftHemisphere.scale.set(1, 0.85, 1.05);
    leftHemisphere.castShadow = true;
    leftHemisphere.receiveShadow = true;
    leftHemisphere.name = 'brain';
    brainGroup.add(leftHemisphere);

    // Right hemisphere
    const rightGeo = new THREE.SphereGeometry(2.2, 64, 64);
    deformGeometry(rightGeo, 0.15);
    const rightHemisphere = new THREE.Mesh(rightGeo, brainMat.clone());
    rightHemisphere.position.set(1.2, 2.2, 0);
    rightHemisphere.scale.set(1, 0.85, 1.05);
    rightHemisphere.castShadow = true;
    rightHemisphere.receiveShadow = true;
    rightHemisphere.name = 'brain';
    brainGroup.add(rightHemisphere);

    // Gyri and sulci (brain folds) - using torus knots
    for (let i = 0; i < 8; i++) {
      const foldGeo = new THREE.TorusGeometry(0.3 + Math.random() * 0.5, 0.08, 8, 32, Math.PI * 1.5);
      const fold = new THREE.Mesh(foldGeo, new THREE.MeshPhysicalMaterial({
        color: 0x5b21b6,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x2e1065,
        emissiveIntensity: 0.2
      }));
      fold.position.set(
        (Math.random() - 0.5) * 3,
        1.5 + Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      fold.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      brainGroup.add(fold);
    }

    // Cerebellum - layered structure
    const cerebellumMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.cerebellumColor,
      metalness: 0.3,
      roughness: 0.35,
      clearcoat: 0.5,
      emissive: 0x0891b2,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.9
    });

    // Main cerebellum body
    const cerebellumBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 48, 48),
      cerebellumMat
    );
    cerebellumBody.position.set(0, -1.8, 2.2);
    cerebellumBody.scale.set(1.3, 0.65, 1.1);
    cerebellumBody.name = 'cerebellum';
    brainGroup.add(cerebellumBody);

    // Cerebellar folia (leaf-like folds)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const folium = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.05, 0.3),
        new THREE.MeshPhysicalMaterial({
          color: 0x0891b2,
          emissive: 0x164e63,
          emissiveIntensity: 0.3
        })
      );
      folium.position.set(
        Math.cos(angle) * 1.0,
        -1.8 + Math.sin(angle * 3) * 0.1,
        2.2 + Math.sin(angle) * 0.8
      );
      folium.rotation.y = angle;
      folium.rotation.z = Math.sin(angle * 2) * 0.2;
      brainGroup.add(folium);
    }

    // Brain stem - composed of 3 parts
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.brainstemColor,
      metalness: 0.35,
      roughness: 0.3,
      emissive: 0x92400e,
      emissiveIntensity: 0.3,
      clearcoat: 0.4
    });

    // Medulla
    const medulla = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.7, 1.5, 32),
      stemMat.clone()
    );
    medulla.position.set(0, -3.8, 0.5);
    medulla.name = 'brainstem';
    brainGroup.add(medulla);

    // Pons (bulge in middle)
    const pons = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32),
      stemMat.clone()
    );
    pons.position.set(0, -3.2, 0.5);
    pons.scale.set(1.2, 0.6, 1);
    pons.name = 'brainstem';
    brainGroup.add(pons);

    // Midbrain
    const midbrain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.55, 1, 32),
      stemMat.clone()
    );
    midbrain.position.set(0, -2.5, 0.3);
    midbrain.name = 'brainstem';
    brainGroup.add(midbrain);

    // Spinal cord with segments
    const spinalMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.spinalColor,
      metalness: 0.25,
      roughness: 0.3,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.85
    });

    const spinalCord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.35, 10, 32),
      spinalMat
    );
    spinalCord.position.set(0, -8.5, 0);
    spinalCord.name = 'spinal';
    brainGroup.add(spinalCord);

    // Spinal segments markers
    for (let i = 0; i < 8; i++) {
      const segment = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.06, 8, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0x60a5fa,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.7
        })
      );
      segment.position.set(0, -4 - i * 1.2, 0);
      segment.rotation.x = Math.PI / 2;
      brainGroup.add(segment);
    }

    // Eye - detailed structure
    buildEye();

    // Heart
    buildHeart();

    // Gut
    buildGut();

    scene.add(brainGroup);
  }

  // ===== BUILD EYE =====
  function buildEye() {
    const eyeGroup = new THREE.Group();

    // Sclera (white)
    const scleraMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 48, 48),
      scleraMat
    );
    sclera.scale.set(1, 0.9, 0.75);
    eyeGroup.add(sclera);

    // Cornea (transparent dome)
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.3
    });
    const cornea = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35),
      corneaMat
    );
    cornea.position.z = 0.4;
    eyeGroup.add(cornea);

    // Iris
    const irisMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2
    });
    const iris = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.15, 16, 48),
      irisMat
    );
    iris.position.z = 0.5;
    eyeGroup.add(iris);

    // Pupil
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 32),
      pupilMat
    );
    pupil.position.z = 0.55;
    eyeGroup.add(pupil);

    // Optic nerve
    const opticMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      emissive: 0x92400e,
      emissiveIntensity: 0.3
    });
    const opticNerve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 3, 16),
      opticMat
    );
    opticNerve.position.set(0, 0, -1.8);
    opticNerve.rotation.x = Math.PI / 2;
    eyeGroup.add(opticNerve);

    eyeGroup.position.set(-3.5, 1.2, 2.5);
    eyeGroup.name = 'eye';
    brainGroup.add(eyeGroup);
  }

  // ===== BUILD HEART =====
  function buildHeart() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    heartShape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    heartShape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
    heartShape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    heartShape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.heartColor,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
      clearcoat: 0.3
    });

    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set(-2, -5.5, 1);
    heart.scale.set(2, 2, 2);
    heart.rotation.z = Math.PI;
    heart.name = 'heart';
    brainGroup.add(heart);

    // Heart vessels
    const vesselMat = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.3
    });
    
    const aorta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 2, 16),
      vesselMat
    );
    aorta.position.set(-2, -4, 1);
    aorta.rotation.z = 0.3;
    brainGroup.add(aorta);
  }

  // ===== BUILD GUT =====
  function buildGut() {
    const gutMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.gutColor,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0x064e3b,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.75
    });

    // Stomach
    const stomach = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      gutMat.clone()
    );
    stomach.position.set(2, -4, 1);
    stomach.scale.set(1.2, 0.8, 1);
    stomach.name = 'gut';
    brainGroup.add(stomach);

    // Intestinal coils
    for (let i = 0; i < 6; i++) {
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.6 + i * 0.15, 0.2, 12, 32, Math.PI * 1.8),
        gutMat.clone()
      );
      coil.position.set(2.5 + i * 0.2, -5.5 + i * 0.15, 1 + Math.sin(i) * 0.3);
      coil.rotation.x = Math.PI / 2 + i * 0.2;
      coil.rotation.z = i * 0.5;
      coil.name = 'gut';
      brainGroup.add(coil);
    }

    // Vagus nerve connection
    const vagusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2, -4, 1),
      new THREE.Vector3(1.5, -2.5, 0.5),
      new THREE.Vector3(0.8, -1, 0),
      new THREE.Vector3(0.3, 0, 0)
    ]);

    const vagusGeo = new THREE.TubeGeometry(vagusCurve, 64, 0.08, 8, false);
    const vagusMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.vagusColor,
      emissive: 0x581c87,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8
    });
    const vagus = new THREE.Mesh(vagusGeo, vagusMat);
    vagus.name = 'vagus';
    brainGroup.add(vagus);
  }

  // ===== BUILD NERVE NETWORK =====
  function buildNerveNetwork() {
    const nerveMat = new THREE.MeshPhysicalMaterial({
      color: CONFIG.nerveColor,
      metalness: 0.2,
      roughness: 0.4,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.7
    });

    const nervePaths = [
      // Arms
      {
        points: [new THREE.Vector3(0, -4, 0), new THREE.Vector3(-2, -3.5, 1), new THREE.Vector3(-4.5, -2, 2.5), new THREE.Vector3(-6, -1, 3.5)],
        branches: 3
      },
      {
        points: [new THREE.Vector3(0, -4, 0), new THREE.Vector3(2, -3.5, 1), new THREE.Vector3(4.5, -2, 2.5), new THREE.Vector3(6, -1, 3.5)],
        branches: 3
      },
      // Legs (sciatic)
      {
        points: [new THREE.Vector3(0, -10, 0), new THREE.Vector3(-1.5, -12.5, 0.5), new THREE.Vector3(-2.5, -15, 1), new THREE.Vector3(-3, -17, 1.5)],
        branches: 2
      },
      {
        points: [new THREE.Vector3(0, -10, 0), new THREE.Vector3(1.5, -12.5, 0.5), new THREE.Vector3(2.5, -15, 1), new THREE.Vector3(3, -17, 1.5)],
        branches: 2
      },
      // To heart
      {
        points: [new THREE.Vector3(0, -4, 0), new THREE.Vector3(-1, -4.5, 0.5), new THREE.Vector3(-2, -5.5, 1)],
        branches: 1
      },
      // To gut
      {
        points: [new THREE.Vector3(0, -4, 0), new THREE.Vector3(1, -4.5, 0.5), new THREE.Vector3(2, -4, 1)],
        branches: 1
      }
    ];

    nervePaths.forEach((pathData, index) => {
      const curve = new THREE.CatmullRomCurve3(pathData.points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05 + Math.random() * 0.03, 8, false);
      const tube = new THREE.Mesh(tubeGeo, nerveMat.clone());
      tube.name = 'nerves';
      brainGroup.add(tube);

      // Add nerve nodes (swellings)
      for (let i = 1; i < pathData.points.length - 1; i++) {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshPhysicalMaterial({
            color: 0xf87171,
            emissive: 0xdc2626,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
          })
        );
        node.position.copy(pathData.points[i]);
        brainGroup.add(node);
      }

      // Branches
      for (let b = 0; b < pathData.branches; b++) {
        const branchStart = pathData.points[Math.floor(pathData.points.length / 2)];
        const branchEnd = new THREE.Vector3(
          branchStart.x + (Math.random() - 0.5) * 3,
          branchStart.y + (Math.random() - 0.5) * 2,
          branchStart.z + (Math.random() - 0.5) * 2
        );
        const branchCurve = new THREE.CatmullRomCurve3([branchStart, branchEnd]);
        const branchGeo = new THREE.TubeGeometry(branchCurve, 32, 0.02, 6, false);
        const branchMesh = new THREE.Mesh(branchGeo, nerveMat.clone());
        branchMesh.material.opacity = 0.4;
        brainGroup.add(branchMesh);
      }
    });
  }

  // ===== BUILD PARTICLE FIELD =====
  function buildParticleField() {
    const count = CONFIG.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x7c3aed);
    const color3 = new THREE.Color(0xf59e0b);
    const color4 = new THREE.Color(0x10b981);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 4 + Math.random() * 15;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25 - 3;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const colorChoice = Math.random();
      let c;
      if (colorChoice < 0.25) c = color1;
      else if (colorChoice < 0.5) c = color2;
      else if (colorChoice < 0.75) c = color3;
      else c = color4;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 3 + 0.5;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData = { velocities: velocities };

    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  // ===== BUILD SIGNAL NETWORK =====
  function buildSignalNetwork() {
    const signalPaths = [
      { from: new THREE.Vector3(0, 2, 0), to: new THREE.Vector3(0, -3, 0), color: 0x00f0ff },
      { from: new THREE.Vector3(0, -3, 0), to: new THREE.Vector3(0, -8, 0), color: 0x00f0ff },
      { from: new THREE.Vector3(0, -8, 0), to: new THREE.Vector3(-6, -1, 3.5), color: 0x3b82f6 },
      { from: new THREE.Vector3(0, -8, 0), to: new THREE.Vector3(6, -1, 3.5), color: 0x3b82f6 },
      { from: new THREE.Vector3(0, -10, 0), to: new THREE.Vector3(-3, -17, 1.5), color: 0xef4444 },
      { from: new THREE.Vector3(0, -10, 0), to: new THREE.Vector3(3, -17, 1.5), color: 0xef4444 },
      { from: new THREE.Vector3(-3.5, 1.2, 2.5), to: new THREE.Vector3(0, 2, 0), color: 0xec4899 },
      { from: new THREE.Vector3(2, -4, 1), to: new THREE.Vector3(0, -3, 0), color: 0x10b981 },
      { from: new THREE.Vector3(-2, -5.5, 1), to: new THREE.Vector3(0, -4, 0), color: 0xdc2626 }
    ];

    signalPaths.forEach((path, index) => {
      const mid1 = new THREE.Vector3().lerpVectors(path.from, path.to, 0.33);
      const mid2 = new THREE.Vector3().lerpVectors(path.from, path.to, 0.66);
      mid1.x += (Math.random() - 0.5) * 2;
      mid1.y += (Math.random() - 0.5) * 1;
      mid2.x += (Math.random() - 0.5) * 2;
      mid2.y += (Math.random() - 0.5) * 1;

      const curve = new THREE.CatmullRomCurve3([path.from, mid1, mid2, path.to]);

      // Glow line
      const glowGeo = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
      const glowMat = new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.15
      });
      const glowLine = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glowLine);

      // Core line
      const coreGeo = new THREE.TubeGeometry(curve, 64, 0.008, 8, false);
      const coreMat = new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.6
      });
      const coreLine = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreLine);

      // Signal dots
      const dots = [];
      const dotCount = 2 + Math.floor(Math.random() * 2);
      for (let d = 0; d < dotCount; d++) {
        const dotGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({
          color: path.color,
          transparent: true,
          opacity: 0.9
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        scene.add(dot);
        dots.push({
          mesh: dot,
          offset: d / dotCount,
          speed: 0.3 + Math.random() * 0.4
        });
      }

      signalSystems.push({
        curve: curve,
        dots: dots,
        color: path.color
      });
    });
  }

  // ===== BUILD ENVIRONMENT =====
  function buildEnvironment() {
    // Grid floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -18;
    scene.add(gridHelper);

    // Ambient particles ring
    const ringGeo = new THREE.RingGeometry(15, 15.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -10;
    scene.add(ring);
  }

  // ===== DEFORM GEOMETRY =====
  function deformGeometry(geometry, intensity) {
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const noise = Math.sin(x * 2) * Math.cos(y * 2) * Math.sin(z * 2);
      positions[i] += noise * intensity;
      positions[i + 1] += noise * intensity * 0.5;
      positions[i + 2] += noise * intensity;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  // ===== SETUP ORGAN LIST =====
  function setupOrganList() {
    const list = document.getElementById('organ-list');
    if (!list) return;

    Object.keys(ORGANS).forEach(key => {
      const organ = ORGANS[key];
      const item = document.createElement('div');
      item.className = 'organ-item' + (key === 'brain' ? ' active' : '');
      item.dataset.organ = key;
      item.innerHTML = `
        <span class="organ-icon">${organ.icon}</span>
        <div class="organ-info">
          <div class="organ-name">${organ.name}</div>
          <div class="organ-en">${organ.en}</div>
        </div>
        <div class="organ-glow"></div>
      `;
      item.addEventListener('click', () => selectOrgan(key));
      list.appendChild(item);
    });
  }

  // ===== SETUP INFO PANEL =====
  function setupInfoPanel(organKey) {
    const organ = ORGANS[organKey];
    if (!organ) return;

    const icon = document.getElementById('info-h-icon');
    const title = document.getElementById('info-h-title');
    const sub = document.getElementById('info-h-sub');
    const body = document.getElementById('info-body');

    if (icon) icon.textContent = organ.icon;
    if (title) title.textContent = organ.name;
    if (sub) sub.textContent = organ.en;

    if (body) {
      const statsHtml = organ.stats.map(s => `
        <div class="stat-box">
          <span class="stat-number">${s.num}</span>
          <span class="stat-label">${s.label}</span>
        </div>
      `).join('');

      const funcsHtml = organ.functions.map(f => `
        <span class="func-chip">${f}</span>
      `).join('');

      const detailsHtml = organ.details.map(d => `
        <div class="detail-item">
          <span class="detail-bullet"></span>
          <span class="detail-text">${d}</span>
        </div>
      `).join('');

      body.innerHTML = `
        <div class="stats-grid">${statsHtml}</div>
        <div class="info-desc">${organ.desc}</div>
        <div class="func-section">
          <div class="func-title">⚡ الوظائف الرئيسية:</div>
          <div class="func-grid">${funcsHtml}</div>
        </div>
        <div class="details-list">${detailsHtml}</div>
      `;
    }
  }

  // ===== SELECT ORGAN =====
  function selectOrgan(organKey) {
    currentOrgan = organKey;
    const organ = ORGANS[organKey];
    if (!organ) return;

    // Update UI
    setupInfoPanel(organKey);

    // Update active state in list
    document.querySelectorAll('.organ-item').forEach(item => {
      item.classList.toggle('active', item.dataset.organ === organKey);
    });

    // Animate camera
    const targetPos = organ.position.clone();
    const cameraPos = new THREE.Vector3(
      targetPos.x + 6,
      targetPos.y + 4,
      targetPos.z + 10
    );

    animateCamera(cameraPos, targetPos);

    // Highlight 3D object
    highlightOrgan(organKey);
  }

  // ===== ANIMATE CAMERA =====
  function animateCamera(endPos, endTarget) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = performance.now();

    function update() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    update();
  }

  // ===== HIGHLIGHT ORGAN =====
  function highlightOrgan(organName) {
    brainGroup.traverse(child => {
      if (child.isMesh && child.material) {
        if (child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.15;
        }
      }
    });

    brainGroup.traverse(child => {
      if (child.isMesh && child.name === organName) {
        if (child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.6;
        }
      }
    });
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);

    // Raycaster for 3D clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(brainGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== brainGroup && !ORGANS[obj.name]) {
          obj = obj.parent;
        }
        if (obj.name && ORGANS[obj.name]) {
          selectOrgan(obj.name);
        }
      }
    });

    // Double click for micro view
    renderer.domElement.addEventListener('dblclick', () => {
      toggleMicroView();
    });
  }

  // ===== SPEED CONTROL =====
  function setupSpeedControl() {
    const slider = document.getElementById('speed-slider');
    const value = document.getElementById('speed-value');

    if (slider && value) {
      slider.addEventListener('input', () => {
        animationSpeed = parseFloat(slider.value);
        value.textContent = animationSpeed.toFixed(1) + 'x';
      });
    }
  }

  // ===== LIGHT CONTROL =====
  function setupLightControl() {
    const slider = document.getElementById('light-slider');
    const value = document.getElementById('light-value');

    if (slider && value) {
      slider.addEventListener('input', () => {
        lightIntensity = parseFloat(slider.value);
        value.textContent = Math.round(lightIntensity * 100) + '%';

        scene.traverse(child => {
          if (child.isLight) {
            child.intensity = child.userData.originalIntensity * lightIntensity;
          }
        });
      });

      // Store original intensities
      scene.traverse(child => {
        if (child.isLight) {
          child.userData.originalIntensity = child.intensity;
        }
      });
    }
  }

  // ===== VIEW BUTTONS =====
  function setupViewButtons() {
    const btnMacro = document.getElementById('btn-macro');
    const btnMicro = document.getElementById('btn-micro');
    const btnReset = document.getElementById('btn-reset');

    if (btnMacro) {
      btnMacro.addEventListener('click', () => {
        isMicroView = false;
        btnMacro.classList.add('active');
        btnMicro.classList.remove('active');
        animateCamera(new THREE.Vector3(0, 1, 14), new THREE.Vector3(0, -1, 0));
      });
    }

    if (btnMicro) {
      btnMicro.addEventListener('click', () => {
        toggleMicroView();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        isMicroView = false;
        btnMacro.classList.add('active');
        btnMicro.classList.remove('active');
        animationSpeed = 1.0;
        lightIntensity = 1.0;
        if (document.getElementById('speed-slider')) {
          document.getElementById('speed-slider').value = 1;
          document.getElementById('speed-value').textContent = '1.0x';
        }
        if (document.getElementById('light-slider')) {
          document.getElementById('light-slider').value = 1;
          document.getElementById('light-value').textContent = '100%';
        }
        animateCamera(new THREE.Vector3(0, 1, 14), new THREE.Vector3(0, -1, 0));
      });
    }
  }

  // ===== TOGGLE MICRO VIEW =====
  function toggleMicroView() {
    isMicroView = !isMicroView;
    const btnMacro = document.getElementById('btn-macro');
    const btnMicro = document.getElementById('btn-micro');

    if (isMicroView) {
      if (btnMacro) btnMacro.classList.remove('active');
      if (btnMicro) btnMicro.classList.add('active');
      animateCamera(new THREE.Vector3(0, 2, 4), new THREE.Vector3(0, 2, 0));
    } else {
      if (btnMacro) btnMacro.classList.add('active');
      if (btnMicro) btnMicro.classList.remove('active');
      animateCamera(new THREE.Vector3(0, 1, 14), new THREE.Vector3(0, -1, 0));
    }
  }

  // ===== WINDOW RESIZE =====
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ===== SIMULATE LOADING =====
  function simulateLoading() {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          const loading = document.getElementById('loading-screen');
          if (loading) loading.classList.add('hidden');
        }, 500);
      }
      if (fill) fill.style.width = progress + '%';
      if (text) text.textContent = Math.round(progress) + '%';
    }, 200);
  }

  // ===== ANIMATE =====
  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const delta = clock.getDelta();

    // FPS counter
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round(frameCount * 1000 / (now - lastTime));
      const fpsEl = document.getElementById('fps-counter');
      if (fpsEl) fpsEl.textContent = fps;
      frameCount = 0;
      lastTime = now;
    }

    // Rotate brain group slowly
    if (brainGroup) {
      brainGroup.rotation.y = Math.sin(time * 0.08) * 0.08;
      brainGroup.rotation.x = Math.sin(time * 0.12) * 0.04;
    }

    // Animate particles
    if (particleSystem) {
      particleSystem.rotation.y += 0.0005 * animationSpeed;
      const positions = particleSystem.geometry.attributes.position.array;
      const velocities = particleSystem.geometry.userData.velocities;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * animationSpeed;
        positions[i + 1] += velocities[i + 1] * animationSpeed + Math.sin(time + positions[i]) * 0.002;
        positions[i + 2] += velocities[i + 2] * animationSpeed;

        // Wrap around
        if (Math.abs(positions[i]) > 20) positions[i] *= -0.9;
        if (positions[i + 1] > 15 || positions[i + 1] < -20) positions[i + 1] *= -0.9;
        if (Math.abs(positions[i + 2]) > 20) positions[i + 2] *= -0.9;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Animate signals
    signalSystems.forEach((signal, index) => {
      signal.dots.forEach((dot, dotIndex) => {
        const speed = dot.speed * animationSpeed;
        dot.offset += speed * 0.016;
        if (dot.offset > 1) dot.offset -= 1;

        const point = signal.curve.getPoint(dot.offset);
        dot.mesh.position.copy(point);

        // Pulse effect
        const scale = 1 + Math.sin(time * 5 + index + dotIndex) * 0.3;
        dot.mesh.scale.setScalar(scale);

        // Fade at ends
        const fadeStart = 0.05;
        const fadeEnd = 0.95;
        if (dot.offset < fadeStart) {
          dot.mesh.material.opacity = (dot.offset / fadeStart) * 0.9;
        } else if (dot.offset > fadeEnd) {
          dot.mesh.material.opacity = ((1 - dot.offset) / (1 - fadeEnd)) * 0.9;
        } else {
          dot.mesh.material.opacity = 0.9;
        }
      });
    });

    // Heart beat
    const heart = brainGroup ? brainGroup.getObjectByName('heart') : null;
    if (heart) {
      const beat = 1 + Math.sin(time * 4) * 0.12;
      heart.scale.set(2 * beat, 2 * beat, 2);
    }

    // Eye movement
    const eye = brainGroup ? brainGroup.getObjectByName('eye') : null;
    if (eye) {
      eye.rotation.y = Math.sin(time * 0.5) * 0.1;
      eye.rotation.x = Math.sin(time * 0.3) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // ===== START =====
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
'''

with open(f'{base_dir}/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ app.js created!")
