# 🎓 Campus Connect – College Society Management System

Campus Connect is a web-based platform developed to streamline and digitize the functioning of college societies. The system allows student organizers and society members to manage events, announcements, registrations, and internal communication with ease. It is designed to improve engagement, transparency, and efficiency in society management.

## 🚀 Features

- 🏛️ **Society Dashboard**: Individual dashboards for each registered society with member roles and privileges.
- 📅 **Event Management**: Create, update, and delete events with detailed information and registration options.
- 📢 **Announcements**: Publish and notify members about important updates and news.
- 🧾 **User Registration & Authentication**: Firebase-based secure login for students and admins.
- 👥 **Role-based Access**: Admins, society heads, and members have different access levels.
- 📂 **Document Repository**: Upload and manage files related to events or society work.
- 🔎 **Search & Filter**: Users can browse societies and events based on interest, date, or category.


## 🧰 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend & Authentication**: Firebase (Firestore, Firebase Auth)
- **Hosting**: Firebase Hosting or Vercel (optional)
- **Database**: Cloud Firestore – NoSQL

- ## 🧑‍💻 How to Run Locally

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/campus-connect.git
cd campus-connect
```

2. Install Dependencies
 ```bash
npm install
```

4. Configure Firebase

Create a Firebase project at firebase.google.com

Enable Firestore and Authentication (Email/Password or Google)

Replace your Firebase config in src/services/firebase.js

4. Start the Development Server
```bash
npm start
```


🧪 Future Enhancements
Email notifications and reminders

Real-time chat among society members

Event feedback and rating system

Admin panel for college authority

