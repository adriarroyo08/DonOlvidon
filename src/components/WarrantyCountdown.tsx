import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useColorScheme';
import { typography, spacing, borderRadius } from '../theme';
import { daysUntilExpiry } from '../services/database';

interface Props {
  purchaseDate: string;
  warrantyEndDate: string;
  compact?: boolean;
}

export function WarrantyCountdown({ purchaseDate, warrantyEndDate, compact }: Props) {
  const { colors } = useTheme();
  const days = daysUntilExpiry(warrantyEndDate);
  const totalDays = Math.max(
    1,
    (new Date(warrantyEndDate).getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = Math.max(0, Math.min(1, days / totalDays));
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%` as unknown as number,
    backgroundColor: interpolateColor(
      animatedProgress.value,
      [0, 0.3, 0.7, 1],
      [colors.danger, colors.warning, colors.warning, colors.success]
    ),
  }));

  const label =
    days <= 0
      ? 'Expirada'
      : days === 1
        ? '1 dia restante'
        : days < 30
          ? `${days} dias restantes`
          : days < 365
            ? `${Math.floor(days / 30)} meses restantes`
            : `${Math.floor(days / 365)} anos, ${Math.floor((days % 365) / 30)} meses`;

  if (compact) {
    return (
      <View>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={[typography.bodySmall, { color: days <= 0 ? colors.danger : colors.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.barBg, { marginTop: spacing.xs }]}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barBg: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(128,128,128,0.2)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
