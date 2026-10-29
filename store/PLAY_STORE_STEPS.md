# Publishing checklist (do in this order)

1. **Developer account.** Create a Google Play Console account ($25 one-time). Verify identity. If it is a *personal* account created recently, Google currently requires a closed test with at least 12 testers for 14 days before you can apply for production. Check the Console for the current number.
2. **Signing key.** Keep `anatomyverse-upload.jks` and its passwords safe and backed up in two places. Add four GitHub secrets (repo Settings > Secrets and variables > Actions): `ANDROID_KEYSTORE_B64` (the .jks file converted to base64), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (= `upload`), `ANDROID_KEY_PASSWORD`.
3. **Build.** Repo > Actions > "Android build" > Run workflow. Enter a version code that is higher than the last upload (1, then 2, 3 ...). Download the `anatomyverse-aab` artifact (`app-release.aab`). Download `anatomyverse-debug-apk` to test on your own phone first.
4. **Create the app** in Play Console (name, language, App, Free). Turn on **Play App Signing** (default).
5. **Fill the forms** from `store/PLAY_STORE_LISTING.md`: store listing, privacy policy URL, Data safety, content rating, target audience, health apps declaration, ads.
6. **Upload** `app-release.aab` to an Internal or Closed test track first. Install from the test link on a real phone and check: opens, 3D loads, tools work, offline works.
7. **Production.** When tests pass, promote the release to Production and submit for review.

Keep the version code rising by 1 for each new upload.
