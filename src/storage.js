// Small wrapper over AsyncStorage for the few things we persist on-device:
// the chosen role and the paired family id.

import AsyncStorage from "@react-native-async-storage/async-storage";

const ROLE_KEY = "role"; // "parent" | "child"
const FAMILY_KEY = "familyId";

export async function saveRole(role) {
  await AsyncStorage.setItem(ROLE_KEY, role);
}
export async function getRole() {
  return AsyncStorage.getItem(ROLE_KEY);
}

export async function saveFamilyId(id) {
  await AsyncStorage.setItem(FAMILY_KEY, id);
}
export async function getFamilyId() {
  return AsyncStorage.getItem(FAMILY_KEY);
}

export async function clearAll() {
  await AsyncStorage.multiRemove([ROLE_KEY, FAMILY_KEY]);
}
