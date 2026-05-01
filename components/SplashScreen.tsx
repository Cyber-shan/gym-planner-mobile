import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate icon entrance
    Animated.spring(iconScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Animate content slide up
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(contentSlide, {
      toValue: 0,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Pulse the icon ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fill progress bar over ~2 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 38);

    // Fade out and call onDone
    const fadeTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2100);

    const doneTimer = setTimeout(onDone, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const pulseScale = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const pulseOpacity = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const features = ['Track Sets & Reps', 'Progress Charts', 'Workout Templates'];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0c0a1a', '#18181b', '#0c0a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorDot1} />
      <View style={styles.decorDot2} />
      <View style={styles.decorDot3} />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        {/* Logo icon with pulse */}
        <View style={styles.iconArea}>
          <Animated.View
            style={[
              styles.iconPulseRing,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.iconBox,
              { transform: [{ scale: iconScale }] },
            ]}
          >
            <FontAwesome5 name="dumbbell" size={40} color="#ffffff" />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>LogLift</Text>
        <Text style={styles.subtitle}>Your digital workout notebook</Text>

        {/* Feature pills */}
        <View style={styles.pillRow}>
          {features.map(f => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Decorative background circles
  decorCircle1: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -128,
    left: -128,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  decorDot1: {
    position: 'absolute',
    top: '33%',
    left: '25%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  decorDot2: {
    position: 'absolute',
    top: '66%',
    right: '33%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorDot3: {
    position: 'absolute',
    top: '25%',
    right: '25%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  // Icon
  iconArea: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconPulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -8,
  },
  // Feature pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  // Progress
  progressTrack: {
    width: 160,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
});
