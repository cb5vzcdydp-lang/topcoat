# Workout editing access recovery

The old gate generated a fresh token on every mount. Refreshing looked like a different device until the old minute-long lease expired. Safari/Android timer suspension also caused a matching but expired renewal to return a conflict. The gate kept renewing after conflicts and did not proactively reconnect on foreground return.

## Changes

- A per-account/profile identity in sessionStorage survives refresh, and a document-local identity survives component remounts. New navigation gets a fresh identity even when sessionStorage was cloned from a frozen tab. A short BroadcastChannel probe adds protection when reusing an identity on reload. Without tab messaging, only a real reload or current-document remount can reuse an identity. Storage/channel failures have a safe fallback.
- Foreground, focus and online events acquire access again. Visible held tabs renew; conflict/unavailable states recheck acquisition instead of endlessly renewing a lost lock. Background documents do not send heartbeats.
- The server can renew an expired lease when the same authenticated owner and token still hold it. The conditional write checks owner, token, session and version; it cannot overwrite a new owner's acquisition. Explicitly released leases still require acquisition.
- Each acquisition advances the generation. Cleanup includes generation and session, so late releases from a pre-refresh document or previous workout cannot clear newer ownership. The same owning tab can hand off to its next workout without a false other-device warning.
- Conflicts return current version/expiry, enabling bounded retry for expiry/races. Real ownership changes still block cloud saves. An explicit “Continue workout on this device” action moves access without another redundant confirmation. No draft data is deleted or merged by a handover.
- Requests are cancelled on cleanup; stale responses cannot update a remounted gate. Connection loss after ownership verification keeps local editing available and reconnects automatically. Initial connection errors keep the manual local-draft fallback.

Older pre-update tabs have unrelated tokens. They may need the explicit Continue action once, or an automatic retry after their inactive lease expires. Actual simultaneous devices still require an explicit handover.

## Verification

- Expanded `tests/community-tools.mjs`: real D1 routes for background expiry, reload generations, delayed release, new-workout handoff, takeover, stale saves, account isolation and monotonic versions.
- `tests/workout-lease-browser.mjs`: mobile refresh without handover; retained reps; foreground recovery; real popup with cloned sessionStorage; distinct duplicate-tab identity; explicit handover blocking the old editor; expired-conflict recovery without draft loss.
- Existing template completion/update, unilateral, import, theme, AI and application regressions remain enabled. Automated Chromium checks do not certify physical Safari/Android behaviour.

No schema migration, paid service, global lock reset or authentication change is introduced.
