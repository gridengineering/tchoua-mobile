import { Alert, Platform } from "react-native";

export function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "Confirmer"
) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Annuler", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
