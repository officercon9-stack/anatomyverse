#!/usr/bin/env python3
"""Replace the placeholder legal pages with real ones (disclaimer, privacy, terms, contact)."""
import sys, glob
ROOT = sys.argv[1]
f = glob.glob(ROOT + '/assets/index-*.js')[0]
s = open(f).read()
a = s.index('var ua={disclaimer:{')
b = s.index(',sources:{title:`Content sources and licences`')
P = lambda t: "(0,U.jsx)(`p`,{children:`%s`})" % t.replace('`', "'")
H = lambda t: "(0,U.jsx)(`h2`,{className:`mt-4 text-base font-semibold text-[var(--av-text)]`,children:`%s`})" % t
def page(k, title, parts):
    return "%s:{title:`%s`,body:(0,U.jsxs)(U.Fragment,{children:[%s]})}" % (k, title, ",".join(parts))
MAIL = "officercon9@gmail.com"
disc = page('disclaimer', 'Educational disclaimer', [
 P("AnatomyVerse 3D is an educational tool for students of anatomy and the health sciences. It supports learning and revision. It does not replace formal medical education, supervised dissection, professional judgement or clinical training."),
 P("Nothing in this app is medical advice, a diagnosis or a recommendation for the care of any person. Do not use it to decide about your own health or anyone else's. If you think you have a medical emergency, contact your local emergency services."),
 P("Most 3D structures are derived from open anatomical datasets (see Content sources) and have been simplified and repositioned for teaching. Some structures are schematic drawings made for this app and are marked as such. Shapes, sizes and positions are not exact and must not be used for surgical or procedural planning."),
 P("The explanatory text is original wording written from cited open textbooks. It is labelled pending expert review until a qualified anatomist has checked it. Always confirm facts against your course materials."),
 P("Clinical notes are illustrative teaching examples, not diagnoses.")])
priv = page('privacy', 'Privacy policy', [
 P("Effective 29 October 2026. AnatomyVerse 3D is operated from Islamabad, Pakistan. Contact: %s." % MAIL),
 H("What we collect"),
 P("Nothing. AnatomyVerse 3D has no accounts, no sign-in, no advertising, no analytics and no tracking, and it does not send your information to us or to anyone else."),
 H("What stays on your device"),
 P("To work the way you left it, the app saves your settings and study progress in your device's local storage: language, body model choice, low-power setting, bookmarks, recently viewed structures, lesson progress, flashcard schedules, quiz results and activity counts. This information never leaves your device. Clearing the app's storage, using Clear data in the app's system settings, or uninstalling the app deletes it."),
 H("Network use"),
 P("The web version is hosted on GitHub Pages, which may keep ordinary server logs (such as IP address) under GitHub's own privacy statement. The Android app contains its content and does not need an internet connection. Fonts are included in the app and are not loaded from third parties."),
 H("Permissions"),
 P("The Android app asks for no special permissions. It does not use your camera, microphone, contacts, files or location."),
 H("Health information"),
 P("Please do not type patient or personal health information anywhere in the app. It is not designed to store it."),
 H("Children"),
 P("The app is meant for students and does not knowingly collect any personal information from anyone, including children."),
 H("Your choices and contact"),
 P("Because we hold no personal data, there is nothing for us to access, correct or delete. For any privacy question write to %s. If this policy changes, the new version will appear here with a new effective date." % MAIL)])
terms = page('terms', 'Terms of use', [
 P("Effective 29 October 2026. By using AnatomyVerse 3D you agree to these terms."),
 H("Educational use only"),
 P("The app is provided for education. It is not medical advice and must not be used for diagnosis, treatment or clinical decisions. See the Educational disclaimer."),
 H("Provided as is"),
 P("The app is provided as is and as available, without warranties of any kind. We try to keep the content accurate but do not promise that it is complete, current or error-free. To the extent the law allows, we are not liable for any loss arising from using the app."),
 H("Content and licences"),
 P("The app's code, schematic models, lessons, quizzes and written explanations belong to the operator. Many 3D models are derived from Z-Anatomy and BodyParts3D and are licensed under Creative Commons Attribution-ShareAlike (CC BY-SA); those model files stay under their original licences. Credits, licence links and a statement of changes are on the Content sources page."),
 H("Acceptable use"),
 P("Do not copy, resell or redistribute the app's own content as yours, try to disrupt the service, or use the app in any unlawful way. Nothing in these terms limits any rights you have under the open licences above."),
 H("Changes and contact"),
 P("We may update these terms; the current version is always here. Questions: %s." % MAIL)])
cont = page('contact', 'Contact', [
 P("Email: %s" % MAIL),
 P("Phone: 0092-3193100488"),
 P("Islamabad, Pakistan"),
 P("Write to us about anatomy corrections, privacy questions, or a copyright or licence concern. Please name the structure or page and describe the problem, and we will review it.")])
s = s[:a] + 'var ua={' + ",".join([disc, priv, terms]) + "," + cont + s[b:]
open(f, 'w').write(s)
print('legal patched', f)
