import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import Ionicons from '@expo/vector-icons/Ionicons';

import { FontFamilies } from './typography';

/** Asset map for expo-font `useFonts`. Keys match `FontFamilies` strings plus icon fonts. */
export const fontAssets = {
  [FontFamilies.display]: SpaceMono_400Regular,
  [FontFamilies.displayBold]: SpaceMono_700Bold,
  [FontFamilies.body]: DMSans_400Regular,
  [FontFamilies.bodyMedium]: DMSans_500Medium,
  [FontFamilies.bodyBold]: DMSans_700Bold,
  [FontFamilies.code]: JetBrainsMono_400Regular,
  ...Ionicons.font,
};
