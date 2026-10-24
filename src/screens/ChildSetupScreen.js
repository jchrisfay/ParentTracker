import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { colors } from "../theme";
import { familyExists } from "../location/familyRepo";
import { requestPermissions } from "../location/locationTask";

// Child enters the pairing code shown on the parent's phone, then grants
// location permission.
export default function ChildSetupScreen({ onPaired }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function pair() {
    const familyId = code.trim().toUpperCase();
    if (familyId.length !== 6) {
      Alert.alert("Check the code", "The pairing code is 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const exists = await familyExists(familyId);
      if (!exists) {
        Alert.alert("No family found", "That code didn't match. Ask the parent to read it again.");
        return;
      }
      const perms = await requestPermissions();
      if (!perms.granted) {
        Alert.alert("Location needed", "FamilyTrack can't share location without location permission.");
        return;
      }
      if (!perms.background) {
        Alert.alert(
          "Allow 'Always'",
          "For sharing to keep working when the screen is off, set location permission to 'Allow all the time' in settings."
        );
      }
      onPaired(familyId);
    } catch (e) {
      Alert.alert("Couldn't pair", e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter pairing code</Text>
      <Text style={styles.sub}>Type the 6-character code shown on the parent's phone.</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="ABC123"
        placeholderTextColor={colors.dim}
        autoCapitalize="characters"
        maxLength={6}
      />
      <TouchableOpacity style={styles.btn} onPress={pair} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pair & start sharing</Text>}
      </TouchableOpacity>
      <Text style={styles.note}>
        Once paired, a notification will stay in your status bar while sharing is
        on, so you always know it's running.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.dim, fontSize: 14, marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, color: colors.text, padding: 16, fontSize: 24, letterSpacing: 8, textAlign: "center" },
  btn: { backgroundColor: colors.accent, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 16 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { color: colors.dim, fontSize: 12, marginTop: 20, lineHeight: 18 },
});
