[![fr](https://img.shields.io/badge/language-fr-blue.svg)](https://github.com/anbahmani/ft_transcendance/blob/main/README.fr.md)

## Table of Contents
1. [Overview](#📷-overviewoverview)
2. [Technologies](#🚀-technologies-used)
3. [Security](#🛡️-security)
4. [User Account Management](#👤-user-account-management)
5. [Chat](#⚙️-chat-functionality)
6. [Gameplay](#🎮-gameplay)

## 📷 Overview
This project is a comprehensive platform dedicated to the iconic game of Pong, enabling users to compete in real-time. The site features a sleek user interface, an in-built chat system, and a host of features for an immersive online multiplayer experience.


## 🚀 Technologies Used

- Backend: Crafted with NestJS, ensuring a robust architecture and efficient handling of various requests. API communication is via the GraphQL protocol, and database communication is via the Prisma ORM.
- Frontend: Developed using React, providing a dynamic and responsive UI.
- Database: Exclusive use of PostgreSQL for reliable, high-performance data management.
- Deployment: Seamless integration with Docker, enabling quick, reliable project launch.

## 🛡️ Security
Special emphasis is given to security aspects:

- Secure hashing of passwords prior to storage.
- Enhanced protection against SQL injections.
- Rigorous server-side validation for all forms and user inputs.
- Secure management of API keys and sensitive data, preventing any public exposure.

## 👤 User Account Management
Users log in via the 42 intranet OAuth system, with extensive profile features:

- Selection of a unique name and avatar upload.
- Enablement of two-factor authentication.
- Capability to add friends and view their real-time status (online, offline and in game).
- Detailed profiles displaying game stats, match history, and more.

## ⚙️ Chat Functionality
The site includes an integrated chat allowing:

- Creation of public, private, or password-secured channels.
- Direct message sending.
- Blocking of unwanted users.
- Advanced rights management for channel owners and administrators.
- Direct game invitations via chat.

## 🎮 Gameplay
At the heart of the site is Pong gameplay, featuring:

- Real-time matches against other players.
- A fair matchmaking system.
- Network issue management for a flawless user experience.

## 🧑‍💻 Launch app

```
  git clone git@github.com:anbahmani/ft_transcendance.git
  cd ft_transcendance ; make ;
```

Go to URL ```localhost:3000```

This project represents a complex fusion of modern web technologies, real-time interactive features, and meticulous attention to security and performance details, delivering a nostalgic yet innovative gaming platform.