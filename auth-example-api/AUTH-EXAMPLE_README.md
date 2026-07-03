# 🔐 Auth-Example: Hybrid Web2 & Web3 Authentication System

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Това хранилище съдържа цялостна, "production-ready" система за автентикация, която обединява традиционния Web2 вход (OAuth) с модерната Web3 идентичност (SIWE - Sign-In with Ethereum). 

Системата е изградена като **Monorepo**, съдържащо бекенд сървър, уеб клиент и мобилно приложение, всички оркестрирани чрез Docker.

## ✨ Ключови функционалности

* **Хибриден вход:** Поддръжка на крипто портфейли (MetaMask, WalletConnect) чрез криптографски подписи.
* **Защита от Race Conditions:** Вграден Redis Mutex механизъм за атомарно създаване на акаунти.
* **Управление на сесии:** Генериране на сигурни, `HttpOnly` кукита, обвързани с хардуерния отпечатък (Device Fingerprint) на потребителя.
* **Real-time Сигурност:** WebSocket интеграция (Socket.io) за мигновено известяване при неоторизиран достъп от ново устройство.
* **Контейнеризация:** Напълно изолирана мрежова среда зад Nginx Reverse Proxy.

---

## 🏗️ Архитектура

Потокът на автентикация и управлението на сесиите е визуализиран по-долу:

```mermaid
sequenceDiagram
    autonumber
    actor User as Клиент
    participant Proxy as Nginx (Reverse Proxy)
    participant Nest as NestJS (API)
    participant Redis as Redis (Мютекс & Сесии)
    participant DB as PostgreSQL 18
    participant WS as Socket.io

    User->>Proxy: POST /auth/web3 (signature)
    Proxy->>Nest: Пренасочване към вътрешната мрежа
    Nest->>Redis: Lock (Защита от двойни заявки)
    Nest->>Nest: Валидация на подписа
    Nest->>DB: findOrCreate(wallet_address)
    Nest->>Redis: Създаване на сесия с IP/User-Agent
    Nest->>WS: Emit 'security_alert' към други сесии
    Nest-->>User: Set-Cookie: auth_session (HttpOnly)

## 📜 Авторско право и Лиценз

**Всички права запазени (All Rights Reserved)**

© 2026 [Tsvetomir Dikov]. All Rights Reserved.

/auth-example
 ├── /auth-example-api      # NestJS бекенд (Port 3000 вътрешно)
 ├── /auth-example-web      # React + Vite уеб клиент (Nginx Port 80)
 ├── /auth-example-mobile   # React Native (Expo) мобилно приложение
 └── docker-compose.yml     # Docker оркестрация