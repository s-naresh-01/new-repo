import React from 'react';
import {TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../hooks/useTheme';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
  icon?: string;
}

const FAB: React.FC<Props> = ({onPress, style, icon = 'plus'}) => {
  const {theme} = useTheme();
  return (
    <TouchableOpacity
      style={[styles.fab, {backgroundColor: theme.colors.primary}, style]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Icon name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default FAB;
