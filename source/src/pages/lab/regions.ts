// @ts-nocheck

export var BRAIN_IDS = new Set([
  'brain',
  'cerebrum',
  'cerebellum',
  'brainstem',
  'skull',
  'spinal-cord',
  'pituitary-gland',
  'cerebral-aqueduct',
  'cerebral-arterial-circle',
  'deep-cerebral-structures',
  'fourth-ventricle',
  'frontal-lobe',
  'hippocampus',
  'hypothalamus',
  'insula',
  'lateral-ventricle',
  'medulla-oblongata',
  'midbrain',
  'occipital-lobe',
  'parietal-lobe',
  'pons',
  'temporal-lobe',
  'third-ventricle',
]);

export var LUNG_IDS = new Set([
  'right-lung',
  'left-lung',
  'right-upper-lobe',
  'right-middle-lobe',
  'right-lower-lobe',
  'left-upper-lobe',
  'left-lower-lobe',
  'bronchial-tree',
  'bronchioles',
  'alveoli',
  'trachea',
  'right-main-bronchus',
  'left-main-bronchus',
  'diaphragm',
  'pleura',
]);

export var HEART_IDS = new Set([
  'heart',
  'right-atrium',
  'right-ventricle',
  'left-atrium',
  'left-ventricle',
  'tricuspid-valve',
  'mitral-valve',
  'pulmonary-valve',
  'aortic-valve',
  'coronary-arteries',
  'cardiac-veins',
  'aorta',
  'pulmonary-trunk',
  'pulmonary-veins',
  'superior-vena-cava',
  'inferior-vena-cava',
]);

export var CSF_SYSTEM = {
  id: 'csf-sequence',
  name: 'Cerebrospinal fluid',
  color: '#4fd0ff',
  sequence: {
    title: 'Circulation of cerebrospinal fluid',
    illustrative: true,
    steps: [
      {
        label: 'Choroid plexus',
        structureId: 'choroid-plexus',
        text: 'Most CSF is made by the choroid plexus in the ventricles.',
      },
      {
        label: 'Lateral ventricles',
        structureId: 'lateral-ventricle',
        text: 'CSF fills the two lateral ventricles in the cerebral hemispheres.',
      },
      {
        label: 'Third ventricle',
        structureId: 'third-ventricle',
        text: 'It flows through the interventricular foramina into the third ventricle.',
      },
      {
        label: 'Cerebral aqueduct',
        structureId: 'cerebral-aqueduct',
        text: 'A narrow canal in the midbrain carries it to the fourth ventricle.',
      },
      {
        label: 'Fourth ventricle',
        structureId: 'fourth-ventricle',
        text: 'The fourth ventricle sits between the pons and the cerebellum.',
      },
      {
        label: 'Cisterns',
        structureId: 'subarachnoid-cisterns',
        text: 'Through the median and lateral apertures CSF leaves the ventricles into the cisterns, such as the cisterna magna.',
      },
      {
        label: 'Subarachnoid space',
        structureId: 'subarachnoid-space',
        text: 'It spreads round the brain and spinal cord between the arachnoid and pia mater.',
      },
      {
        label: 'Arachnoid granulations',
        structureId: 'arachnoid-granulations',
        text: 'CSF is absorbed through arachnoid granulations.',
      },
      {
        label: 'Superior sagittal sinus',
        structureId: 'superior-sagittal-sinus',
        text: 'It returns to the venous blood in the superior sagittal sinus.',
      },
    ],
  },
};

export var MENINGES_SYSTEM = {
  id: 'meninges-sequence',
  name: 'Meninges',
  color: '#c99a5b',
  sequence: {
    title: 'The three layers around the brain',
    illustrative: true,
    steps: [
      {
        label: 'Skull and scalp',
        structureId: 'skull',
        text: 'The brain is protected by the scalp, the skull and then three membranes called the meninges. Together with the CSF they cushion the brain.',
      },
      {
        label: '1. Dura mater',
        structureId: 'dura-mater',
        text: 'The outer layer is thick and tough. It sticks to the inside of the skull and forms the dural venous sinuses. Between the dura and the bone of the vertebral canal is the epidural space.',
      },
      {
        label: '2. Arachnoid mater',
        structureId: 'arachnoid-mater',
        text: 'The middle layer is a thin, web-like membrane. A potential space, the subdural space, lies between it and the dura.',
      },
      {
        label: 'Subarachnoid space (CSF)',
        structureId: 'subarachnoid-space',
        text: 'Under the arachnoid is the subarachnoid space, filled with cerebrospinal fluid. The large cerebral arteries and veins run in it.',
      },
      {
        label: '3. Pia mater',
        structureId: 'pia-mater',
        text: 'The inner layer is a very thin membrane that sticks to the brain and the cord and follows every groove. The first letters of the layers from outside in are D, A, P.',
      },
      {
        label: 'Brain',
        structureId: 'brain',
        text: 'Below the pia lies the brain tissue itself. The three layers continue around the spinal cord, and the dural sac ends in the lower back.',
      },
    ],
  },
};

export var SPINAL_CORD_SYSTEM = {
  id: 'cord-sequence',
  name: 'Brain and spinal cord',
  color: '#ffc83a',
  sequence: {
    title: 'How the brain and spinal cord work together',
    illustrative: true,
    steps: [
      {
        label: 'The brain and cord are one organ',
        structureId: 'brain',
        text: 'The brain sits in the skull and the spinal cord runs down the vertebral canal. They are joined at the foramen magnum, so the nervous system has one central structure, the central nervous system (CNS), with a shared bath of cerebrospinal fluid.',
      },
      {
        label: 'The medulla becomes the cord',
        structureId: 'medulla-oblongata',
        text: 'The lowest part of the brainstem, the medulla oblongata, passes through the foramen magnum and carries on as the spinal cord without a sharp border. Everything going between brain and body goes through this narrow link.',
      },
      {
        label: 'Motor cortex gives the order',
        structureId: 'frontal-lobe',
        text: 'A voluntary movement starts in the motor cortex at the back of the frontal lobe. Nerve cells here send long fibres down towards the cord.',
      },
      {
        label: 'Corticospinal tract',
        structureId: 'corticospinal-tract',
        text: 'The fibres gather in the internal capsule, run through the midbrain and pons and form the pyramids of the medulla. Gold dots show signals travelling down.',
      },
      {
        label: 'Crossing in the medulla',
        structureId: 'medulla-oblongata',
        text: 'At the pyramidal decussation most fibres cross to the other side. This is why the left brain moves the right side of the body.',
      },
      {
        label: 'Spinal cord relays the command',
        structureId: 'spinal-cord',
        text: 'In the cord the fibres connect with lower motor neurons in the ventral horn. Reflex arcs are also completed here without waiting for the brain.',
      },
      {
        label: 'Peripheral nerves reach the muscles',
        structureId: 'brachial-plexus',
        text: 'Motor neurons leave the cord in spinal nerves. The brachial plexus supplies the arm and the sciatic nerve supplies the leg, and they make the muscles contract.',
      },
      {
        label: 'Touch and position go up',
        structureId: 'dorsal-column-medial-lemniscus-pathway',
        text: 'Fine touch and joint position travel up the back of the cord on the same side, cross in the medulla and reach the thalamus. Green dots show signals going up.',
      },
      {
        label: 'Pain and temperature go up',
        structureId: 'spinothalamic-tract',
        text: 'Pain and temperature fibres cross in the cord soon after they enter it, then rise on the opposite side. Orange dots show signals going up.',
      },
      {
        label: 'Thalamus and sensory cortex',
        structureId: 'deep-cerebral-structures',
        text: 'The thalamus is the relay station for almost all senses. From there the signal goes to the sensory cortex in the parietal lobe, where it becomes conscious feeling.',
      },
      {
        label: 'The cerebellum fine-tunes',
        structureId: 'cerebellum',
        text: 'The cerebellum compares the plan with the feedback from the body and corrects movement through the brainstem. It does not start movement itself.',
      },
      {
        label: 'CSF cushions both',
        structureId: 'subarachnoid-space',
        text: 'Cerebrospinal fluid surrounds the brain and the cord in one continuous space and ends in the dural sac in the lower back. A needle in this sac (lumbar puncture) can sample the fluid safely below the end of the cord.',
      },
    ],
  },
};
