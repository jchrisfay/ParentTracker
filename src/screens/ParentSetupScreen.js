import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../theme";
import { createFamily } from "../location/familyRepo";

// Parent creates a family: sets an approval PIN and gets a pairing code to
// type into the child's phone.
export default function ParentSetupScreen({ onReady }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (pin.length < 4) {
      Alert.alert("Choose a PIN", "Use at least 4 digits. You'll enter this to approve stop requests.");
      return;
    }
    setBusy(true);
    try {
      const familyId = await createFamily(pin);
      onReady(familyId);
    } catch (e) {
      Alert.alert("Couldn't create family", e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your approval PIN</Text>
      <Text style={styles.sub}>
        You'll enter this PIN whenever your child asks to stop sharing. Pick
        something they don't know.
      </Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="Approval PIN"
        placeholderTextColor={colors.dim}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
      />
      <TouchableOpacity style={styles.btn} onPress={create} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create family</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.dim, fontSize: 14, marginTop: 8, marginBottom: 24, lineHeight: 20 },
  input: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, color: colors.text, padding: 16, fontSize: 18, letterSpacing: 4 },
  btn: { backgroundColor: colors.accent, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 16 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
