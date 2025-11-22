import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { compressImage, getCachedImage } from '../libs/imageUtils';
import { saveQueuedReport } from '../libs/db';
import { haptic } from '../libs/haptics';
import { taskReportSchema, validateForm } from '../libs/validation';

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params as { taskId: string };
  const { tasks, updateTask, addQueuedReport, isOnline } = useStore();

  const task = tasks.find((t) => t.id === taskId);
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [photos, setPhotos] = useState<string[]>([]);
  const [checklist, setChecklist] = useState(task?.checklist || []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task?.status === 'assigned') {
      updateTask(taskId, { status: 'in_progress' });
    }
  }, []);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    haptic.buttonPress();

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const compressed = await getCachedImage(result.assets[0].uri, {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
        });
        setPhotos([...photos, compressed]);
        haptic.success();
      } catch (error) {
        console.error('Image processing failed:', error);
        haptic.error();
        Alert.alert('Error', 'Failed to process image');
      }
    }
  };

  const handleChecklistToggle = (itemId: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
    haptic.checkboxToggle();
  };

  const handleSubmit = async () => {
    // Validate form data
    const formData = {
      taskId,
      notes,
      severity,
      checklistData: checklist.map(item => ({
        id: item.id,
        label: item.label,
        checked: item.checked.toString(),
        required: item.required.toString(),
      })),
    };

    const validation = validateForm(taskReportSchema, formData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      Alert.alert('Validation Error', errorMessages);
      haptic.error();
      return;
    }

    const requiredItems = checklist.filter((item) => item.required && !item.checked);
    if (requiredItems.length > 0) {
      Alert.alert('Incomplete', 'Please complete all required checklist items');
      haptic.warning();
      return;
    }

    setSubmitting(true);

    try {
      const report = {
        id: `report_${Date.now()}`,
        taskId,
        notes,
        severity,
        photos,
        videos: [],
        checklistData: checklist,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      // Save to offline queue
      await saveQueuedReport(report);
      addQueuedReport(report);

      // Update task status
      updateTask(taskId, { status: 'completed' });

      haptic.taskComplete();

      Alert.alert(
        'Report Submitted',
        isOnline
          ? 'Your report has been submitted successfully'
          : 'Your report has been saved and will sync when online',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to submit report:', error);
      haptic.taskError();
      Alert.alert('Error', 'Failed to save report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Task not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Substation Information</Text>
          <Text style={styles.substationName}>{task.substationName}</Text>
          <Text style={styles.description}>{task.description}</Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Checklist</Text>
          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => handleChecklistToggle(item.id)}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checklistLabel}>
                {item.label}
                {item.required && <Text style={styles.required}> *</Text>}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level</Text>
          <View style={styles.severityButtons}>
            {(['normal', 'warning', 'critical'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  severity === level && styles.severityButtonActive,
                  { borderColor: getSeverityColor(level) },
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text
                  style={[
                    styles.severityText,
                    severity === level && { color: getSeverityColor(level) },
                  ]}
                >
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.photo} />
            ))}
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleTakePhoto}>
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </Card>

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={submitting}
          variant="success"
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    default:
      return '#10b981';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  substationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistLabel: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  required: {
    color: '#ef4444',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#f8fafc',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default TaskDetailScreen;
