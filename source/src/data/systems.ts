// @ts-nocheck

export var SYSTEMS = [
  {
    id: 'skeletal',
    name: 'Skeletal',
    summary: 'Bones and joints that support the body, protect organs, anchor muscles and store minerals.',
    color: '#e7dcc4',
    coverageNote:
      'Schematic skull, vertebral column, ribs, sternum, shoulder girdle, limb bones and hip bones. Individual vertebrae, carpals and tarsals are not separately labelled yet.',
  },
  {
    id: 'muscular',
    name: 'Muscular',
    summary: 'Skeletal muscles that move joints, stabilise posture and drive breathing.',
    color: '#c2554d',
    coverageNote:
      'Eight representative muscles with origin, insertion, innervation and action. Facial, neck, back and deep muscles are not yet modelled.',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    summary: 'The heart and blood vessels that circulate blood through pulmonary and systemic circuits.',
    color: '#d0413e',
    coverageNote:
      'Four separately selectable heart chambers, simplified valve discs, coronary arteries and the great vessels.',
    sequence: {
      title: 'Blood flow through the heart',
      illustrative: true,
      steps: [
        {
          label: 'Venae cavae',
          structureId: 'superior-vena-cava',
          text: 'Deoxygenated blood from the body returns through the superior and inferior venae cavae.',
        },
        {
          label: 'Right atrium',
          structureId: 'right-atrium',
          text: 'Blood collects in the right atrium.',
        },
        {
          label: 'Tricuspid valve',
          structureId: 'tricuspid-valve',
          text: 'It passes through the tricuspid (right atrioventricular) valve.',
        },
        {
          label: 'Right ventricle',
          structureId: 'right-ventricle',
          text: 'The right ventricle contracts to pump blood towards the lungs.',
        },
        {
          label: 'Pulmonary valve',
          structureId: 'pulmonary-valve',
          text: 'Blood passes the pulmonary valve into the pulmonary trunk.',
        },
        {
          label: 'Pulmonary trunk',
          structureId: 'pulmonary-trunk',
          text: 'The pulmonary trunk divides into pulmonary arteries carrying blood to both lungs for gas exchange.',
        },
        {
          label: 'Left atrium',
          structureId: 'left-atrium',
          text: 'Oxygenated blood returns through the pulmonary veins into the left atrium.',
        },
        {
          label: 'Mitral valve',
          structureId: 'mitral-valve',
          text: 'It passes through the mitral (left atrioventricular, bicuspid) valve.',
        },
        {
          label: 'Left ventricle',
          structureId: 'left-ventricle',
          text: 'The thick-walled left ventricle pumps blood into the systemic circulation.',
        },
        {
          label: 'Aortic valve → aorta',
          structureId: 'aorta',
          text: 'Blood passes the aortic valve into the aorta and is distributed to the body.',
        },
      ],
    },
  },
  {
    id: 'nervous',
    name: 'Nervous',
    summary: 'Brain, spinal cord and peripheral nerves that integrate sensation, movement and autonomic control.',
    color: '#e8c547',
    coverageNote:
      'Cerebrum, cerebellum, brainstem, spinal cord and schematic courses of the brachial plexus (with axillary, radial and musculocutaneous nerves), phrenic, vagus, femoral, sciatic, tibial and common fibular nerves are modelled. Cranial nerves other than the vagus are text-only.',
    sequence: {
      title: 'Blood supply and drainage of the brain',
      illustrative: true,
      steps: [
        {
          label: 'Internal carotid arteries',
          structureId: 'internal-carotid-artery',
          text: 'The two internal carotid arteries enter the skull through the carotid canals and carry most of the blood to the front of the brain.',
        },
        {
          label: 'Vertebral arteries',
          structureId: 'vertebral-artery',
          text: 'The vertebral arteries rise through the neck vertebrae and enter the skull through the foramen magnum to supply the back of the brain.',
        },
        {
          label: 'Basilar artery',
          structureId: 'basilar-artery',
          text: 'The two vertebral arteries unite to form the basilar artery on the front of the pons.',
        },
        {
          label: 'Cerebral arterial circle',
          structureId: 'cerebral-arterial-circle',
          text: 'The circle of Willis joins the carotid and basilar supplies, giving back-up routes if one vessel narrows.',
        },
        {
          label: 'Anterior cerebral artery',
          structureId: 'anterior-cerebral-artery',
          text: 'Supplies the inner surface of the frontal and parietal lobes.',
        },
        {
          label: 'Middle cerebral artery',
          structureId: 'middle-cerebral-artery',
          text: 'Supplies the outer surface of the hemisphere, including the face and arm areas and language areas.',
        },
        {
          label: 'Posterior cerebral artery',
          structureId: 'posterior-cerebral-artery',
          text: 'Supplies the occipital lobe (vision) and the lower temporal lobe.',
        },
        {
          label: 'Cerebellar arteries',
          structureId: 'posterior-inferior-cerebellar-artery',
          text: 'The superior, anterior inferior and posterior inferior cerebellar arteries supply the cerebellum.',
        },
        {
          label: 'Capillary bed',
          structureId: 'cerebral-capillary-bed',
          text: 'Arteries branch into capillaries where oxygen and glucose pass into the tissue. The blood-brain barrier forms here.',
        },
        {
          label: 'Superficial cerebral veins',
          structureId: 'superficial-cerebral-veins',
          text: 'Cortical veins collect the blood and run to the nearest dural sinus.',
        },
        {
          label: 'Superior sagittal sinus',
          structureId: 'superior-sagittal-sinus',
          text: 'Upper cortical veins empty into the superior sagittal sinus, which runs back along the top of the brain.',
        },
        {
          label: 'Great cerebral vein and straight sinus',
          structureId: 'great-cerebral-vein',
          text: 'Deep veins join the great cerebral vein, which drains into the straight sinus.',
        },
        {
          label: 'Transverse sinus',
          structureId: 'transverse-sinus',
          text: 'Both sinuses meet at the confluence and the blood passes into the transverse sinuses.',
        },
        {
          label: 'Sigmoid sinus',
          structureId: 'sigmoid-sinus',
          text: 'Each transverse sinus continues as an S-shaped sigmoid sinus.',
        },
        {
          label: 'Internal jugular vein',
          structureId: 'internal-jugular-vein',
          text: 'The sigmoid sinus leaves the skull as the internal jugular vein, which carries blood back towards the heart.',
        },
      ],
    },
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    summary: 'Airways and lungs that conduct air and exchange oxygen and carbon dioxide.',
    color: '#e59a9a',
    coverageNote:
      'Nasal cavity, pharynx, larynx, trachea, main bronchi, both lungs, an enlarged alveolar cluster and a translucent pleura over each lung are modelled (lung lobes are not separated).',
    sequence: {
      title: 'Path of inspired air',
      illustrative: true,
      steps: [
        {
          label: 'Nasal cavity',
          structureId: 'nasal-cavity',
          text: 'Air enters the nasal cavity, where it is warmed, humidified and filtered.',
        },
        {
          label: 'Pharynx',
          structureId: 'pharynx',
          text: 'It passes through the pharynx, shared with the digestive tract.',
        },
        {
          label: 'Larynx',
          structureId: 'larynx',
          text: 'The larynx conducts air and houses the vocal folds.',
        },
        {
          label: 'Trachea',
          structureId: 'trachea',
          text: 'The trachea carries air into the thorax.',
        },
        {
          label: 'Main bronchi',
          structureId: 'right-main-bronchus',
          text: 'At the carina the trachea divides into the right and left main bronchi.',
        },
        {
          label: 'Lungs',
          structureId: 'right-lung',
          text: 'Bronchi branch repeatedly down to alveoli, where gas exchange occurs.',
        },
      ],
    },
  },
  {
    id: 'digestive',
    name: 'Digestive',
    summary: 'The alimentary canal and accessory organs that digest food and absorb nutrients.',
    color: '#d99a6c',
    coverageNote:
      'Oral cavity, pharynx, oesophagus, stomach, liver, gallbladder, pancreas, small and large intestine and rectum are modelled schematically.',
    sequence: {
      title: 'Digestive pathway',
      illustrative: true,
      steps: [
        {
          label: 'Oral cavity',
          structureId: 'oral-cavity',
          text: 'Mechanical digestion begins with chewing; saliva begins chemical digestion.',
        },
        {
          label: 'Pharynx',
          structureId: 'pharynx',
          text: 'Swallowing moves the bolus through the pharynx.',
        },
        {
          label: 'Oesophagus',
          structureId: 'oesophagus',
          text: 'Peristalsis carries the bolus down to the stomach.',
        },
        {
          label: 'Stomach',
          structureId: 'stomach',
          text: 'The stomach mixes food with gastric secretions to form chyme.',
        },
        {
          label: 'Small intestine',
          structureId: 'small-intestine',
          text: 'Digestion is completed and most nutrients are absorbed; bile and pancreatic juice enter the duodenum.',
        },
        {
          label: 'Large intestine',
          structureId: 'large-intestine',
          text: 'Water and electrolytes are absorbed and faeces are formed.',
        },
        {
          label: 'Rectum',
          structureId: 'rectum',
          text: 'Faeces are stored until defecation.',
        },
      ],
    },
  },
  {
    id: 'urinary',
    name: 'Urinary',
    summary: 'Kidneys filter blood to form urine, which is transported and stored before excretion.',
    color: '#b5694a',
    coverageNote: 'Kidneys, ureters, bladder and urethra are modelled.',
    sequence: {
      title: 'Urine formation and transport',
      illustrative: true,
      steps: [
        {
          label: 'Kidney',
          structureId: 'kidney',
          text: 'Nephrons filter blood and modify the filtrate to form urine.',
        },
        {
          label: 'Ureter',
          structureId: 'ureter',
          text: 'Peristalsis carries urine down each ureter.',
        },
        {
          label: 'Bladder',
          structureId: 'urinary-bladder',
          text: 'The bladder stores urine.',
        },
        {
          label: 'Urethra',
          structureId: 'urethra',
          text: 'Urine leaves the body through the urethra.',
        },
      ],
    },
  },
  {
    id: 'reproductive',
    name: 'Reproductive',
    summary: 'Organs that produce gametes and sex hormones and support reproduction.',
    color: '#c77fa3',
    coverageNote:
      'Introductory entries. Male (testes) and female (ovaries, uterus) organs are shown together on the one schematic body for reference only.',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    summary: 'Glands that secrete hormones into the blood to regulate distant tissues.',
    color: '#8fbf6a',
    coverageNote: 'Pituitary, thyroid, parathyroid and adrenal glands are modelled.',
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic & immune',
    summary: 'Vessels, nodes and organs that return tissue fluid and support immune defence.',
    color: '#7fb3d5',
    coverageNote:
      'Spleen, thymus, palatine tonsils and representative lymph node groups (neck, axilla, groin) are modelled.',
  },
  {
    id: 'integumentary',
    name: 'Integumentary',
    summary: 'Skin and its appendages, which protect the body and help regulate temperature.',
    color: '#d9a88a',
    coverageNote:
      'A translucent skin surface, plus a layered skin block beside the body (epidermis, dermis, hypodermis, appendages; not to scale).',
  },
  {
    id: 'special-senses',
    name: 'Special senses',
    summary: 'Eye, ear and chemical senses that detect light, sound, balance, smell and taste.',
    color: '#9a8fd0',
    coverageNote: 'Eyes, ears, olfactory epithelium and tongue (taste buds) are modelled as simple shapes.',
  },
];

export var systemById = Object.fromEntries(SYSTEMS.map((e) => [e.id, e]));
