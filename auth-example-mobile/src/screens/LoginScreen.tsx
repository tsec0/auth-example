import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import io, { Socket } from 'socket.io-client';

interface Notification {
  id: string;
  message: string;
}

export const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (successMsg) {
      // Изисква специфична конфигурация за cookie-та в React Native, 
      // ако не се пращат автоматично, се добавят в extraHeaders
      const newSocket = io('http://YOUR_SERVER_IP:3000', { 
        transports: ['websocket'],
      });
      
      newSocket.on('security_alert', (data) => {
        setNotifications(prev => [{ id: Math.random().toString(), message: data.message }, ...prev]);
      });

      setSocket(newSocket);
      return () => { newSocket.disconnect(); };
    }
  }, [successMsg]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Тук интегрираш @walletconnect/react-native или подобна библиотека
      const address = "0xMobile..."; 
      const signature = "mobile_signature";

      const response = await fetch('http://YOUR_SERVER_IP:3000/auth/web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Сървърна грешка.');
      }

      setSuccessMsg(data.isNewUser ? 'Акаунтът е създаден!' : 'Успешно влизане!');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в системата</Text>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>🚨 {errorMsg}</Text>
        </View>
      )}

      {successMsg && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {!successMsg && (
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Вход с Портфейл</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Списък с нотификации в реално време */}
      {notifications.length > 0 && (
        <View style={styles.notificationArea}>
          <Text style={styles.notificationTitle}>⚠️ Сигнали за сигурност:</Text>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <Text style={styles.notificationText}>{item.message}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorBox: { backgroundColor: '#ef4444', padding: 10, borderRadius: 5, marginBottom: 15 },
  errorText: { color: '#fff' },
  successBox: { backgroundColor: '#22c55e', padding: 10, borderRadius: 5, marginBottom: 15 },
  successText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  notificationArea: { marginTop: 30, borderTopWidth: 1, borderColor: '#333', paddingTop: 20 },
  notificationTitle: { color: '#fbbf24', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  notificationItem: { backgroundColor: '#1f2937', padding: 10, borderLeftWidth: 4, borderLeftColor: '#fbbf24', marginBottom: 10 },
  notificationText: { color: '#d1d5db' }
});