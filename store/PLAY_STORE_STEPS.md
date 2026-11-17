# Publishing checklist (do in this order)

1. **Developer account.** Create a Google Play Console account ($25 one-time). Verify identity. If it is a *personal* account created recently, Google currently requires a closed test with at least 12 testers for 14 days before you can apply for production. Check the Console for the current number.
2. **Signing key.** Done (Nov 2026): two GitHub secrets are set, `ANDROID_KEY_PASS` and `ANDROID_KEYSTORE_B64` (alias `upload`). Keep `upload.jks` and its password backed up in two safe places; losing them means you can never update the app.
3. **Build.** Repo > Actions > "Android build" > Run workflow. Enter a version code that is higher than the last upload (1, then 2, 3 ...). Download the `anatomyverse-aab` artifact (`app-release.aab`). Download `anatomyverse-debug-apk` to test on your own phone first.
4. **Create the app** in Play Console (name 3D Anatomy, language English, App, **Paid**). Set the price Rs 1,500 in Monetize > App pricing; this needs the payments (merchant) profile with your bank account. Turn on **Play App Signing** (default).
5. **Fill the forms** from `store/PLAY_STORE_LISTING.md`: store listing, privacy policy URL, Data safety, content rating, target audience, health apps declaration, ads.
6. **Upload** `app-release.aab` to an Internal test track first (internal testers install a paid app free), then a Closed test (12 testers for 14 days; on a paid app they must buy it). Install from the test link on a real phone and check: opens, 3D loads, tools work, offline works.
7. **Production.** When tests pass, promote the release to Production and submit for review.

Keep the version code rising by 1 for each new upload.
