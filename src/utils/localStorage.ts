import { SerializedRootStore } from "@stores/RootStore";

export const loadState = (): SerializedRootStore | undefined => {
  try {
    const raw = localStorage.getItem("ranges-store") ?? localStorage.getItem("ranges-store");
    const state = JSON.parse(raw as string);
    return state || undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
export const saveState = (state: SerializedRootStore): void => {
  localStorage.setItem("ranges-store", JSON.stringify(state));
};
