import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please try again later',
  icon = 'alert-circle-outline',
  onRetry,
  retryText = 'Try Again',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color="#ef4444" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="primary"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  style?: ViewStyle;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  style,
}) => {
  return (
    <ErrorState
      title="No Internet Connection"
      message="Please check your network connection and try again"
      icon="wifi-outline"
      onRetry={onRetry}
      retryText="Retry"
      style={style}
    />
  );
};

interface NotFoundErrorProps {
  message?: string;
  onGoBack?: () => void;
  style?: ViewStyle;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  message = "The content you're looking for doesn't exist",
  onGoBack,
  style,
}) => {
  return (
    <ErrorState
      title="Not Found"
      message={message}
      icon="search-outline"
      onRetry={onGoBack}
      retryText="Go Back"
      style={style}
    />
  );
};

interface ServerErrorProps {
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ServerError: React.FC<ServerErrorProps> = ({
  onRetry,
  style,
}) => {
  return (
    <ErrorState
      title="Server Error"
      message="Our servers are experiencing issues. Please try again in a moment"
      icon="server-outline"
      onRetry={onRetry}
      retryText="Retry"
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
});