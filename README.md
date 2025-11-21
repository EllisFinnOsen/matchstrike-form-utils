# 📮 Matchstrike Form Honeypot Utils

Lightweight, zero-dependency spam prevention utilities for HTML forms.

This package currently includes a small honeypot plugin that:
- Automatically injects a hidden honeypot input into any form you opt in.
- Silently blocks submissions when the honeypot is filled (likely a bot).
- Can optionally show a “fake success” UI so bots think submission worked.
- Is hardened against browser autofill and common password managers.

Works on:
- Webflow
- WordPress / PHP sites
- Shopify (theme templates)
- Custom apps and static sites

---

## 🚀 Quick Start

1. **Include the plugin from jsDelivr**

Use a tagged version in production:

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@v1.0.1/dist/form-honeypot.min.js" defer></script>
```

During development, you can use `@latest`:

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@latest/dist/form-honeypot.min.js" defer></script>
```

> Recommended: pin to a specific tag (`@v1.x.x`) for client-facing / production sites.

2. **Opt a form into protection**

Add the `data-honeypot` attribute to any form you want protected:

```html
<form data-honeypot="true">
  <!-- your existing fields -->
  <button type="submit">Send</button>
</form>
```

That’s it. The plugin will:
- Inject a hidden honeypot input.
- Hide it off-screen.
- Block any submission where that field is filled.

---

## ⚙️ Configuration

You can control behavior per form via `data-` attributes.

### Custom honeypot field name

```html
<form
  data-honeypot="true"
  data-honeypot-field="_hp_contact"
>
  ...
</form>
```

Default: `_hp_field`.

Using a generic, non-human field name makes autofill less likely to touch it.

---

### Behavior when a bot is detected

```html
<form
  data-honeypot="true"
  data-honeypot-behavior="silent-success"
>
  ...
</form>
```

Available values:

- `block` (default)  
  Blocks the submission; no request is sent, and normal form behavior is halted.

- `silent-success`  
  Blocks the submission but **pretends** it succeeded:
  - Calls `form.reset()`
  - Attempts to show a “success” state and hide “error” state for Webflow-style forms (`.w-form-done` / `.w-form-fail`).

---

### Minimum submit time (optional)

You can optionally add a simple “too fast” detector based on time-to-submit, if you enable it in your script. The idea:

```html
<form
  data-honeypot="true"
  data-min-submit-time-ms="1500"
>
  ...
</form>
```

If a form is submitted faster than the configured time (in ms) after page load, it can be treated as suspicious and blocked.

> Note: This is an optional enhancement and may not be present in all builds. Check the current release notes or code if you plan to rely on it.

---

## 🧩 How It Works

1. On DOM ready, the plugin scans for `form[data-honeypot]`.
2. For each matching form:
   - A honeypot `<input>` is created (or reused if you added one yourself).
   - Attributes are set to discourage autofill and password managers:
     - `autocomplete="off"`
     - `inputmode="none"`
     - `data-lpignore="true"`
     - `data-1p-ignore="true"`
     - `data-form-type="other"`
     - `aria-hidden="true"`
     - `tabindex="-1"`
   - A submit handler is attached in the capture phase.
3. On submit:
   - If the honeypot is **empty**, submission proceeds normally.
   - If the honeypot has **any value**:
     - The submission is blocked with `preventDefault()` and `stopPropagation()`.
     - A `honeypot:blocked` event is dispatched on the form.
     - If `data-honeypot-behavior="silent-success"`, the plugin will reset the form and attempt to show “success” UI.

Result:
- Real users never see or interact with the field.
- Bots that indiscriminately fill inputs get blocked before your backend or platform sees the request.

---

## 🎧 Webflow Usage

1. Add the script in **Project Settings → Custom Code → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@v1.0.1/dist/form-honeypot.min.js" defer></script>
```

2. On any Webflow form you want protected, add a custom attribute:

- Name: `data-honeypot`
- Value: `true`

3. (Optional but recommended) Add:

- `data-honeypot-behavior="silent-success"`

This will:
- Block spam submissions before they hit Webflow’s servers.
- Still show the `.w-form-done` success state when a bot is caught, so they don’t retry aggressively.

---

## 📡 Listening for Honeypot Events

You can hook into the honeypot block event for logging or analytics:

```js
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form[data-honeypot]').forEach(function (form) {
    form.addEventListener('honeypot:blocked', function (e) {
      console.log('Honeypot blocked submission:', e.detail);
      // e.detail.form  -> the form element
      // e.detail.field -> the honeypot input
      // e.detail.value -> the value the bot tried to send
    });
  });
});
```

This is useful if you want to:
- Track how much spam is being blocked.
- Fire custom analytics events.
- Debug specific bot behaviors.

---

## 🏗 Folder Structure

A simple suggested layout for this repo:

```text
/
├── dist/
│   ├── form-honeypot.js        # Readable, non-minified build
│   └── form-honeypot.min.js    # Minified CDN-ready build
├── src/                        # Source files (if you expand this into a larger toolkit)
├── README.md
└── .prettierignore
```

The `dist/` directory is what jsDelivr serves.  
You may want to add `dist/` to `.prettierignore` (and other formatters) so your minified file stays minified:

```text
dist/
```

---

## 🌍 CDN Usage with jsDelivr

jsDelivr GitHub pattern:

```text
https://cdn.jsdelivr.net/gh/<user>/<repo>@<version>/<path>
```

For this repo:

- User: `EllisFinnOsen`
- Repo: `matchstrike-form-utils`

Examples:

### Versioned (recommended for production)

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@v1.0.1/dist/form-honeypot.min.js" defer></script>
```

### Latest release (for dev / internal use)

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@latest/dist/form-honeypot.min.js" defer></script>
```

You can also add a cache-busting querystring while debugging:

```html
<script src="https://cdn.jsdelivr.net/gh/EllisFinnOsen/matchstrike-form-utils@v1.0.1/dist/form-honeypot.min.js?v=1.0.1" defer></script>
```

---

## 🏷 Versioning & Releases

Use semantic-ish versioning and tags for each release:

```bash
# After committing your changes
git tag v1.0.1
git push origin v1.0.1
```

Then, optionally, create a GitHub Release pointing at that tag (jsDelivr respects both tags and releases, but `@latest` is based on releases).

Recommended workflow:

1. Make changes in `src/` or your main file.
2. Build/minify into `dist/form-honeypot.min.js`.
3. Commit the updated `dist` file.
4. Tag and push: `v1.0.x`.
5. Update script tags on client sites when you’re ready to roll out changes.

---

## ✅ Testing Checklist (Console)

Open DevTools → Console and verify:

```js
// Plugin loaded
window.FormHoneypot && window.FormHoneypot.version;

// Form detected
const form = document.querySelector('form[data-honeypot]');
form.__honeypotInitialized;

// Honeypot field exists and is hardened
const hp = form.querySelector('[name="_hp_field"]');
({
  type: hp.type,
  name: hp.name,
  autocomplete: hp.autocomplete,
  inputMode: hp.inputMode,
  lpIgnore: hp.getAttribute('data-lpignore'),
  onePasswordIgnore: hp.getAttribute('data-1p-ignore'),
  formType: hp.getAttribute('data-form-type'),
  ariaHidden: hp.getAttribute('aria-hidden'),
  tabIndex: hp.tabIndex,
  className: hp.className
});
```

Simulate a bot:

```js
document.addEventListener('honeypot:blocked', e => console.log('Blocked:', e.detail));

const hp = document.querySelector('[name="_hp_field"]');
hp.value = 'bot-test';
document.querySelector('form[data-honeypot]').requestSubmit();
```

Expected: console log with `Blocked: { ... }` and no real submission.

---

## 🧾 License

MIT License (or your choice).

You’re free to use this utility across client projects. Contributions and extensions to support more anti-spam patterns are welcome.
