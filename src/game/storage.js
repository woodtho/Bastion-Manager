// Lightweight persistence via localStorage with versioning and user-scoped keys

const APP_NS = "bastion-react";
const VERSION = 1; // bump when data shape changes

const keyFor = (profileId) => `${APP_NS}:v${VERSION}:profile:${profileId || "default"}`; // stable key builder

export const saveState = (state) => {
  try {
    const { profile_id } = state || {};
    const key = keyFor(profile_id);
    // Do not persist transient/internal fields that can be recomputed if desired
    const toStore = JSON.stringify(state);
    localStorage.setItem(key, toStore); // write full snapshot
  } catch (e) {
    // no-op on quota or privacy errors
  }
};

export const loadState = (profileId) => {
  try {
    const raw = localStorage.getItem(keyFor(profileId));
    if (!raw) return null;                     // nothing saved
    const parsed = JSON.parse(raw);
    // Optional migrations would go here if VERSION changed
    return parsed;
  } catch {
    return null;
  }
};

export const clearState = (profileId) => {
  try { localStorage.removeItem(keyFor(profileId)); } catch {}
};
