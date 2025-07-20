# Wealth Well Organizer 💰

A modern, secure personal finance management application built with React, TypeScript, and Supabase. Track your income, expenses, budgets, and savings goals with AI-powered financial insights.

## ✨ Features

- **📊 Dashboard Overview**: Real-time financial statistics and trends
- **💳 Transaction Management**: Add, edit, and categorize income/expenses
- **📈 Budget Tracking**: Set and monitor spending limits by category
- **🎯 Savings Goals**: Track progress toward financial objectives
- **🤖 AI Insights**: Automated financial advice and recommendations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🔒 Secure Authentication**: Email/password with Supabase Auth
- **☁️ Cloud Storage**: Receipt uploads and data synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JC-delasalas/wealth-well-organizer.git
   cd wealth-well-organizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── transactions/   # Transaction management
│   ├── savings/        # Savings goal components
│   ├── insights/       # AI insights dashboard
│   └── ui/            # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── integrations/       # Third-party integrations
    └── supabase/       # Supabase client and types
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔒 Security

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Comprehensive form validation
- **HTTPS Only**: Secure data transmission

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email jcedrick.delasalas@gmail.com or create an issue on GitHub.

---

Built with ❤️ by [Millennial_TV](https://github.com/JC-delasalas)
