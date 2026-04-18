// Widens JSX.Element to accept ReactNode so react-native-paper v5 components
// (which declare return type as ReactNode) pass JSX type checking.
import 'react';

declare global {
  namespace JSX {
    type Element = React.ReactNode;
  }
}
