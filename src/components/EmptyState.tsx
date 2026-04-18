import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../hooks/useTheme';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<Props> = ({icon, title, subtitle}) => {
  const {theme} = useTheme();
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={theme.colors.outline} />
      <Text style={[styles.title, {color: theme.colors.onSurface}]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, {color: theme.colors.taskComplete}]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
