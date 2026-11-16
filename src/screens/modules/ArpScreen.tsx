import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiOnline, getSelectedAssociation } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SHADOW, SPACING } from '../../theme';
import { showAlert } from '../../utils/feedback';

type ArpDimensions = {
  organisation: 'autonome' | 'section' | 'federation';
  adhesion: 'individuelle' | 'familiale' | 'institutionnelle';
  cotisation: 'fixe' | 'parts' | 'nature';
  tontine: 'aucune' | 'rotation' | 'tirage' | 'encheres';
  credit: 'aucun' | 'zero' | 'amortissable';
  aide: 'aucune' | 'forfait' | 'jours';
  canal: 'especes' | 'banque' | 'mobile_money';
  devise: 'unique' | 'conversion';
  connexion: 'en_ligne' | 'hors_ligne';
  validation: 'simple' | 'double';
};

type ArpModuleKey =
  | 'tontine'
  | 'savings'
  | 'credit'
  | 'socialAid'
  | 'nature'
  | 'meetings'
  | 'projects'
  | 'stocks'
  | 'events'
  | 'community'
  | 'investment'
  | 'collation';

type ArpConfig = {
  schemaVersion: 1;
  identity: {
    purposes: string[];
    legalStatus: string;
    legalStatusProof: string;
    country: string;
    currency: string;
    timezone: string;
    startModel: string;
    parentId: string | null;
    creationDate: string | null;
  };
  governance: {
    quorumPct: number;
    majority: 'RELATIVE' | 'ABSOLUE' | 'QUALIFIEE' | 'UNANIMITE';
    convocationDays: number;
    mandateYears: number;
    maxRenewals: number;
    separationOfDuties: boolean;
    proxyMax: number;
    officersDeclared: boolean;
    creationDecisionRef: string;
  };
  dimensions: ArpDimensions;
  modules: Record<ArpModuleKey, boolean>;
  notes: string;
  [key: string]: unknown;
};

type ArpIssue = {
  code: string;
  severity: 'error' | 'warning';
  field?: string;
  domain?: string;
  message: string;
};

type ArpFund = {
  id: string;
  code: string;
  name: string;
  type: 'LIBRE' | 'AFFECTE' | 'RESERVE' | 'DEPOT';
  currency: string;
  status: string;
  balanceMinor: string;
  reservedMinor: string;
  availableMinor: string;
};

type ArpVersion = {
  id: string;
  version: number;
  status: string;
  origin: string;
  hash: string;
  effectiveAt: string | null;
  createdAt: string;
};

type ArpResponse = {
  profile: {
    id: string;
    associationId: string;
    structure: string;
    status: string;
    origin: string;
    version: number;
    effectiveAt: string | null;
  };
  config: ArpConfig;
  hasDraft: boolean;
  checks: {
    ok: boolean;
    errors: ArpIssue[];
    warnings: ArpIssue[];
    conditions: string[];
    completeness: number;
  };
  capabilities: Record<string, boolean>;
  versions: ArpVersion[];
  funds: ArpFund[];
  canEdit: boolean;
  canPublish: boolean;
  myRole: string | null;
  association: { id: string; name: string; status: string };
};

type TabKey = 'profil' | 'modules' | 'fonds' | 'versions';

const ZERO_DECIMAL_CURRENCIES = new Set(['XAF', 'XOF', 'BIF', 'GNF', 'JPY', 'RWF']);

function formatMinor(minorStr: string, currency: string): string {
  const minor = Number(minorStr || '0');
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return `${minor.toLocaleString('fr-FR')} ${currency}`;
  }
  return `${(minor / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

const DIMENSION_META: Array<{
  key: keyof ArpDimensions;
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
    {
      key: 'organisation',
      label: 'Organisation',
      options: [
        { value: 'autonome', label: 'Autonome' },
        { value: 'section', label: 'Section' },
        { value: 'federation', label: 'Fédération' },
      ],
    },
    {
      key: 'adhesion',
      label: 'Adhésion',
      options: [
        { value: 'individuelle', label: 'Individuelle' },
        { value: 'familiale', label: 'Familiale' },
        { value: 'institutionnelle', label: 'Institutionnelle' },
      ],
    },
    {
      key: 'cotisation',
      label: 'Cotisation',
      options: [
        { value: 'fixe', label: 'Fixe' },
        { value: 'parts', label: 'Parts' },
        { value: 'nature', label: 'Nature' },
      ],
    },
    {
      key: 'tontine',
      label: 'Tontine',
      options: [
        { value: 'aucune', label: 'Aucune' },
        { value: 'rotation', label: 'Rotation' },
        { value: 'tirage', label: 'Tirage' },
        { value: 'encheres', label: 'Enchères' },
      ],
    },
    {
      key: 'credit',
      label: 'Crédit',
      options: [
        { value: 'aucun', label: 'Aucun' },
        { value: 'zero', label: 'Taux 0%' },
        { value: 'amortissable', label: 'Amortissable' },
      ],
    },
    {
      key: 'aide',
      label: 'Aide sociale',
      options: [
        { value: 'aucune', label: 'Aucune' },
        { value: 'forfait', label: 'Forfait' },
        { value: 'jours', label: 'Par jours' },
      ],
    },
    {
      key: 'canal',
      label: 'Canal principal',
      options: [
        { value: 'especes', label: 'Espèces' },
        { value: 'banque', label: 'Banque' },
        { value: 'mobile_money', label: 'Mobile Money' },
      ],
    },
    {
      key: 'validation',
      label: 'Validation financière',
      options: [
        { value: 'simple', label: 'Simple' },
        { value: 'double', label: 'Double' },
      ],
    },
  ];

const MODULE_LABELS: Array<{ key: ArpModuleKey; label: string; desc: string }> = [
  { key: 'tontine', label: 'Tontine', desc: 'Cycles, parts, bénéficiaires et tirages' },
  { key: 'savings', label: 'Épargne', desc: 'Dépôts individuels et intérêts annuels' },
  { key: 'credit', label: 'Prêts & Crédit', desc: 'Demandes, validation et remboursements' },
  { key: 'socialAid', label: 'Aide sociale / Solidarité', desc: 'Caisse de secours et allocations' },
  { key: 'nature', label: 'Cotisations en nature', desc: 'Biens, vivres et valorisation' },
  { key: 'meetings', label: 'Réunions & Séances', desc: 'Convocations, présences et PV' },
  { key: 'projects', label: 'Projets collectifs', desc: 'Budgets et suivi de projets' },
  { key: 'stocks', label: 'Stocks & Matériel', desc: 'Inventaire et mouvements de stock' },
  { key: 'events', label: 'Événements', desc: 'Cérémonies et cotisations ponctuelles' },
  { key: 'community', label: 'Vie associative', desc: 'Annonces, sondages et forum' },
  { key: 'investment', label: 'Investissements', desc: 'Placements et dividendes' },
  { key: 'collation', label: 'Collation / Réception', desc: 'Tour de réception des séances' },
];

const FUND_TYPES: Array<{ value: ArpFund['type']; label: string }> = [
  { value: 'LIBRE', label: 'Libre' },
  { value: 'AFFECTE', label: 'Affecté' },
  { value: 'RESERVE', label: 'Réserve' },
  { value: 'DEPOT', label: 'Dépôt' },
];

export function ArpScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [data, setData] = useState<ArpResponse | null>(null);
  const [config, setConfig] = useState<ArpConfig | null>(null);
  const [associationId, setAssociationId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('profil');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');

  // Create fund form
  const [showNewFund, setShowNewFund] = useState(false);
  const [fundCode, setFundCode] = useState('');
  const [fundName, setFundName] = useState('');
  const [fundType, setFundType] = useState<ArpFund['type']>('LIBRE');

  // Movement modal/inline form per fund
  const [moveFundId, setMoveFundId] = useState<string | null>(null);
  const [moveDir, setMoveDir] = useState<'IN' | 'OUT'>('IN');
  const [moveAmount, setMoveAmount] = useState('');
  const [moveDesc, setMoveDesc] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    setMessage('');
    try {
      const id = await getSelectedAssociation();
      if (!id) throw new Error('Sélectionnez une association depuis l’accueil.');
      const res = await apiOnline<ArpResponse>(`/associations/${id}/arp`);
      setAssociationId(id);
      setData(res);
      setConfig(res.config);
      setDirty(false);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDimension = (key: keyof ArpDimensions, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      dimensions: { ...config.dimensions, [key]: value },
    });
    setDirty(true);
  };

  const toggleModule = (key: ArpModuleKey, checked: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      modules: { ...config.modules, [key]: checked },
    });
    setDirty(true);
  };

  const saveConfig = async (publish: boolean) => {
    if (!associationId || !config) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await apiOnline<ArpResponse>(
        `/associations/${associationId}/arp`,
        { config, publish },
        'PUT'
      );
      setData(res);
      setConfig(res.config);
      setDirty(false);
      setMessage(
        publish
          ? `Version v${res.profile.version} publiée avec succès.`
          : 'Brouillon ARP enregistré.'
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFund = async () => {
    if (!associationId || !fundCode.trim() || !fundName.trim()) {
      showAlert('Champs requis', 'Renseignez le code et le nom du fonds.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await apiOnline(
        `/associations/${associationId}/arp/funds`,
        {
          code: fundCode.trim().toUpperCase(),
          name: fundName.trim(),
          type: fundType,
          currency: config?.identity?.currency || 'XAF',
        },
        'POST'
      );
      setFundCode('');
      setFundName('');
      setShowNewFund(false);
      await load();
      setMessage('Fonds créé.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handlePostMovement = async () => {
    if (!associationId || !moveFundId || !moveAmount.trim()) {
      showAlert('Montant requis', 'Saisissez un montant valide.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await apiOnline(
        `/associations/${associationId}/arp/funds/${moveFundId}/movements`,
        {
          direction: moveDir,
          amount: moveAmount.trim(),
          description: moveDesc.trim() || (moveDir === 'IN' ? 'Entrée mobile' : 'Sortie mobile'),
        },
        'POST'
      );
      setMoveFundId(null);
      setMoveAmount('');
      setMoveDesc('');
      await load();
      setMessage('Mouvement enregistré.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>🏛️ Cadre ARP & Fonds</Text>
          {data && (
            <Text style={[styles.subtitle, { color: colors.gray }]}>
              {data.association.name} · v{data.profile.version} ({data.profile.status})
              {data.hasDraft ? ' · Brouillon en cours' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          disabled={busy}
          onPress={load}
          style={[styles.refreshBtn, { borderColor: colors.lightGray, backgroundColor: colors.surface }]}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>↻</Text>
        </TouchableOpacity>
      </View>

      {busy && <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />}
      {!!message && (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: colors.surface, borderColor: colors.lightGray },
          ]}
        >
          <Text style={{ color: colors.text }}>{message}</Text>
        </View>
      )}

      {data && config && (
        <>
          {/* Completeness & Action Bar */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.lightGray },
              SHADOW.sm,
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Conformité : {data.checks.completeness}%
              </Text>
              <Text
                style={{
                  color: data.checks.ok ? colors.success : colors.warning,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {data.checks.ok ? '✓ Prêt à publier' : `${data.checks.errors.length} point(s) requis`}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.lightGray }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, Math.max(0, data.checks.completeness))}%`,
                    backgroundColor: data.checks.ok ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>

            {data.checks.errors.slice(0, 3).map((err, i) => (
              <Text key={`${err.code}-${i}`} style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                • {err.message}
              </Text>
            ))}

            {data.canEdit && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  disabled={busy}
                  onPress={() => saveConfig(false)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: dirty ? colors.primary : colors.lightGray,
                      flex: 1,
                    },
                  ]}
                >
                  <Text style={styles.actionBtnText}>Enregistrer brouillon</Text>
                </TouchableOpacity>
                {data.canPublish && (
                  <TouchableOpacity
                    disabled={busy || !data.checks.ok}
                    onPress={() => saveConfig(true)}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: data.checks.ok ? colors.success : colors.gray,
                        flex: 1,
                        opacity: data.checks.ok ? 1 : 0.6,
                      },
                    ]}
                  >
                    <Text style={styles.actionBtnText}>Publier</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(
              [
                { key: 'profil', label: 'Profil' },
                { key: 'modules', label: 'Modules' },
                { key: 'fonds', label: `Fonds (${data.funds.length})` },
                { key: 'versions', label: `Versions (${data.versions.length})` },
              ] as Array<{ key: TabKey; label: string }>
            ).map((t) => {
              const active = tab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.lightGray,
                    },
                  ]}
                >
                  <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB: PROFIL */}
          {tab === 'profil' && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.lightGray },
                SHADOW.sm,
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Dimensions du cadre ARP
              </Text>
              {DIMENSION_META.map((dim) => (
                <View key={dim.key} style={{ marginBottom: 12 }}>
                  <Text style={[styles.fieldLabel, { color: colors.gray }]}>{dim.label}</Text>
                  <View style={styles.pillWrap}>
                    {dim.options.map((opt) => {
                      const selected = config.dimensions[dim.key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          disabled={!data.canEdit || busy}
                          onPress={() => updateDimension(dim.key, opt.value)}
                          style={[
                            styles.optionPill,
                            {
                              backgroundColor: selected ? colors.primary : colors.background,
                              borderColor: selected ? colors.primary : colors.lightGray,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selected ? '#fff' : colors.text,
                              fontSize: 12,
                              fontWeight: selected ? '700' : '500',
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>
                Identité & Notes
              </Text>
              <Text style={[styles.fieldLabel, { color: colors.gray }]}>
                Devise : {config.identity.currency} · Pays : {config.identity.country}
              </Text>
              <Text style={[styles.fieldLabel, { color: colors.gray, marginTop: 8 }]}>
                Notes de version / Décision
              </Text>
              <TextInput
                editable={data.canEdit && !busy}
                value={config.notes ?? ''}
                onChangeText={(text) => {
                  setConfig({ ...config, notes: text });
                  setDirty(true);
                }}
                placeholder="Notes sur le cadre de gestion..."
                placeholderTextColor={colors.gray}
                multiline
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.lightGray, minHeight: 70 },
                ]}
              />
            </View>
          )}

          {/* TAB: MODULES */}
          {tab === 'modules' && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.lightGray },
                SHADOW.sm,
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Modules activés
              </Text>
              {MODULE_LABELS.map((mod) => (
                <View
                  key={mod.key}
                  style={[styles.moduleRow, { borderBottomColor: colors.lightGray }]}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
                      {mod.label}
                    </Text>
                    <Text style={{ color: colors.gray, fontSize: 12 }}>{mod.desc}</Text>
                  </View>
                  <Switch
                    disabled={!data.canEdit || busy}
                    value={Boolean(config.modules?.[mod.key])}
                    onValueChange={(val) => toggleModule(mod.key, val)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* TAB: FONDS */}
          {tab === 'fonds' && (
            <View>
              {data.canEdit && (
                <TouchableOpacity
                  onPress={() => setShowNewFund(!showNewFund)}
                  style={[styles.actionBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
                >
                  <Text style={styles.actionBtnText}>
                    {showNewFund ? 'Fermer le formulaire' : '+ Nouveau fonds ARP'}
                  </Text>
                </TouchableOpacity>
              )}

              {showNewFund && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.lightGray },
                    SHADOW.sm,
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Créer un fonds</Text>
                  <TextInput
                    placeholder="Code (ex: CAISSE_SOC)"
                    placeholderTextColor={colors.gray}
                    value={fundCode}
                    onChangeText={setFundCode}
                    autoCapitalize="characters"
                    style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                  />
                  <TextInput
                    placeholder="Nom du fonds"
                    placeholderTextColor={colors.gray}
                    value={fundName}
                    onChangeText={setFundName}
                    style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                  />
                  <View style={styles.pillWrap}>
                    {FUND_TYPES.map((ft) => (
                      <TouchableOpacity
                        key={ft.value}
                        onPress={() => setFundType(ft.value)}
                        style={[
                          styles.optionPill,
                          {
                            backgroundColor:
                              fundType === ft.value ? colors.primary : colors.background,
                            borderColor: fundType === ft.value ? colors.primary : colors.lightGray,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: fundType === ft.value ? '#fff' : colors.text,
                            fontSize: 12,
                          }}
                        >
                          {ft.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    disabled={busy}
                    onPress={handleCreateFund}
                    style={[styles.actionBtn, { backgroundColor: colors.success, marginTop: 10 }]}
                  >
                    <Text style={styles.actionBtnText}>Créer le fonds</Text>
                  </TouchableOpacity>
                </View>
              )}

              {data.funds.length === 0 ? (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.lightGray },
                  ]}
                >
                  <Text style={{ color: colors.gray }}>Aucun fonds ARP enregistré.</Text>
                </View>
              ) : (
                data.funds.map((fund) => (
                  <View
                    key={fund.id}
                    style={[
                      styles.card,
                      { backgroundColor: colors.surface, borderColor: colors.lightGray },
                      SHADOW.sm,
                    ]}
                  >
                    <View style={styles.rowBetween}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
                        {fund.name} ({fund.code})
                      </Text>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                        {fund.type} · {fund.status}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text, marginTop: 6, fontSize: 14 }}>
                      Disponible :{' '}
                      <Text style={{ fontWeight: '700', color: colors.success }}>
                        {formatMinor(fund.availableMinor, fund.currency)}
                      </Text>
                    </Text>
                    <Text style={{ color: colors.gray, fontSize: 12, marginTop: 2 }}>
                      Solde : {formatMinor(fund.balanceMinor, fund.currency)} · Réservé :{' '}
                      {formatMinor(fund.reservedMinor, fund.currency)}
                    </Text>

                    {data.canEdit && fund.status === 'ACTIVE' && (
                      <TouchableOpacity
                        onPress={() =>
                          setMoveFundId(moveFundId === fund.id ? null : fund.id)
                        }
                        style={{ marginTop: 10 }}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                          {moveFundId === fund.id ? 'Annuler' : '⇄ Enregistrer un mouvement'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {moveFundId === fund.id && (
                      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.lightGray }}>
                        <View style={styles.pillWrap}>
                          {(['IN', 'OUT'] as const).map((dir) => (
                            <TouchableOpacity
                              key={dir}
                              onPress={() => setMoveDir(dir)}
                              style={[
                                styles.optionPill,
                                {
                                  backgroundColor:
                                    moveDir === dir ? colors.primary : colors.background,
                                  borderColor:
                                    moveDir === dir ? colors.primary : colors.lightGray,
                                },
                              ]}
                            >
                              <Text style={{ color: moveDir === dir ? '#fff' : colors.text, fontSize: 12 }}>
                                {dir === 'IN' ? 'Entrée (+)' : 'Sortie (-)'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TextInput
                          placeholder={`Montant (${fund.currency})`}
                          placeholderTextColor={colors.gray}
                          keyboardType="numeric"
                          value={moveAmount}
                          onChangeText={setMoveAmount}
                          style={[styles.input, { color: colors.text, borderColor: colors.lightGray, marginTop: 8 }]}
                        />
                        <TextInput
                          placeholder="Motif / Description"
                          placeholderTextColor={colors.gray}
                          value={moveDesc}
                          onChangeText={setMoveDesc}
                          style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
                        />
                        <TouchableOpacity
                          disabled={busy}
                          onPress={handlePostMovement}
                          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        >
                          <Text style={styles.actionBtnText}>Valider le mouvement</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB: VERSIONS */}
          {tab === 'versions' && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.lightGray },
                SHADOW.sm,
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Historique des versions
              </Text>
              {data.versions.length === 0 ? (
                <Text style={{ color: colors.gray }}>Aucune version publiée.</Text>
              ) : (
                data.versions.map((v) => (
                  <View
                    key={v.id}
                    style={[styles.moduleRow, { borderBottomColor: colors.lightGray }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '700' }}>
                        Version {v.version} · {v.status}
                      </Text>
                      <Text style={{ color: colors.gray, fontSize: 12 }}>
                        Origine : {v.origin} · {new Date(v.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text style={{ color: colors.gray, fontSize: 11 }}>
                      #{v.hash.slice(0, 8)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 48 },
  backBtn: { marginBottom: SPACING.sm },
  backText: { fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    padding: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
