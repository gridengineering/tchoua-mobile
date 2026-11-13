import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";
import { showAlert } from "../utils/feedback";

export const ChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Salut tout le monde ! La réunion de dimanche est maintenue à 15h.", user: "Marie N.", time: "09:00", me: false },
    { id: 2, text: "C'est noté Marie. Je serai là avec ma cotisation.", user: "Jean-Pierre", time: "09:15", me: false },
    { id: 3, text: "Super ! N'oubliez pas vos carnets.", user: "Moi", time: "09:30", me: true },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: input,
      user: "Moi",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      me: true
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>TE</Text>
          </View>
          <View>
            <Text style={styles.groupName}>Tontine Entrepreneurs</Text>
            <Text style={styles.groupStatus}>12 membres · En ligne</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => showAlert("Appel de groupe", "Connexion à la salle audio Tontine Entrepreneurs...")}
        >
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.chatArea}
        contentContainerStyle={{ padding: SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageRow, msg.me ? styles.myRow : styles.otherRow]}>
            {!msg.me && <Text style={styles.userName}>{msg.user}</Text>}
            <View style={[styles.bubble, msg.me ? styles.myBubble : styles.otherBubble]}>
              <Text style={[styles.messageText, msg.me ? styles.myText : styles.otherText]}>
                {msg.text}
              </Text>
              <Text style={[styles.timeText, msg.me ? styles.myTime : styles.otherTime]}>
                {msg.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputArea}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() =>
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  text: "📎 Reçu de cotisation joint (#TCH-2026)",
                  user: "Moi",
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  me: true,
                },
              ])
            }
          >
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.6 }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 80,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  groupIconText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 18,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  groupStatus: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  chatArea: {
    flex: 1,
  },
  messageRow: {
    marginBottom: SPACING.md,
    maxWidth: "80%",
  },
  myRow: {
    alignSelf: "flex-end",
  },
  otherRow: {
    alignSelf: "flex-start",
  },
  userName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    ...SHADOW.sm,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: COLORS.white,
  },
  otherText: {
    color: COLORS.black,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  myTime: {
    color: "rgba(255,255,255,0.6)",
  },
  otherTime: {
    color: COLORS.gray,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  sendIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
});
