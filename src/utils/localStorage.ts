import { SerializedRootStore } from "@stores/RootStore";

export const loadState = (): SerializedRootStore | undefined => {
  try {
    const raw = localStorage.getItem("cerera-store") ?? localStorage.getItem("cerera-store");
    const state = JSON.parse(raw as string);
    return state || undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
export const saveState = (state: SerializedRootStore): void => {
  localStorage.setItem("cerera-store", JSON.stringify(state));
};
