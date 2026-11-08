# Anatomy model audit report (as of 4 November 2026)

Each row: original mesh, replacement, source/licence, test. "Tested" means rendered and inspected in a local copy of the built app (the live site is not reachable from the build sandbox); selection, isolation, search and camera were checked on the touched structures.

| Structure | Original | Replacement | Source / licence | Result |
|---|---|---|---|---|
| Uterus, tubes, ovaries, fimbriae | generated shapes | VH Female meshes | HuBMAP, CC BY 4.0 | tested |
| Urinary bladder, rectum | generated | Z-Anatomy bladder, BodyParts3D rectum | CC BY-SA 4.0 / 2.1 JP | tested; old meshes hidden |
| Larynx cartilages, thyroid, trachea | generated | Z-Anatomy | CC BY-SA 4.0 | tested; duplicate trachea fixed |
| Spinal cord | generated, outside canal | VH Male cord, fitted into canal | HuBMAP, CC BY 4.0 | tested by ray-parity |
| Heart ventricles, atria, valves, papillary muscles | balloon-like left ventricle | VH Male heart | HuBMAP, CC BY 4.0 | tested; pulmonary vein stubs not coaxial |
| Arm and hand joints (24 structures) | missing | Z-Anatomy, per-bone ICP fit, skinned | CC BY-SA 4.0 | elbow, wrist rendered; 1-3 mm median to bone |
| Joints and ligaments (38 structures) | missing | Z-Anatomy, fitted to app bones | CC BY-SA 4.0 | knee, shoulder rendered and checked; foot/hip checked numerically |

## Open gaps (no replacement imported)
- Vulva, labia, clitoris, vaginal and urethral openings, scrotum, spermatic cords, vas deferens: no licensed mesh found.
- Oral cavity (Z-Anatomy has no mouth-lining mesh), both urethras, skin and hair shells, third molars, alveoli: still generated.
- Spine, rib, jaw and laryngeal ligaments: app bones there are procedural or unaligned, not shipped.
- Arm and hand: 24 structures integrated (see THIRD_PARTY_ASSETS.md); six small wrist/elbow ligaments missing (source meshes are blocks only).
- Fascia: not yet imported. Lymph nodes: 103 groups integrated as Z-Anatomy node ovoids (schematic counts). Bursae: 33 integrated as simplified ellipsoids.
- All new records are pending expert review.

## Duplication audit (4 November 2026)
Checked: record ids, names, Latin names and synonyms across all 1,500 records; structures mapped by more than one asset; and, in the running app with every layer on, all 1,283 visible meshes for near-identical overlapping shapes.
Fixed:
- Renal pelvis had two complete records (base, left, right); the second set was removed.
- Left lacrimal canaliculus was drawn twice (eye model and eye-detail model, 97% overlap); removed from the eye-detail model.
- Paratracheal nodes were two records with one Latin name; merged into one record covering both meshes.
Reviewed and kept (distinct structures that sit together): retina on vitreous, arachnoid on dura, capsule and collateral ligaments of the same finger joints, the three prepatellar bursae (subcutaneous, subfascial, subtendinous: three separate terminology entries), muscle belly with its tendon, generic tooth types with the individual teeth under them.
Earlier fixes still in place: old bladder, rectum, trachea, larynx and thyroid hidden where the Z-Anatomy versions replace them.
Not detectable by this check: duplicates of procedural schematic parts that have no mesh file; the id/overlay check found no joints, bursa or lymph structure mapped by another asset.

## Mobile weight fix (lod26)

- The single `zanatomy-joints` asset (3.19 MB full / 2.39 MB lite, ~343 meshes) is replaced by five on-demand region assets: `zanatomy-joints-lower`, `zanatomy-joints-upper`, `zanatomy-bursae`, `zanatomy-lymph-upper`, `zanatomy-lymph-lower` (0.36–0.65 MB each in the lite variant). No content was removed; the meshes were partitioned by region.
- None loads by default. Selecting a structure (or ticking joints / bursae / lymph nodes in the Lab menu) loads only the file(s) it needs.
- Lite copies of the heart, abdominal organs and spinal cord were re-simplified (default triangles about 547k → 473k).
- Measured in headless Chromium at 390 px with 4x CPU throttling: default scene 888 meshes / 473k triangles, ready in ~6 s. This is an emulation, not a real phone; the original failure on the user's device has not been reproduced.

## Clinical review status (4 November 2026)

On 4 November 2026 the app owner stated that all structure records, questions and lessons were reviewed by Dr. Aqsa Hameed Phulpoto, MBBS and Dr. Farhan Ali, MBBS. The records' `reviewStatus` was changed from `pending-expert-review` to `reviewed` and the on-screen badge now names both reviewers. This change records the owner's attestation; the review itself was not performed or observed by the tooling. Note that this is review of the written content; the geometric alignment of the 3D meshes has been checked by software tests, not by an anatomist's validation. If that distinction matters to the reviewers, record it separately.

## Male genital proportions (lod27)
The Z-Anatomy testes and epididymides in `zanatomy-organs2` were about 2.1 × 2.9 × 2.3 cm (roughly 7 mL), well below adult size. They are now scaled 1.4× about their own position and moved down 0.75 cm so they sit inside the scrotum (approx. 3 × 4 × 3.2 cm). This is a node-transform change only; the meshes are unchanged and still CC BY-SA 4.0 Z-Anatomy. The scrotum and all female external genitalia (vulva, labia, clitoris) remain simple procedural shapes: no licensed mesh exists for them in Z-Anatomy, BodyParts3D or HuBMAP. They are labelled schematic.

## Label management (5 November 2026)
Cause of the label pile-up: with the Labels switch on (the default), choosing a body system turned every top-level structure of that system into a permanent label (274 for the Muscular system), each placed at one point with no collision handling, and left and right copies doubled the names. No name or record was lost. `smart-labels.js` replaces that layer: Clean shows only the selected structure, Smart places collision-free labels in edge columns with leader lines (count set by screen size and zoom, the rest grouped into region chips such as "Forearm muscles (32)"), and Index lists all 1,750 records by region (448 head and neck, 444 shoulder and upper limb, 103 thorax, 89 abdomen, 6 back, 125 pelvis, 529 lower limb, 6 whole body). Tested in a headless browser at 390 x 844 and 1280 x 720; not tested on a physical phone.


## 2026-11-05 upper airway and tonsils
Pharynx (Z-Anatomy nasopharynx, oropharynx, laryngopharynx), nasal cavity (Z-Anatomy mucosa of nasal cavity) and palatine tonsils now come from Z-Anatomy (CC BY-SA 4.0) in `zanatomy-organs2.glb`, replacing the procedural tube and ellipsoids. Left/right pairs that share one structure id (arytenoid and corniculate cartilages, tonsils) are single merged nodes, because the viewer keeps one mesh per id; this restored the right-hand arytenoid and corniculate cartilages, which were not being drawn.

## Final-audit batch (Nov 2026): cord/brainstem, landmarks, admin heading

**Spinal cord to brainstem (Phase 6).** Measured in the app frame: both meshes share the same axes and
compatible scale (cord top 1.3 x 1.1 cm, medulla base 1.5 x 1.4 cm). The gap was positional, not geometric.
The skull's foramen magnum (Z-Anatomy occipital bone) is centred at z = -2.9 cm and the Z-Anatomy medulla
base at z = -3.0 cm, but the HuBMAP cord top was at z = -1.2 cm, i.e. 1.7 cm too far forward (at the
anterior rim of the foramen). Correction: a smooth (smoothstep) posterior displacement of the cord vertices
between C4 (y = 1.40) and the top (y = 1.535), 1.79 cm at the top, zero below C4. The rest of the cord is
unchanged. Result: nearest cord-top to brainstem distance 0.74 cm -> 0.40 cm (residual is the vertical
gap between the two meshes, about 5 mm). Cord-to-vertebral-column vertex clearance was not reduced
(min 0.04/0.06/0.21 cm before vs 0.06/0.09/0.16 cm after, by band). Point-cloud check only; no ray-cast
containment test. Originals are kept under scratchpad/backup. Needs anatomical review by the doctors.

**Accessibility (Phase 9).** The credits link now sits in a labelled region ("3D model credits"); the admin
"Administrators only" notice is an h1. axe-core (desktop and phone widths) on /, /app/lab and /app/admin
reports no violations. THREE.Clock deprecation warning remains as documented harmless technical debt.

**Muscles and skeleton (Phase 7).** Focusing the muscular system leaves the bones layer visible at full
opacity (checked via the store). Muscle attachment geometry for calcaneal tendon, rhomboids, popliteus,
gracilis and coracobrachialis has not been inspected.

## Duplicate brain meshes and detailed-brain position (reported by the owner, Nov 2026)
Defect: selecting any brain structure switches on the detailed brain (BodyParts3D), but the Z-Anatomy cerebrum,
cerebellum, brainstem and pituitary stayed on too, so two cerebella (and cerebrum/brainstem/pituitary) showed.
Also the detailed brain sat 3.4 cm too high for the Z-Anatomy skull (brain top 1.735 m vs skull top 1.705 m;
BodyParts3D pituitary 3 cm above the sella turcica).
Correction: Z-Anatomy cerebrum, cerebellum, brainstem and pituitary overlays are hidden while the detailed brain is
on (new negated gate `!ld_brain`); the pituitary became its own asset file so it follows the same rule. All six
detailed-brain layers and the brain-flow particles moved down 3.4 cm (offset y 1.655 -> 1.621).
Verification: scene mesh counts per structure with the detailed brain off, on, off and after selecting the
cerebellum (one each, no duplicates); frontal lobe top 1.701 m under the skull top 1.705 m; pituitary now 1.594-1.606 m
against the Z-Anatomy pituitary at 1.595-1.608 m; screenshots from front and side show a single cerebellum.
Not yet checked: other detailed-brain layers (vessels, CSF, tracts, meninges) against the skull, by eye.

## In-app Self-check (Nov 2026)
selfcheck.js adds a "Self-check" link on the lab page (also Ctrl+Shift+K). It runs technical checks: duplicate record names,
duplicate meshes, 28 known vessel/nerve joins (15 mm tolerance), selection and marker position, view state.
Safe repairs only: reset view and visibility; clear cached app files. It never edits anatomy and is not expert validation.
Quick run (88 records, 3 min): 1751 records, no duplicate names or meshes; joins: subclavian-axillary gap 61/64 mm (known defect);
markers: 83 of 88 on the structure; 5 with no marker shown (deep cerebral structures right, foot bones right,
musculophrenic artery, right lung, thalamic perforating arteries left) - not yet investigated.
Also fixed: aggregate records with left/right children (e.g. Femoral artery) now get a marker anchored on their children.

## Loose limb nerves (owner report, Nov 2026)
Defect: the arm and leg nerves imported from Z-Anatomy (median, ulnar, radial, musculocutaneous, axillary, sciatic,
femoral, tibial, common fibular) ran through empty space, 8-11 cm medial to the limb bones the app displays
(e.g. at y=1.20 m: displayed humerus x=0.263, median nerve x=0.183). 43-49% of the length of the median, ulnar,
musculocutaneous and tibial nerves was more than 12 mm from any other structure. Earlier checks missed it because they only tested
chosen joins and nerve ends, not the whole path.
Cause: Z-Anatomy nerves fit Z-Anatomy bones; the displayed limb bones are from a wider, longer body (the leg is 5 cm higher at the knee).
Correction: each nerve was moved by the measured difference between the Z-Anatomy bone centreline (humerus, radius/ulna; femur, tibia)
and the displayed bone centreline at the same level, with the y levels mapped between landmarks (shoulder, elbow, wrist; hip, knee, ankle).
The shoulder and hip ends are held fixed (smoothstep taper), so the plexus and cauda equina joins are kept. Originals backed up.
Verification (technical): airborne length of those nerves now under 10%; nerve-to-companion-vessel distances 1.9 mm (median / brachial artery),
2.2 mm (tibial / posterior tibial artery); plexus joins 0.0-0.3 mm; sciatic to cauda equina 0.2-0.5 mm; front-view screenshot shows the nerves
along the limbs. Known remaining: musculocutaneous nerve starts about 10 cm below the Z-Anatomy plexus mesh (a gap in the source; it touches the median nerve
at 6 mm); phrenic nerve and inferior mesenteric artery still have about 28% of their length unsupported; basilic veins 22% (not yet investigated).
The Self-check now includes a "Loose vessels and nerves" test (tube-like structures with 25% or more of their length over 12 mm from any other structure).
Not yet checked: Z-Anatomy joint capsules, ligaments and bursae in the limbs against the displayed bones.

## Repair pass, 5 November 2026 (carotid/jugular, phrenic, mesenteric, genitalia)

What was wrong, what was done, and how it was checked. All checks below are technical checks in a desktop browser at the sizes stated. None is expert anatomical validation and none was run on a physical phone.

1. Neck vessels were truncated. The common carotid arteries and internal jugular veins were short blunt tubes ending in the lower neck. There were no meshes at all for the internal carotid, external carotid or vertebral arteries unless the detailed brain was on.
   - Fix: new assets `zanatomy-neckvessels` and `zanatomy-neckvessels-skull` from Z-Anatomy curves (CC BY-SA 4.0). The short BodyParts3D tubes were removed. A generated joining tube closes the jugular-to-subclavian and vertebral-to-subclavian gaps.
   - Check: minimum distances 0.8 to 1.0 mm for common carotid to aorta, common carotid to internal and external carotid, jugular to subclavian vein. Side and front screenshots show continuous vessels to the skull base. New record `external-carotid-artery`.
2. Phrenic nerve was a thick generated rod floating 3 cm from its roots, with a second schematic copy on the diaphragm.
   - Fix: new generated course (`anatomyverse-phrenic`), roots to diaphragm with three terminal branches per side, thin like a real nerve. Both old copies removed.
   - Check: 0.7 mm from the brachial plexus, 0.9 mm from the diaphragm; screenshots with the heart, great vessels and diaphragm isolated.
3. Inferior mesenteric artery ended 42 mm from the colon (27% of its length unsupported).
   - Fix: generated left colic and sigmoid branches snapped to the displayed colon.
   - Check: now 0.6 mm from the large intestine. Whole-body loose-vessel test: 0 of 82 structures with 25% or more of their length more than 12 mm from anything.
4. Female external genitalia were pill-shaped ellipsoids and tubes.
   - Fix: generated labia majora, labia minora, clitoral glans, body, crura and hood, and mons pubis (`anatomyverse-vulva`). No third-party source exists: Z-Anatomy and BodyParts3D are male-based. Flagged for expert review.
5. Male: the scrotum was a translucent sphere, the spermatic cords were thick tan rods ending in space, and the male urethra started 6 cm above the bladder.
   - Fix: generated bilobed scrotum with median raphe; spermatic cord rebuilt around the Z-Anatomy ductus deferens with generated sheath, testicular artery and pampiniform plexus; urethra replaced by the Z-Anatomy urethra from the bladder neck (new record `male-urethra`).
   - Check: front, side and oblique screenshots. The cord and ductus reach the testis and the pelvis.
6. Loading failure handling: a deliberately broken asset (a syntax error in a build script left a missing file) showed the app's own message "Some detailed parts could not load. Simplified shapes are shown" with Retry, and the rest of the app kept working.

7. Mouth: the app had no gums, hard palate, soft palate, uvula or salivary glands, the tongue was a 343-vertex block, the "taste buds" and "oral cavity" shapes floated 3 to 5 cm above the mouth in the nasal region, and the third molars were white ellipsoids.
   - Fix: new asset `zanatomy-oral` (Z-Anatomy gingiva, soft palate, uvula, parotid, submandibular and sublingual glands; tongue smoothed by subdivision; generated hard-palate mucosa fitted to the Z-Anatomy palate bones) with seven new records. New asset `anatomyverse-oral2`: generated circumvallate, fungiform and foliate papillae snapped to the tongue surface, and a translucent oral-cavity space. New asset `anatomyverse-thirdmolars`: four third molars adapted from the Z-Anatomy second molars (copied, scaled to 88%, moved behind the second molar). Z-Anatomy has no third molar, so position and size are approximate.
   - Check: isolated screenshots of tongue, gums, palate and all teeth with roots from three angles.
8. Marker anchors for the aggregate records left lung, right lung, hand bones and foot bones (their parts carry other ids). Self-check duplicate-mesh test now compares vertex counts, so components of one structure that share a bounding box (spermatic cord) are not reported as duplicates.
9. Phone layout: the Self-check link covered the bottom "View" button at 390 px width; moved.

## Tests run on 5 November 2026 (desktop Chromium via Playwright, software rendering; not a physical phone)
- In-app Self-check, quick run: records 1,760 with no duplicate names; no structure drawn twice (728 checked); 28 known vessel and nerve joins within 15 mm; 0 of 82 vessels and nerves with 25% or more of their length more than 12 mm from anything. Marker check on 88 structures: pass except two structures that exist only when the Detailed brain is on (right deep cerebral structures, left posterior cerebral artery): selecting them in normal mode shows no marker because no mesh is loaded.
- Scripted click-through at 1280 x 800: search and select, info panel, isolate, show all, hide and undo, reset view, seven camera views (opposite sides confirmed), male and female, Clean/Smart/Index, visibility menu, fade others, nine app pages (dashboard, lab, systems, lessons, quiz, flashcards, clinical, dictionary, progress), theme toggle. 0 page errors.
- Muscular system through the real interface: choosing Muscular keeps the whole body with its translucent silhouette; selecting biceps brachii highlights it with origin and insertion markers and fades the rest; the info card, Hide, Isolate, Reveal, Fade others, Undo and Reset view are in the top bar.
- Phone size (390 x 844, touch, lite models forced): 26 lite files and 1 full file (skull) loaded, 0 failed requests, 0 page errors, no overlapping controls after the fix; View, Layers, Tools and Info sheets open; search selects; dragging rotates the camera.
- Tablet size (820 x 1180): loads, 0 errors. One cosmetic overlap remains: the last toolbar icon sits under the Animate button.
- Axe accessibility scan earlier in the session: clean on `/`, `/app/lab`, `/app/admin`.
- Loading failure: a missing model file showed the app's own message with Retry and the rest of the app kept working.

## Not done, not verified, or needs a person
- No test on a physical Android phone and no APK build: the sandbox has Java and Gradle but no Android SDK and cannot reach the Google Maven repository. The Capacitor project (target and compile SDK 36, minimum SDK 24) exists but `www` has not been synced or built.
- No expert anatomical validation. Every generated part (phrenic nerves, mesenteric branches, vulva, scrotum and cord sheath, taste papillae, oral cavity, hard palate, third molars, joining tubes) is labelled in `THIRD_PARTY_ASSETS.md` and on the credits page as a generated approximation for expert review. The reviewer text on records is the owner's attestation and was not changed.
- 1,059 records have no Latin name, 862 have no function text and 386 have very short descriptions. Writing these needs a qualified author or cited sources; none were auto-generated.
- Ledger rows 51 onward are "Not inspected": they carry an automated scan note only. 413 are flagged as low-vertex shapes and 46 have no mesh found.
- Still generated or schematic, not replaced: eye nerves and vessels (ciliary ganglion, short ciliary nerves, central retinal artery and vein, posterior ciliary arteries, pupil), parathyroids, mammary gland, olfactory epithelium, lymph node spheres, female urethra and external urethral orifice, vaginal opening, vagina tube. The arm veins (cephalic, basilic) are straight schematic tubes attached to the limb vessels.
- Detailed-brain-only structures give no marker in normal mode.
- Tablet toolbar overlap (cosmetic).
- Licence position: assets are CC BY-SA 4.0, CC BY-SA 2.1 Japan, CC BY 4.0 (HuBMAP) and original work. Commercial use is allowed with attribution and share-alike on adapted meshes. Whether the app as a whole must be offered under share-alike is a legal question for a lawyer. Google Play health-app policies and the accuracy of the "Reviewed by" badge are the owner's responsibility.

## 8 November 2026: blood supply, venous drainage and nerve supply on every record

Request: ensure blood and nerve supply is in the description of every organ of each system.

Done: every one of the 1,760 records now shows three labelled rows in the info panel: Blood supply (arterial), Venous drainage and Innervation. About 1,750 records had at least one of these missing. The app already had the three fields; they were empty for almost all organs, bones, vessels, nodes and brain structures. Existing text (122 muscles and a few organs) was kept and not overwritten.

How the text was made: written by Claude from standard anatomy teaching knowledge, by organ for organs, glands, muscles, ligaments, brain and cord, and by rule for repeated groups (left and right copies, individual teeth, lymph-node groups by drained region, bones and joint structures by region). Generic wording is used where no specific named artery or nerve exists, and it says so (for example the vasa vasorum of vessels, nervi nervorum of nerves, avascular structures such as cornea, lens, epidermis, valve leaflets, hyaline cartilage and inner disc).

What this is not: the added text has not been reviewed by the named reviewers or any clinician. The records still carry the earlier "Reviewed by" badge, which covers the earlier text only. `SUPPLY_TEXT_FOR_REVIEW.csv` lists every added field, record by record, for review. Vascular variants (for example coronary dominance, the origin of the sinoatrial nodal artery, bronchial artery origins) are described as the usual pattern.

Self-check: new test "Blood and nerve supply" fails if any record lacks one of the three fields.

## 8 November 2026: emergency clinical cases in every system

Added 36 clinical cases (2 to 4 per system, 40 in the list with the four existing ones, now grouped by system) and 72 revision questions (also in the quiz bank under each system). Each new case has a scenario, the anatomy behind it, a numbered "What to do (first response)" list and a "When to get emergency help" line. Topics include heart attack, CPR, severe bleeding, choking, chest wound, asthma, appendicitis, GI bleeding, perforated ulcer, renal colic, urinary retention, pelvic fracture, ectopic pregnancy, testicular and ovarian torsion, hypoglycaemia, adrenal crisis, post-thyroidectomy haematoma, stroke, extradural haematoma, spinal injury, seizure, compartment syndrome, shoulder dislocation, hip fracture, open fracture, flail chest, anaphylaxis, ruptured spleen, sepsis, burns, deep hand cut, chemical eye injury, retinal artery occlusion, nosebleed and penetrating eye injury.

Status: written by Claude from standard anatomy and first-aid teaching (resuscitation, choking, bleeding, burns, anaphylaxis and similar steps follow widely taught guidance, with doses and numbers as in common UK and European teaching). They carry no reviewer badge and are labelled "Awaiting clinician review" in the list. The anatomy citations point to OpenStax chapters; the first-response steps have no per-step citation, and the page says that protocols differ between countries and must follow local teaching. Numbers that differ between guidelines or countries (for example aspirin dose, compression depth wording, tourniquet distance, auto-injector hold time) should be checked against the local protocol by the clinician reviewers.
