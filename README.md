# Trademilaan - AI-Powered Market Insights Platform

![Trademilaan Logo](./public/trademilaan.png)

Trademilaan is a cutting-edge platform that empowers traders and investors with **AI-driven market insights** and personalized trading strategies. Built with Next.js 16, powered by SEBI-registered research analysis, this platform combines modern web technologies with advanced financial market intelligence.

---

## 🎯 About Trademilaan

Trademilaan is built by **Sasikumar Peyyala**, a SEBI-registered research analyst with 9+ years of experience in financial markets. The platform leverages AI and machine learning to provide:

- **Real-time market analysis** for equity, options, and commodities
- **Personalized trading strategies** tailored to individual investor profiles
- **Educational resources** on investor rights and market practices
- **Compliant grievance redressal system** and transparent practices

---

## ✨ Key Features

### For Traders & Investors
- 🤖 **AI-Powered Insights** - Machine learning-driven market predictions
- 📊 **Services Suite** - Equity Pro, Index Options Pro, MITC for commodities
- 📈 **Real-time Analytics** - Dashboard with live market data
- 🔒 **Secure Authentication** - JWT-based auth with Google OAuth integration
- 📋 **Disclaimer Management** - Compliant risk disclosure workflow

### For Users
- 👥 **Investor Charter** - Clear rights and protections
- 📞 **Grievance Redressal** - Transparent complaint handling
- 📋 **Compliance Documents** - Terms, privacy policy, refund policy
- 🌐 **Responsive Design** - Mobile-first, accessible interface

### Technical Highlights
- ⚡ **Next.js 16** - App Router with server & client components
- 🎨 **TailwindCSS 4** - Modern utility-first styling
- 🗄️ **MongoDB** - Flexible data storage
- 🔐 **JWT & OAuth** - Secure authentication system
- ✅ **Disclaimer Gating** - Compliance-first user onboarding

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **MongoDB** instance (local or cloud)
- **Google OAuth credentials** (optional, for social login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trademilaan.git
   cd trademilaan_nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
trademilaan_nextjs/
├── src/
│   └── app/
│       ├── api/                    # API routes (auth, user management)
│       │   └── auth/               # Authentication endpoints
│       │       ├── google/          # Google OAuth flow
│       │       ├── login/           # Login endpoint
│       │       ├── register/        # Registration endpoint
│       │       ├── logout/          # Logout endpoint
│       │       └── me/              # Get current user
│       ├── components/             # Reusable React components
│       │   ├── AuthForm.jsx         # Login/Register form with modern UI
│       │   ├── Navbar.jsx           # Navigation header
│       │   ├── Footer.jsx           # Footer with links
│       │   ├── Protected.jsx        # Protected route wrapper
│       │   ├── DisclaimerGate.jsx   # Compliance disclaimer flow
│       │   └── investor/            # Investor-specific components
│       │       ├── InvestorHero.jsx
│       │       ├── RightsOfInvestors.jsx
│       │       └── ...
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state management
│       ├── lib/
│       │   ├── auth.js              # Authentication helpers
│       │   ├── db.js                # MongoDB connection
│       │   ├── jwt.js               # JWT utilities
│       │   ├── middleware.js        # Custom middleware
│       │   └── models/              # Database schemas
│       │       └── User.js          # User model
│       ├── [routes]/                # Page routes
│       │   ├── page.js              # Home page
│       │   ├── login/               # Login page
│       │   ├── register/            # Registration page
│       │   ├── disclaimer/          # Disclaimer acceptance page
│       │   ├── investor-charter/    # Investor rights page
│       │   ├── services/            # Services listing
│       │   ├── contact/             # Contact form
│       │   └── ...
│       ├── globals.css              # Global styles & TailwindCSS imports
│       └── layout.js                # Root layout
├── public/                          # Static assets
│   ├── fonts/                       # DM Sans font files
│   ├── trademilaan.png              # Logo
│   ├── banner.jpg                   # Hero images
│   └── service*.jpg                 # Service showcase images
├── package.json
├── tailwind.config.js               # TailwindCSS configuration
├── next.config.js                   # Next.js configuration
└── README.md                        # This file
```

---

## 🔐 Authentication & Security

### Authentication Flow
1. **Registration** - User creates account with email/password
2. **Login** - JWT token issued and stored in secure HTTP-only cookie
3. **Google OAuth** - One-click sign-in with Google account
4. **Disclaimer Gate** - New users must accept compliance disclaimer
5. **Protected Routes** - Routes wrapped with Protected component check auth status

### Security Features
- ✅ **Bcrypt Password Hashing** - Industry-standard password encryption
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **HTTP-Only Cookies** - XSS protection
- ✅ **CSRF Protection** - Secure form submissions
- ✅ **Protected API Routes** - Authentication middleware on sensitive endpoints

---

## 🎨 Design System

### Color Palette
- **Primary Green** - `#9BE749` (Lime) - CTAs, highlights, accents
- **Neutral** - `#000000` to `#FFFFFF` - Text, backgrounds, borders
- **Accent** - Gradient overlays with lime accents
- **Destructive** - Red for logout, errors, warnings

### Typography
- **Font Family** - DM Sans (custom, optimized for trading interfaces)
- **Headings** - Bold, 3xl-5xl for hierarchy
- **Body** - Regular, 14px-16px for readability

### Components
- **Buttons** - Rounded-xl with hover states and transitions
- **Cards** - Glassy effect with border and shadow
- **Forms** - Labeled inputs with focus states
- **Navigation** - Sticky top navbar with mobile menu

---

## 📝 Available Scripts

### Development
```bash
npm run dev
```
Starts the development server on `http://localhost:3000` with hot reload.

### Production Build
```bash
npm run build
npm start
```
Creates optimized production build and serves it.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality.

---

## 📦 Dependencies

### Core
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TailwindCSS 4** - Utility-first CSS framework

### Database & Auth
- **Mongoose 9.0.2** - MongoDB object modeling
- **bcryptjs 3.0.3** - Password hashing
- **jsonwebtoken 9.0.3** - JWT token generation/verification
- **jwt-decode 4.0.0** - Token decoding on client

### UI & Animation
- **Framer Motion (motion) 12.23.26** - React animation library
- **React Icons 5.5.0** - Icon library
- **Lucide React 0.562.0** - Modern icon set

### Utilities
- **clsx 2.1.1** - Conditional classname utility
- **tailwind-merge 3.4.0** - Merge TailwindCSS classes without conflicts
- **class-variance-authority 0.7.1** - Type-safe component variants

---

## 🔄 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/google` | Google OAuth initiation |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/accept-disclaimer` | Accept compliance disclaimer |

---

## 📱 Pages

- **`/`** - Home/Landing page with hero and services overview
- **`/login`** - User login with email/password and Google OAuth
- **`/register`** - New user registration
- **`/disclaimer`** - Compliance disclaimer acceptance (gated)
- **`/services`** - Services listing (Equity Pro, Index Options, MITC, Commodities)
- **`/investor-charter`** - Investor rights and protections
- **`/disclaimer-disclosure`** - Full compliance documents
- **`/grievance-redressal`** - Complaint and grievance filing
- **`/mitc`** - Market Information Technology Center details
- **`/contact`** - Contact form and customer support
- **`/terms-and-condition`** - Terms of service
- **`/privacy-policy`** - Privacy policy
- **`/refund-policy`** - Refund and refunds policy
- **`/complaint-board`** - Public complaint tracking

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/trademilaan.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe the changes clearly
   - Reference any related issues
   - Ensure code follows the project style

---

## 📋 Compliance & Regulatory

**Important:** Trademilaan operates under SEBI (Securities and Exchange Board of India) regulations as a registered research analyst. All investment advice and market insights comply with:

- ✅ SEBI Research Analyst Regulations
- ✅ Fair Practices Code
- ✅ Disclosure Requirements
- ✅ Investor Protection Standards

Users must accept the disclaimer before accessing investment-related content.

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure `MONGODB_URI` is correct in `.env.local`
- Check MongoDB cluster network access allows your IP
- Verify MongoDB service is running (if local)

### Google OAuth Not Working
- Confirm OAuth credentials in `.env.local`
- Check redirect URI matches Google Console settings
- Clear browser cookies and try again

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000    # Windows
```

---

## 📄 License

This project is proprietary and owned by **Trademilaan**. Unauthorized copying, distribution, or use is prohibited without explicit permission.

---

## 📞 Contact & Support

- **Email** - spkumar.researchanalyst@gmail.com
- **Phone** - 077022 62206
- **Address** - 124, 2940 Kummaripalem Center, Near DSM High School, Vidyadharapuram, Vijayawada, ANDHRA PRADESH, 520012
- **Website** - [www.trademilaan.com](https://www.trademilaan.com)

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For deployment and infrastructure
- **Tailwind Labs** - For the utility-first CSS framework
- **MongoDB** - For flexible cloud database
- **All Contributors** - Making Trademilaan better every day

---

**Built with ❤️ by Sasikumar Peyyala & Team**

*Last Updated: December 30, 2025*
