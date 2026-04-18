import React, {useState} from 'react';
import {View, StyleSheet, Alert, Image} from 'react-native';
import {Text, Button, ActivityIndicator} from 'react-native-paper';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {useAppDispatch} from '../../store';
import {signIn} from '../../store/slices/authSlice';
import {useTheme} from '../../hooks/useTheme';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/calendar'],
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
  offlineAccess: true,
});

const SignInScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {theme} = useTheme();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      dispatch(
        signIn({
          user: {
            id: userInfo.user.id,
            name: userInfo.user.name || '',
            email: userInfo.user.email,
            photo: userInfo.user.photo || null,
          },
          accessToken: tokens.accessToken,
          idToken: userInfo.idToken || '',
        }),
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === statusCodes.IN_PROGRESS) return;
      Alert.alert('Sign In Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dispatch(
      signIn({
        user: {id: 'local', name: 'Local User', email: '', photo: null},
        accessToken: '',
        idToken: '',
      }),
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, {backgroundColor: theme.colors.primary}]}>
          <Text style={styles.logoText}>✓</Text>
        </View>
        <Text style={[styles.appName, {color: theme.colors.onBackground}]}>
          TickTick
        </Text>
        <Text style={[styles.tagline, {color: theme.colors.taskComplete}]}>
          Capture ideas, achieve goals
        </Text>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleGoogleSignIn}
              style={styles.googleButton}
              icon="google"
              contentStyle={styles.buttonContent}>
              Continue with Google
            </Button>
            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.skipButton}
              textColor={theme.colors.taskComplete}>
              Use without account (offline only)
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'space-between', padding: 32},
  header: {alignItems: 'center', marginTop: 80},
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {fontSize: 40, color: '#FFF'},
  appName: {fontSize: 32, fontWeight: '700', letterSpacing: -0.5},
  tagline: {fontSize: 16, marginTop: 8},
  actions: {marginBottom: 40},
  googleButton: {borderRadius: 12, marginBottom: 12},
  buttonContent: {height: 48},
  skipButton: {marginTop: 4},
});

export default SignInScreen;
