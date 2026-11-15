import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  apiGet,
  apiOnline,
  getAuthHeaders,
  getRtcChatToken,
  getRtcJitsiToken,
  resolveWebUrl,
  RTC_ENDPOINTS,
  setSelectedAssociation,
  uploadChatFile,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SHADOW, SPACING } from "../theme";
import { ASSOC_TYPE_META, AssociationSummary, getMemberCount } from "../types/association";
import { showAlert } from "../utils/feedback";

type MemberContact = {
  userId: string;
  name: string;
  avatar?: string | null;
  role: string;
  associationId: string;
  associationName: string;
};

type ChatMessage = {
  id: string;
  content: string;
  type: string;
  channel: string;
  mediaUrl?: string | null;
  createdAt: string;
  membership?: {
    userId?: string;
    role?: string;
    user?: { id: string; name: string; avatar?: string | null };
  };
};

type ActiveRoom =
  | { kind: "association"; assoc: AssociationSummary }
  | { kind: "direct"; member: MemberContact };

const ASSOC_MODULES = [
  { route: "CycleTontine", icon: "🔄", label: "Cycle Tontine" },
  { route: "Epargne", icon: "🏦", label: "Épargne" },
  { route: "Prets", icon: "💳", label: "Prêts & Crédit" },
  { route: "Solidarite", icon: "🤝", label: "Solidarité" },
  { route: "Sessions", icon: "📅", label: "Sessions & Tirage" },
  { route: "Membres", icon: "👥", label: "Membres" },
  { route: "Arp", icon: "🏛️", label: "Cadre ARP & Fonds" },
  { route: "Historique", icon: "📜", label: "Historique" },
  { route: "Interets", icon: "✨", label: "Intérêts" },
  { route: "Calendar", icon: "📆", label: "Calendrier" },
  { route: "Rapports", icon: "📈", label: "Rapports" },
  { route: "Evenements", icon: "🎉", label: "Événements" },
  { route: "Wallet", icon: "👛", label: "Portefeuille" },
  { route: "ConseilsIA", icon: "🤖", label: "Conseils IA" },
];

const CHANNELS = [
  { id: "GENERAL", label: "💬 Général" },
  { id: "ANNONCES", label: "📢 Annonces" },
  { id: "BUREAU", label: "🏛️ Bureau" },
];

function isImageUrl(url?: string | null, type?: string): boolean {
  if (type === "IMAGE") return true;
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

function directChannelId(userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `DM_${a}_${b}`;
}

export const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Conversations list state
  const [associations, setAssociations] = useState<AssociationSummary[]>([]);
  const [contacts, setContacts] = useState<MemberContact[]>([]);
  const [listFilter, setListFilter] = useState<"all" | "groups" | "members">("all");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletCurrency, setWalletCurrency] = useState("FCFA");

  // Active chat room state
  const [room, setRoom] = useState<ActiveRoom | null>(null);
  const [channel, setChannel] = useState("GENERAL");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
  const [infoVisible, setInfoVisible] = useState(false);
  const [joiningCall, setJoiningCall] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    getAuthHeaders().then(setAuthHeaders).catch(() => {});
  }, []);

  const loadDirectory = useCallback(async () => {
    setLoadingList(true);
    try {
      const [res, walletRes] = await Promise.all([
        apiGet<{ associations?: AssociationSummary[] } | AssociationSummary[]>(
          "/associations?mine=true"
        ),
        apiGet<any>("/wallet").catch(() => null),
      ]);
      if (walletRes) {
        const w = walletRes.wallet ?? walletRes;
        if (w?.balance !== undefined) setWalletBalance(Number(w.balance));
        if (w?.currency) setWalletCurrency(String(w.currency));
      }
      const list = Array.isArray(res) ? res : res?.associations ?? [];
      setAssociations(list);

      // Load members from user's associations for direct 1-to-1 chats
      const contactMap = new Map<string, MemberContact>();
      await Promise.all(
        list.slice(0, 8).map(async (assoc) => {
          try {
            const mRes = await apiGet<{ members?: any[] } | any[]>(
              `/associations/${assoc.id}/members`
            );
            const members = Array.isArray(mRes) ? mRes : mRes?.members ?? [];
            for (const m of members) {
              const uid = m.user?.id ?? m.userId;
              const uname = m.user?.name ?? m.name;
              if (!uid || !uname || uid === user?.id) continue;
              if (!contactMap.has(uid)) {
                contactMap.set(uid, {
                  userId: uid,
                  name: uname,
                  avatar: m.user?.avatar ?? null,
                  role: m.role ?? "MEMBRE",
                  associationId: assoc.id,
                  associationName: assoc.name,
                });
              }
            }
          } catch {
            // Skip inaccessible member lists
          }
        })
      );
      setContacts(Array.from(contactMap.values()));
    } catch (err) {
      showAlert("Discussions", (err as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const activeAssociationId = useMemo(() => {
    if (!room) return null;
    return room.kind === "association" ? room.assoc.id : room.member.associationId;
  }, [room]);

  const activeChannel = useMemo(() => {
    if (!room) return "GENERAL";
    if (room.kind === "association") return channel;
    if (user?.id) return directChannelId(user.id, room.member.userId);
    return `DM_${room.member.userId}`;
  }, [room, channel, user?.id]);

  const loadMessages = useCallback(async () => {
    if (!activeAssociationId) return;
    setLoadingMsgs(true);
    try {
      const res = await apiGet<{ messages?: ChatMessage[] }>(
        `/associations/${activeAssociationId}/messages?channel=${encodeURIComponent(activeChannel)}&limit=50`,
        { offlineFallback: true }
      );
      setMessages(res.messages ?? []);
    } catch {
      // Keep current messages if channel is restricted (e.g. BUREAU)
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, [activeAssociationId, activeChannel]);

  useEffect(() => {
    if (!activeAssociationId) return;
    void loadMessages();
  }, [activeAssociationId, activeChannel, loadMessages]);

  // Real-time Centrifugo WebSocket connection (chat.tchoua.com)
  useEffect(() => {
    if (!activeAssociationId) {
      setWsConnected(false);
      return;
    }

    let closed = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const connectWs = async () => {
      try {
        const { token, wsUrl } = await getRtcChatToken(activeAssociationId);
        if (closed) return;
        const targetWs = wsUrl || RTC_ENDPOINTS.chatWsUrl;
        const ws = new WebSocket(targetWs);
        wsRef.current = ws;

        const fullChan = `assoc:${activeAssociationId}:${activeChannel}`;

        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, connect: { token } }));
        };

        ws.onmessage = (evt) => {
          try {
            const lines = String(evt.data).split("\n").filter(Boolean);
            for (const line of lines) {
              const frame = JSON.parse(line);
              if (frame.connect) {
                setWsConnected(true);
                ws.send(JSON.stringify({ id: 2, subscribe: { channel: fullChan } }));
              }
              const pubData = frame.push?.pub?.data;
              if (pubData?.type === "message" && pubData.message) {
                const incoming = pubData.message as ChatMessage;
                setMessages((prev) =>
                  prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
                );
              }
            }
          } catch {
            // Ignore malformed frames
          }
        };

        ws.onerror = () => setWsConnected(false);
        ws.onclose = () => setWsConnected(false);
      } catch {
        setWsConnected(false);
      }
    };

    void connectWs();

    // Gentle fallback polling if WebSocket isn't active
    pollTimer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== 1) {
        void loadMessages();
      }
    }, 8000);

    return () => {
      closed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [activeAssociationId, activeChannel, loadMessages]);

  const openAssociationRoom = async (assoc: AssociationSummary) => {
    await setSelectedAssociation(assoc.id);
    setChannel("GENERAL");
    setMessages([]);
    setRoom({ kind: "association", assoc });
  };

  const openDirectRoom = async (member: MemberContact) => {
    await setSelectedAssociation(member.associationId);
    setMessages([]);
    setRoom({ kind: "direct", member });
  };

  const sendMessagePayload = async (payload: {
    content: string;
    type?: string;
    mediaUrl?: string;
  }) => {
    if (!activeAssociationId) return;
    setSending(true);
    try {
      const res = await apiOnline<{ message: ChatMessage }>(
        `/associations/${activeAssociationId}/messages`,
        {
          content: payload.content,
          type: payload.type ?? "TEXT",
          channel: activeChannel,
          ...(payload.mediaUrl ? { mediaUrl: payload.mediaUrl } : {}),
        },
        "POST"
      );
      if (res.message) {
        setMessages((prev) =>
          prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
        );
      }
    } catch (err) {
      showAlert("Envoi impossible", (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleSendText = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessagePayload({ content: text, type: "TEXT" });
  };

  const handlePickImage = async () => {
    if (!activeAssociationId) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert("Permission requise", "Autorisez l'accès à la galerie pour partager une image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setSending(true);
    try {
      const uploaded = await uploadChatFile(activeAssociationId, {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });
      await sendMessagePayload({
        content: `📷 ${uploaded.name}`,
        type: "IMAGE",
        mediaUrl: uploaded.url,
      });
    } catch (err) {
      showAlert("Partage d'image", (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handlePickDocument = async () => {
    if (!activeAssociationId) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setSending(true);
    try {
      const uploaded = await uploadChatFile(activeAssociationId, {
        uri: asset.uri,
        name: asset.name || `document_${Date.now()}`,
        type: asset.mimeType || "application/octet-stream",
      });
      await sendMessagePayload({
        content: `📄 ${uploaded.name}`,
        type: uploaded.isImage ? "IMAGE" : "FILE",
        mediaUrl: uploaded.url,
      });
    } catch (err) {
      showAlert("Partage de fichier", (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleJoinConference = async () => {
    if (!activeAssociationId) return;
    setJoiningCall(true);
    try {
      const res = await getRtcJitsiToken(activeAssociationId);
      await Linking.openURL(res.url);
    } catch {
      const fallbackRoom =
        room?.kind === "direct"
          ? `dm-${directChannelId(user?.id ?? "me", room.member.userId)}`
          : `assoc-${activeAssociationId}-general`;
      await Linking.openURL(`${RTC_ENDPOINTS.jitsiUrl}/${encodeURIComponent(fallbackRoom)}`);
    } finally {
      setJoiningCall(false);
    }
  };

  const navigateToModule = async (route: string) => {
    if (activeAssociationId) {
      await setSelectedAssociation(activeAssociationId);
    }
    setInfoVisible(false);
    navigation.navigate(route);
  };

  const filteredAssociations = associations.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.associationName.toLowerCase().includes(search.toLowerCase())
  );

  // ==================== VIEW 1: WHATSAPP / WECHAT DISCUSSIONS LIST ====================
  if (!room) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.listHeader, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listHeaderTitle}>Tchoua Discussions</Text>
            <Text style={styles.listHeaderSub}>
              chat.tchoua.com · meet.tchoua.com
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Wallet")}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 13 }}>👛</Text>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>
                {walletBalance !== null ? `${walletBalance.toLocaleString("fr-FR")} ${walletCurrency}` : "Wallet"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={loadDirectory} style={styles.headerActionBtn}>
              <Text style={{ color: "#fff", fontSize: 18 }}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.lightGray }]}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Rechercher une association ou un membre..."
            placeholderTextColor={colors.gray}
            style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
          />
          <View style={styles.filterRow}>
            {(
              [
                { id: "all", label: "Toutes" },
                { id: "groups", label: `Associations (${associations.length})` },
                { id: "members", label: `Membres (${contacts.length})` },
              ] as const
            ).map((f) => {
              const active = listFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setListFilter(f.id)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? colors.primary : colors.background,
                      borderColor: active ? colors.primary : colors.lightGray,
                    },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : colors.text, fontSize: 12, fontWeight: "600" }}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {loadingList && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}

          {(listFilter === "all" || listFilter === "groups") && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.gray }]}>
                GROUPES D’ASSOCIATIONS
              </Text>
              {filteredAssociations.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.gray }]}>
                  Aucune association trouvée.
                </Text>
              ) : (
                filteredAssociations.map((assoc) => {
                  const meta = ASSOC_TYPE_META[assoc.type] ?? { label: assoc.type, icon: "🌐" };
                  return (
                    <TouchableOpacity
                      key={assoc.id}
                      style={[
                        styles.chatRow,
                        { backgroundColor: colors.surface, borderBottomColor: colors.lightGray },
                      ]}
                      onPress={() => openAssociationRoom(assoc)}
                    >
                      <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                        <Text style={{ fontSize: 22 }}>{meta.icon}</Text>
                      </View>
                      <View style={styles.chatRowBody}>
                        <View style={styles.chatRowTop}>
                          <Text style={[styles.chatRowTitle, { color: colors.text }]} numberOfLines={1}>
                            {assoc.name}
                          </Text>
                          <Text style={[styles.badgeText, { color: colors.primary }]}>Groupe</Text>
                        </View>
                        <Text style={[styles.chatRowSub, { color: colors.gray }]} numberOfLines={1}>
                          {meta.label} · {getMemberCount(assoc)} membres · Appuyez pour discuter
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}

          {(listFilter === "all" || listFilter === "members") && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.gray }]}>
                MEMBRES DES ASSOCIATIONS
              </Text>
              {filteredContacts.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.gray }]}>
                  Aucun autre membre trouvé dans vos associations.
                </Text>
              ) : (
                filteredContacts.map((c) => (
                  <TouchableOpacity
                    key={c.userId}
                    style={[
                      styles.chatRow,
                      { backgroundColor: colors.surface, borderBottomColor: colors.lightGray },
                    ]}
                    onPress={() => openDirectRoom(c)}
                  >
                    <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                        {c.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.chatRowBody}>
                      <View style={styles.chatRowTop}>
                        <Text style={[styles.chatRowTitle, { color: colors.text }]} numberOfLines={1}>
                          {c.name}
                        </Text>
                        <Text style={{ color: colors.gray, fontSize: 11 }}>{c.role}</Text>
                      </View>
                      <Text style={[styles.chatRowSub, { color: colors.gray }]} numberOfLines={1}>
                        {c.associationName} · Message privé
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // ==================== VIEW 2: ACTIVE CONVERSATION (WHATSAPP STYLE) ====================
  const roomTitle =
    room.kind === "association" ? room.assoc.name : room.member.name;
  const roomSub =
    room.kind === "association"
      ? `${getMemberCount(room.assoc)} membres · Toucher pour infos & modules`
      : `${room.member.associationName} · Discussion privée`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* WhatsApp-style Header (Tap title for Association Info & Features) */}
      <View style={[styles.roomHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => setRoom(null)} style={styles.backBtn}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roomHeaderCenter}
          onPress={() => {
            if (room.kind === "association") setInfoVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.roomAvatar}>
            <Text style={{ fontSize: 18, color: colors.primary, fontWeight: "700" }}>
              {room.kind === "association"
                ? (ASSOC_TYPE_META[room.assoc.type]?.icon ?? "🏛️")
                : room.member.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomTitle} numberOfLines={1}>
              {roomTitle}
            </Text>
            <Text style={styles.roomSubtitle} numberOfLines={1}>
              {roomSub}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleJoinConference}
          disabled={joiningCall}
          style={styles.headerActionBtn}
        >
          <Text style={{ fontSize: 20 }}>{joiningCall ? "⏳" : "📹"}</Text>
        </TouchableOpacity>
        {room.kind === "association" && (
          <TouchableOpacity
            onPress={() => setInfoVisible(true)}
            style={styles.headerActionBtn}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>ℹ️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Channel selector + RTC status bar */}
      <View style={[styles.subBar, { backgroundColor: colors.surface, borderBottomColor: colors.lightGray }]}>
        {room.kind === "association" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {CHANNELS.map((ch) => {
              const active = channel === ch.id;
              return (
                <TouchableOpacity
                  key={ch.id}
                  onPress={() => setChannel(ch.id)}
                  style={[
                    styles.channelPill,
                    {
                      backgroundColor: active ? colors.primary : colors.background,
                      borderColor: active ? colors.primary : colors.lightGray,
                    },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : colors.text, fontSize: 12, fontWeight: "600" }}>
                    {ch.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={{ color: colors.gray, fontSize: 12 }}>
            Canal privé · {room.member.associationName}
          </Text>
        )}
        <Text style={{ color: wsConnected ? colors.success : colors.gray, fontSize: 11, fontWeight: "600" }}>
          {wsConnected ? "● En direct" : "○ Synchro"}
        </Text>
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 24 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {loadingMsgs && <ActivityIndicator color={colors.primary} style={{ marginVertical: 10 }} />}
        {!loadingMsgs && messages.length === 0 && (
          <Text style={{ textAlign: "center", color: colors.gray, marginTop: 24 }}>
            Aucun message dans cette discussion. Démarrez la conversation !
          </Text>
        )}
        {messages.map((msg) => {
          const senderId = msg.membership?.user?.id ?? msg.membership?.userId;
          const isMe = Boolean(user?.id && senderId === user.id);
          const senderName = msg.membership?.user?.name ?? "Membre";
          const img = isImageUrl(msg.mediaUrl, msg.type);
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isMe ? styles.myRow : styles.otherRow]}
            >
              {!isMe && (
                <Text style={[styles.senderName, { color: colors.primary }]}>
                  {senderName}
                </Text>
              )}
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.lightGray },
                ]}
              >
                {msg.mediaUrl && img && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(resolveWebUrl(msg.mediaUrl!))}
                  >
                    <Image
                      source={{
                        uri: resolveWebUrl(msg.mediaUrl),
                        headers: authHeaders,
                      }}
                      style={styles.chatImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}

                {msg.mediaUrl && !img && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(resolveWebUrl(msg.mediaUrl!))}
                    style={[
                      styles.fileCard,
                      { backgroundColor: isMe ? "rgba(255,255,255,0.18)" : colors.background },
                    ]}
                  >
                    <Text style={{ color: isMe ? "#fff" : colors.primary, fontWeight: "700", fontSize: 13 }}>
                      📎 Ouvrir la pièce jointe ↗
                    </Text>
                  </TouchableOpacity>
                )}

                {!!msg.content && (
                  <Text style={{ color: isMe ? "#fff" : colors.text, fontSize: 15 }}>
                    {msg.content}
                  </Text>
                )}
                <Text
                  style={{
                    color: isMe ? "rgba(255,255,255,0.75)" : colors.gray,
                    fontSize: 10,
                    alignSelf: "flex-end",
                    marginTop: 4,
                  }}
                >
                  {time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar: Image, Document, Text, Send */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View
          style={[
            styles.inputArea,
            { backgroundColor: colors.surface, borderTopColor: colors.lightGray },
          ]}
        >
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={sending}
            style={styles.iconBtn}
          >
            <Text style={{ fontSize: 20 }}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickDocument}
            disabled={sending}
            style={styles.iconBtn}
          >
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor={colors.gray}
            style={[
              styles.textInput,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendText}
            disabled={sending || !input.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() ? colors.primary : colors.lightGray,
              },
            ]}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {sending ? "…" : "➤"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ==================== WHATSAPP-STYLE ASSOCIATION INFO & FEATURES MODAL ==================== */}
      {room.kind === "association" && (
        <Modal
          visible={infoVisible}
          animationType="slide"
          onRequestClose={() => setInfoVisible(false)}
        >
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.roomHeader, { backgroundColor: colors.primary }]}>
              <TouchableOpacity onPress={() => setInfoVisible(false)} style={styles.backBtn}>
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.roomTitle, { flex: 1 }]}>Infos & Fonctionnalités</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 48 }}>
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: colors.surface, borderColor: colors.lightGray },
                  SHADOW.sm,
                ]}
              >
                <Text style={{ fontSize: 38, textAlign: "center" }}>
                  {ASSOC_TYPE_META[room.assoc.type]?.icon ?? "🏛️"}
                </Text>
                <Text style={[styles.infoName, { color: colors.text }]}>
                  {room.assoc.name}
                </Text>
                <Text style={{ color: colors.gray, textAlign: "center", marginTop: 4 }}>
                  {ASSOC_TYPE_META[room.assoc.type]?.label ?? room.assoc.type} ·{" "}
                  {getMemberCount(room.assoc)} membres
                </Text>
                {!!room.assoc.description && (
                  <Text style={{ color: colors.text, marginTop: 10, textAlign: "center" }}>
                    {room.assoc.description}
                  </Text>
                )}

                <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={handleJoinConference}
                    style={[styles.rtcBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                      📹 Visioconférence
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.tchoua.com/associations/${room.assoc.id}?tab=chat`
                      )
                    }
                    style={[styles.rtcBtn, { backgroundColor: colors.secondary, flex: 1 }]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                      🌐 Ouvrir sur Web
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: colors.gray, fontSize: 11, textAlign: "center", marginTop: 10 }}>
                  Jitsi: meet.tchoua.com · Chat WS: chat.tchoua.com · TURN: turn.tchoua.com:3478/5349
                </Text>
              </View>

              <Text style={[styles.sectionHeader, { color: colors.gray, paddingHorizontal: 0 }]}>
                FONCTIONNALITÉS DE L’ASSOCIATION
              </Text>
              <View style={styles.moduleGrid}>
                {ASSOC_MODULES.map((m) => (
                  <TouchableOpacity
                    key={m.route}
                    onPress={() => navigateToModule(m.route)}
                    style={[
                      styles.moduleTile,
                      { backgroundColor: colors.surface, borderColor: colors.lightGray },
                      SHADOW.sm,
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                    <Text style={[styles.moduleTileText, { color: colors.text }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listHeaderTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  listHeaderSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 },
  searchWrap: { padding: SPACING.sm, borderBottomWidth: 1 },
  searchInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: SPACING.md,
    paddingTop: 14,
    paddingBottom: 6,
  },
  emptyText: { paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 13 },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatRowBody: { flex: 1 },
  chatRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatRowTitle: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  chatRowSub: { fontSize: 13, marginTop: 2 },
  roomHeader: {
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { padding: 8 },
  roomHeaderCenter: { flex: 1, flexDirection: "row", alignItems: "center" },
  roomAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  roomTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  roomSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  headerActionBtn: { padding: 8 },
  subBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  channelPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  chatArea: { flex: 1 },
  msgRow: { marginBottom: 12, maxWidth: "82%" },
  myRow: { alignSelf: "flex-end" },
  otherRow: { alignSelf: "flex-start" },
  senderName: { fontSize: 11, fontWeight: "700", marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  chatImage: { width: 210, height: 150, borderRadius: 10, marginBottom: 6 },
  fileCard: { padding: 8, borderRadius: 8, marginBottom: 6 },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 88,
    borderTopWidth: 1,
  },
  iconBtn: { padding: 8 },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
    marginHorizontal: 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.md },
  infoName: { fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 8 },
  rtcBtn: { paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  moduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  moduleTile: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  moduleTileText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
});
