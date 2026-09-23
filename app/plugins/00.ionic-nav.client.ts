/**
 * Sets the page transition animation to iOS-style (push/pop slide)
 * WITHOUT changing the global Ionic mode.
 *
 * This decouples navigation animation from component styling:
 * - Navigation transitions → iOS slide animation
 * - Component styling → remains default (md) or per-component overrides
 */
import { iosTransitionAnimation } from "@ionic/vue";

export default defineNuxtPlugin(() => {
  const win = window as any;
  if (!win.Ionic) {
    win.Ionic = {};
  }
  if (!win.Ionic.config) {
    win.Ionic.config = {};
  }

  if (typeof win.Ionic.config.set === "function") {
    win.Ionic.config.set("navAnimation", iosTransitionAnimation);
  } else {
    win.Ionic.config.navAnimation = iosTransitionAnimation;
  }
});
