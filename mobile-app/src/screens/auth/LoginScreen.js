import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }
    
    dispatch(login({ email, password }));
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Surface style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Seafood Store</Text>
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={secureTextEntry}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureEntry}
              />
            }
            left={<TextInput.Icon icon="lock" />}
          />
          
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <Button
            mode="outlined"
            icon="google"
            onPress={() => {}}
            style={styles.socialButton}
          >
            Sign in with Google
          </Button>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerContainer}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0066cc',
  },
  button: {
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: '#0066cc',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButton: {
    marginBottom: 20,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
