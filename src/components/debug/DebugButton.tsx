import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DebugPanel } from './DebugPanel';

export const DebugButton: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <>
      <View style={styles.debugButton}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowPanel(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="bug" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <DebugPanel
        visible={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 9999,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});