import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15;

interface GestureContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  enabled?: boolean;
}

export function GestureContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onDoubleTap,
  enabled = true,
}: GestureContainerProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate(event => {
      translateX.value = event.translationX * 0.3;
    })
    .onEnd(event => {
      if (event.translationX > SWIPE_THRESHOLD && onSwipeRight) {
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      }
      translateX.value = withSpring(0, {damping: 20, stiffness: 200});
    });

  const tapGesture = Gesture.Tap()
    .enabled(enabled && !!onTap)
    .onEnd(() => {
      if (onTap) {
        runOnJS(onTap)();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .enabled(enabled && !!onDoubleTap)
    .numberOfTaps(2)
    .onEnd(() => {
      if (onDoubleTap) {
        runOnJS(onDoubleTap)();
      }
    });

  const composedGestures = Gesture.Race(
    panGesture,
    Gesture.Exclusive(doubleTapGesture, tapGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
