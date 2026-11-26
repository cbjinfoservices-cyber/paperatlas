import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { countries, type LocationFilter, type Option } from './catalog';
import { colors, s } from './ui';

function Choice({ label, allLabel, options, value, onChange }: {
  label: string; allLabel: string; options: Option[]; value: string; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value)?.label ?? allLabel;
  return <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label} : ${selected}`}
      accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={s.choice}>
      <Text style={s.choiceText}>{selected}</Text>
      <Feather name="chevron-down" size={18} color={colors.accentLight} />
    </Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={s.modalBackdrop}>
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text accessibilityRole="header" style={s.title}>{label}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setOpen(false)} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {[{ value: '', label: allLabel }, ...options].map(option => (
              <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }}
                onPress={() => { onChange(option.value); setOpen(false); }} style={s.modalOption}>
                <Text style={[s.text, value === option.value && s.accent]}>{option.label}</Text>
                {value === option.value ? <Feather name="check" size={18} color={colors.accent} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </View>;
}

export function FilterFields({ typeLabel, typeOptions, typeValue, onType, location, onLocation }: {
  typeLabel?: string; typeOptions?: Option[]; typeValue?: string; onType?: (value: string) => void;
  location: LocationFilter; onLocation: (value: LocationFilter) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = Number(Boolean(typeValue)) + Number(Boolean(location.country)) + Number(Boolean(location.region));
  return <View style={s.filterPanel}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={s.filterHeader}>
      <View style={s.row}>
        <Feather name="sliders" size={17} color={colors.accent} />
        <Text style={s.title}>Filtres{active ? ` (${active})` : ''}</Text>
      </View>
      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.accentLight} />
    </Pressable>
    {expanded ? <>
    {typeLabel && typeOptions && onType ? <Choice label={typeLabel} allLabel="Tous les types"
      options={typeOptions} value={typeValue ?? ''} onChange={onType} /> : null}
    <Choice label="Pays" allLabel="Tous les pays" options={countries} value={location.country}
      onChange={country => onLocation({ ...location, country })} />
    <View style={s.field}>
      <Text style={s.fieldLabel}>Région ou ville</Text>
      <TextInput value={location.region} onChangeText={region => onLocation({ ...location, region })}
        style={s.input} accessibilityLabel="Région ou ville" placeholder="Ex. Alger" placeholderTextColor={colors.muted} maxLength={100} />
    </View>
    {(location.country || location.region || typeValue) ? <Pressable accessibilityRole="button"
      onPress={() => { onLocation({ country: '', region: '' }); onType?.(''); }} style={s.clearFilters}>
      <Text style={s.accent}>Effacer les filtres</Text>
    </Pressable> : null}
    </> : null}
  </View>;
}
