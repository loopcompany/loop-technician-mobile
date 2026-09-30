import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFooter } from '../contexts/FooterProvider';

// The floating dock (contexts/FooterProvider.js) sits over the bottom of every
// screen: 52px LOOP button + 8px padding each side + border, lifted 8px above
// the safe area. Content that must stay tappable (a submit bar, the last list
// item) leaves this much room below it.
const DOCK_HEIGHT = 70;
const DOCK_GAP = 16;

export default function useFooterSpace() {
  const { isFooterVisible } = useFooter();
  const insets = useSafeAreaInsets();
  return isFooterVisible ? DOCK_HEIGHT + DOCK_GAP + (insets?.bottom || 0) : 0;
}
