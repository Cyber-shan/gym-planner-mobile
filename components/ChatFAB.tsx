import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

interface ChatFABProps {
  onPress: () => void;
  visible?: boolean;
}

export default function ChatFAB({ onPress, visible = true }: ChatFABProps) {
  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  React.useEffect(() => {
    if (visible) {
      scale.value = withDelay(500, withSpring(1));
    } else {
      scale.value = withTiming(0);
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
      scale.value = withSpring(0.9);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x;
      translateY.value = event.translationY + context.value.y;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: scale.value,
    };
  });

  if (!visible && scale.value === 0) return null;

  return (
    <GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
      <Animated.View
        style={[styles.fab, animatedStyle]}
      >
        <View style={styles.inner}>
          <Feather name="message-circle" size={20} color="white" />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 140 : 120, // Positioned higher to clear the navbar
    width: 50, // Smaller size
    height: 50, // Smaller size
    borderRadius: 25,
    backgroundColor: '#030213',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
