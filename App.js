import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "./src/theme";
import { getRole, saveRole, getFamilyId, saveFamilyId, clearAll } from "./src/storage";
import RoleSelectScreen from "./src/screens/RoleSelectScreen";
import ParentSetupScreen from "./src/screens/ParentSetupScreen";
import ParentDashboardScreen from "./src/screens/ParentDashboardScreen";
import ChildSetupScreen from "./src/screens/ChildSetupScreen";
import ChildTrackingScreen from "./src/screens/ChildTrackingScreen";

// Importing this registers the background TaskManager task at startup.
import "./src/location/locationTask";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    (async () => {
      setRole(await getRole());
      setFamilyId(await getFamilyId());
      setLoading(false);
    })();
  }, []);

  async function pickRole(r) {
    await saveRole(r);
    setRole(r);
  }

  async function setFamily(id) {
    await saveFamilyId(id);
    setFamilyId(id);
  }

  // Testing helper: forget the role + pairing so you can set this phone up
  // again from scratch. The child screen stops tracking before calling this.
  async function resetApp() {
    await clearAll();
    setFamilyId(null);
    setRole(null);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!role) return <RoleSelectScreen onPick={pickRole} />;

  if (role === "parent") {
    if (!familyId) return <ParentSetupScreen onReady={setFamily} />;
    return <ParentDashboardScreen familyId={familyId} onReset={resetApp} />;
  }

  // child
  if (!familyId) return <ChildSetupScreen onPaired={setFamily} />;
  return <ChildTrackingScreen familyId={familyId} onReset={resetApp} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
});
