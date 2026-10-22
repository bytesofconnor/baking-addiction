export function isA11yFixtureBuild(): boolean {
  return import.meta.env.VITE_A11Y_FIXTURE === "1";
}

export function isA11ySignedIn(): boolean {
  return isA11yFixtureBuild() && window.__A11Y_SIGNED_IN__ === true;
}

export function isA11yAdmin(): boolean {
  return isA11yFixtureBuild() && window.__A11Y_ADMIN__ === true;
}

export function isPreviewTools(): boolean {
  return import.meta.env.DEV || isA11yFixtureBuild();
}

declare global {
  interface Window {
    __A11Y_SIGNED_IN__?: boolean;
    __A11Y_ADMIN__?: boolean;
  }
}
