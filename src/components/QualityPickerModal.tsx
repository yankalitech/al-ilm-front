import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import type { VideoQualite } from '../api/coursesApi';
import { QUALITY_DESCRIPTIONS, QualityLabel, estimateSizeMB } from '../utils/videoQuality';

interface Props {
  visible: boolean;
  title: string;
  qualites: VideoQualite[];
  selected?: QualityLabel | null;
  durationSec?: number; // affiche la taille estimée de chaque qualité (téléchargement)
  onSelect: (label: QualityLabel) => void;
  onClose: () => void;
}

// Choix de la qualité vidéo (lecture ou téléchargement), de 720p à 360p
const QualityPickerModal = ({ visible, title, qualites, selected, durationSec, onSelect, onClose }: Props) => {
  const { colors } = useTheme();
  return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
      <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{title}</Text>
        {qualites.map((q) => {
          const isSelected = q.label === selected;
          return (
            <TouchableOpacity
              key={q.label}
              onPress={() => onSelect(q.label)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: isSelected ? colors.primary : colors.text, fontSize: 16, fontWeight: isSelected ? 'bold' : '500' }}>
                  {q.label}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {QUALITY_DESCRIPTIONS[q.label]}
                  {durationSec ? ` · ≈ ${estimateSizeMB(q.label, durationSec)} Mo` : ''}
                </Text>
              </View>
              {isSelected && <Ionicons name="checkmark" size={22} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', paddingTop: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Annuler</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
  );
};

export default QualityPickerModal;
