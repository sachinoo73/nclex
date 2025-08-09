import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{ height?: number | string; variant?: 'header' | 'full' }>;

export function GradientBackground({ children, height = 260, variant = 'header' }: Props) {
  const style: ViewStyle =
    variant === 'full'
      ? styles.full
      : { ...styles.header, height: typeof height === 'number' ? height : undefined };
  return (
    <LinearGradient
      colors={["#34d399", "#10b981"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  full: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


