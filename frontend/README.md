# NFC E-Commerce Frontend

A complete Next.js 14 frontend application for an NFC e-commerce website with admin dashboard, payment integration, and comprehensive product management.

## 🚀 Features

### Customer Features
- **Home Page**: Hero banner, category cards, featured products
- **Product Listing**: Advanced filters (type, model, price), search, pagination, sorting
- **Product Details**: Image gallery, specifications table, add to cart
- **Shopping Cart**: View items, update quantities, remove items, total calculation
- **Checkout**: Shipping details form, coupon application, Razorpay payment integration
- **Order Management**: View orders, order status tracking, invoice download
- **Authentication**: JWT-based login/signup with protected routes

### Admin Features
- **Dashboard**: Overview statistics, quick actions
- **Products CRUD**: Create, read, update, delete products
- **Orders Management**: View all orders, update order status
- **Users Management**: View all users and their details
- **Coupons Management**: Create and manage discount coupons
- **Low Stock Alerts**: Monitor products with low inventory
- **Analytics**: Revenue charts, orders per month, low stock visualization using Recharts

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: React Context API (AuthContext, CartContext)
- **Payment**: Razorpay Checkout.js
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── login/             # Login page
│   ├── orders/            # User orders page
│   ├── order-success/     # Order success page
│   ├── products/          # Product listing and details
│   ├── signup/            # Signup page
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── api/                   # API utilities
│   └── axios.js           # Axios instance with interceptors
├── components/            # Reusable components
│   ├── Header.js
│   ├── Footer.js
│   └── ProductCard.js
├── context/               # React Context providers
│   ├── AuthContext.js
│   └── CartContext.js
├── hooks/                 # Custom React hooks
│   └── useProtectedRoute.js
└── utils/                 # Utility functions
    └── formatPrice.js
```

## 🔐 Authentication

The app uses JWT-based authentication:
- Tokens are stored in `localStorage`
- Axios interceptors automatically add tokens to requests
- Protected routes redirect to login if not authenticated
- Admin routes require `role: 'admin'` in user object

## 💳 Payment Integration

Razorpay integration is implemented in the checkout page:
1. Order is created on the backend
2. Razorpay checkout is initialized with order details
3. Payment is processed through Razorpay
4. Payment verification is done on the backend
5. User is redirected to order success page

## 🎨 Styling

The app uses TailwindCSS with a custom color scheme:
- Primary color: Blue (#0ea5e9)
- Responsive design with mobile-first approach
- Modern UI with shadows, rounded corners, and hover effects

## 📡 API Endpoints Expected

The frontend expects the following backend API endpoints:

### Auth
- `POST /api/auth/login`
- `POST /api/auth/signup`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders/:id/invoice`
- `POST /api/orders/verify-payment`

### Coupons
- `POST /api/coupons/validate`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `GET /api/admin/users`
- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `DELETE /api/admin/coupons/:id`
- `GET /api/admin/analytics`

## 🚦 Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## 📝 Notes

- Make sure your backend API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`
- Razorpay key ID is required for payment functionality
- All API calls include JWT token in Authorization header automatically
- Cart is persisted in localStorage
- Admin routes are protected both client-side and server-side

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

