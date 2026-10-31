// Use the design-system (react-native-paper) components, not React Native's
// unstyled primitives or HTML tags.
//   bad:  <TouchableOpacity><Text>Pay</Text></TouchableOpacity>   (Text from 'react-native')
//   good: <Button mode="contained">Pay</Button>                   (from 'react-native-paper')

import { importedNames } from './utils.js';

// React Native primitives that have an M3 component in Paper.
const RN_REPLACEMENTS = {
  Button: 'Button from react-native-paper',
  Text: 'Text from react-native-paper with an M3 variant',
  TextInput: 'TextInput from react-native-paper',
  Switch: 'Switch from react-native-paper',
  TouchableOpacity: 'Button / IconButton / TouchableRipple from react-native-paper',
  TouchableHighlight: 'Button / IconButton / TouchableRipple from react-native-paper',
  TouchableWithoutFeedback: 'Button / IconButton / TouchableRipple from react-native-paper',
  Pressable: 'Button / IconButton / TouchableRipple from react-native-paper',
  ActivityIndicator: 'ActivityIndicator from react-native-paper',
  Modal: 'Dialog / Modal from react-native-paper (inside <Portal>)',
};

// HTML tags (they only work on web, and bypass the design system).
const HTML_REPLACEMENTS = {
  button: 'Button / IconButton',
  input: 'TextInput / Checkbox / Switch',
  select: 'Menu',
  textarea: 'TextInput multiline',
  a: 'Button mode="text"',
};

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow React Native primitives and HTML controls; use the react-native-paper (M3) components' },
    schema: [],
  },
  create(context) {
    let rnNames;
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const name = node.name.name;
        if (HTML_REPLACEMENTS[name]) {
          context.report({ node, message: `HTML <${name}> bypasses the design system (and doesn't exist on iOS/Android). Use ${HTML_REPLACEMENTS[name]}.` });
          return;
        }
        rnNames ??= importedNames(context, 'react-native');
        const imported = rnNames.get(name);
        if (imported && RN_REPLACEMENTS[imported]) {
          const shown = imported === name ? name : `${name} (${imported})`;
          context.report({ node, message: `<${shown}> from 'react-native' bypasses the design system. Use ${RN_REPLACEMENTS[imported]}.` });
        }
      },
    };
  },
};
