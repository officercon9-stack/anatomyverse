// @ts-nocheck
import { openstax, chapters } from './';

export var PENDING_REVIEW_CASE = 'pending-expert-review';

export var CLINICAL_CASES = [
  {
    id: 'humeral-shaft-radial-nerve',
    title: 'Mid-shaft humeral fracture and the radial nerve',
    objective: 'Explain why a fracture of the humeral shaft can produce wrist drop.',
    scenario:
      'An adult falls and fractures the shaft of the humerus. On examination they cannot extend the wrist against gravity.',
    relevantStructureIds: ['humerus', 'radial-nerve', 'triceps-brachii'],
    explanation:
      'The radial nerve runs in the radial groove on the posterior surface of the humeral shaft. A fracture here can stretch or injure the nerve. Because the radial nerve supplies the extensor muscles of the forearm, their paralysis leaves the wrist hanging in flexion (wrist drop).',
    questionIds: ['q-mu-05'],
    sources: [...openstax(chapters.appendicular), ...openstax(chapters.somatic)],
    reviewStatus: PENDING_REVIEW_CASE,
  },
  {
    id: 'fibular-neck-foot-drop',
    title: 'Fibular neck injury and foot drop',
    objective: 'Relate the course of the common fibular nerve to foot drop.',
    scenario:
      'After a blow to the lateral side of the knee, a person’s foot slaps on the ground as they walk and they cannot lift their toes.',
    relevantStructureIds: ['fibula', 'common-fibular-nerve', 'sciatic-nerve'],
    explanation:
      'The common fibular nerve, a terminal branch of the sciatic nerve, winds superficially around the neck of the fibula. Injury here paralyses the muscles that dorsiflex the ankle and evert the foot, producing foot drop.',
    questionIds: ['q-ne-03'],
    sources: [...openstax(chapters.appendicular), ...openstax(chapters.somatic)],
    reviewStatus: PENDING_REVIEW_CASE,
  },
  {
    id: 'inhaled-foreign-body',
    title: 'Inhaled foreign body',
    objective: 'Explain which main bronchus an inhaled object is more likely to enter.',
    scenario: 'A small object is accidentally inhaled during a meal.',
    relevantStructureIds: ['trachea', 'right-main-bronchus', 'left-main-bronchus', 'right-lung'],
    explanation:
      'The right main bronchus is wider, shorter and more vertical than the left, so it continues more directly from the trachea. Inhaled objects therefore more often lodge in the right main bronchus or right lung.',
    questionIds: ['q-re-02'],
    sources: openstax(chapters.respiratory),
    reviewStatus: PENDING_REVIEW_CASE,
  },
  {
    id: 'lumbar-puncture-level',
    title: 'Choosing a level for lumbar puncture',
    objective: 'Relate the termination of the spinal cord to the vertebral levels used for lumbar puncture.',
    scenario: 'A clinician needs to sample cerebrospinal fluid from the lumbar region in an adult.',
    relevantStructureIds: ['spinal-cord', 'vertebral-column'],
    explanation:
      'In adults the spinal cord usually ends at about L1–L2. Below this the vertebral canal contains the nerve roots of the cauda equina, which can move aside from a needle. Lumbar puncture is therefore performed below the end of the cord, commonly at L3–L4 or L4–L5.',
    questionIds: ['q-ne-02'],
    sources: openstax(chapters.nervousAnatomy),
    reviewStatus: PENDING_REVIEW_CASE,
  },
];

export var clinicalCaseById = Object.fromEntries(CLINICAL_CASES.map((e) => [e.id, e]));
