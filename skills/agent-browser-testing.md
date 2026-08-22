# RAIZ3Y — Browser Validation

Use when a browser-capable agent/tool is available.

## Required validation
- Open the deployed site, not only local code.
- Test navigation, login/signup/recovery, account, checkout, receipt upload, and admin flows relevant to the change.
- Exercise mobile viewport first, then desktop.
- Check keyboard-only navigation and visible focus.
- Capture screenshots for visual regressions when supported.
- Inspect console/network/runtime errors when supported.
- Do not mark a UI task complete based only on static code review when interactive validation is available.

If browser automation is unavailable in the current environment, explicitly record that limitation and use available deployment/build/runtime checks instead.
