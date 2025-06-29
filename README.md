# GlamBook

GlamBook is a modern, full-stack salon and beauty service booking platform. It enables users to discover salons, book appointments, manage their bookings, and interact with salon professionals. The platform also provides an admin dashboard for salon owners and staff to manage services, bookings, and customer engagement.

---

## 🚀 Features

### For Customers
- **Salon Discovery:** Browse and search for salons and beauty professionals.
- **Booking System:** Book appointments for various services with real-time availability.
- **User Authentication:** Secure registration and login.
- **Profile Management:** Manage personal details and view booking history.
- **Reviews & Ratings:** Leave feedback for salons and view ratings from other users.
- **Notifications:** Receive email/SMS notifications for booking confirmations and reminders.

### For Salon Owners/Admins
- **Admin Dashboard:** Manage salon profile, services, staff, and bookings.
- **Booking Management:** View, confirm, or cancel customer bookings.
- **Service Management:** Add, edit, or remove services and set pricing.
- **Customer Management:** View customer details and booking history.
- **Analytics:** Track bookings, revenue, and customer engagement.

### General
- **Chat Support:** Real-time chat between customers and salon staff.
- **Responsive UI:** Mobile-friendly and accessible design.
- **Secure:** JWT-based authentication and secure password storage.
- **Email & SMS Integration:** For notifications and confirmations.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (Node.js/Express style)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT, NextAuth
- **UI Components:** Custom React components, Headless UI, Lucide Icons
- **Notifications:** Email (SMTP), SMS (Twilio)
- **State Management:** React Hooks, Context API
- **Other:** Modern ES6+, CSS Modules, Utility Functions

---

## 💡 Impact

Glam10 streamlines the salon booking experience for both customers and salon owners:
- Customers can easily find, book, and manage beauty appointments.
- Salons can efficiently manage their schedules, services, and customer relationships.
- Reduces no-shows and improves customer satisfaction with timely notifications and reminders.

---

## ⚙️ Implementation Overview

- **App Structure:** Modular folders for `app`, `components`, and `lib` for clear separation of concerns.
- **API:** RESTful endpoints for authentication, bookings, admin, and chat.
- **Database Models:** Mongoose models for User, Salon, Booking, and Review.
- **Authentication:** JWT and NextAuth for secure user sessions.
- **Admin Panel:** Separate routes and components for admin features.
- **UI:** Reusable components for forms, dialogs, cards, and more.
- **Notifications:** Integrated email and SMS using environment variables for credentials.
- **Environment Variables:** See `.env.example` for all required configuration.

---

## 📦 Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/glam10.git
   cd glam10
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your MongoDB, JWT, NextAuth, and notification service credentials.

4. **Run the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📄 License

MIT License

---

## 🙏 Credits

Developed by [Your Name].  
UI icons by [Lucide Icons](https://lucide.dev/).

---
