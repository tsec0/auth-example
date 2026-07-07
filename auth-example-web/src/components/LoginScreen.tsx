import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
// import { ethers } from 'ethers'; // За генериране на Web3 подписа

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

export const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Свързване към WebSocket след успешно влизане
  useEffect(() => {
    if (successMsg) {
      // Свързваме се със сървъра. Вдигаме withCredentials, за да прати cookie-то.
      const newSocket = io('http://localhost:3000', { withCredentials: true });
      
      newSocket.on('security_alert', (data) => {
        setNotifications(prev => [{ id: Math.random().toString(), message: data.message, timestamp: data.timestamp }, ...prev]);
      });

      setSocket(newSocket);
      return () => { newSocket.disconnect(); };
    }
  }, [successMsg]);

  const handleWeb3Login = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Извикване на портфейла (MetaMask/Browser wallet)
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const address = await signer.getAddress();
      // const signature = await signer.signMessage("Вход в системата");

      // Мокнати данни за теста:
      const address = "0x123...";
      const signature = "mock_signature_xyz";

      // 2. Изпращане към нашия NestJS бекенд
      const response = await fetch('http://localhost:3000/auth/web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature }),
      });

      const data = await response.json();

      // 3. Обработка на грешки от сървъра
      if (!response.ok) {
        // Хващаме 409 (Race condition), 401 (Грешен подпис) и др.
        throw new Error(data.message || 'Възникна непозната грешка при комуникацията.');
      }

      // 4. Успех (Разпознаване дали е нов или съществуващ)
      setSuccessMsg(data.isNewUser ? '🎉 Добре дошли! Акаунтът ви е създаден.' : '✅ Успешно влизане.');

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Вход в Системата</h2>

      {/* Показване на грешки */}
      {errorMsg && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          🚨 Грешка: {errorMsg}
        </div>
      )}

      {/* Бутон за вход */}
      {!successMsg ? (
        <button 
          onClick={handleWeb3Login} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Обработка...' : '🔗 Вход с Крипто Портфейл'}
        </button>
      ) : (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {successMsg}
        </div>
      )}

      {/* Панел с нотификации (показва се само при логнат потребител) */}
      {successMsg && notifications.length > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-4">
          <h3 className="text-lg text-yellow-400 mb-2">⚠️ Сигнали за сигурност</h3>
          <ul className="space-y-2">
            {notifications.map(notif => (
              <li key={notif.id} className="bg-gray-800 p-3 rounded border-l-4 border-yellow-500 text-sm">
                <span className="text-gray-400 text-xs block">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                {notif.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};