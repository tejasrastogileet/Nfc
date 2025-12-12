# NFC E-commerce Backend

A complete Node.js + Express backend for an NFC e-commerce website with PostgreSQL, Prisma ORM, JWT authentication, Razorpay payments, PDF invoices, and email notifications.

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **PDFKit** - Invoice generation
- **Nodemailer** - Email notifications

## 📋 Features

### Authentication
- User signup and login
- JWT token-based authentication
- Role-based access control (Admin & User)

### Products
- CRUD operations for products
- Filter by category, price range, and model
- Product categories: NFC Card & NFC Tag
- Stock management

### Cart
- Add items to cart
- Update quantities
- Remove items
- Auto-calculate totals

### Orders
- Create orders from cart
- Razorpay payment integration
- Payment verification
- Order status tracking
- Automatic stock deduction

### Coupons
- Create and manage discount coupons
- Percentage and fixed amount discounts
- Usage limits and validity periods
- Coupon validation

### Invoices
- Generate PDF invoices for orders
- Download invoices

### Admin Dashboard
- Total sales and revenue analytics
- Order management
- User management
- Low stock alerts
- Product management
- Coupon management

### Email System
- Low stock alerts
- Order confirmation emails

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Razorpay account (for payments)
- Email account (for notifications)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/nfc_ecommerce?schema=public"

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com

   # Server
   PORT=3000
   NODE_ENV=development

   # App
   APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed database with admin user and sample products
   npm run seed
   ```
   
   **Default Admin Credentials:**
   - Email: `admin@nfcstore.com`
   - Password: `admin123`
   - ⚠️ **Change the password after first login!**

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── couponController.js
│   ├── invoiceController.js
│   ├── orderController.js
│   └── productController.js
├── middleware/           # Express middleware
│   └── auth.js
├── routes/              # API routes
│   ├── admin.js
│   ├── auth.js
│   ├── cart.js
│   ├── coupons.js
│   ├── invoice.js
│   ├── orders.js
│   └── products.js
├── utils/               # Utility functions
│   ├── email.js
│   ├── invoice.js
│   ├── jwt.js
│   └── razorpay.js
├── prisma/              # Prisma schema
│   └── schema.prisma
├── invoices/            # Generated invoices (created automatically)
├── server.js            # Express server
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with filters: category, minPrice, maxPrice, model)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/item/:itemId` - Update cart item quantity (protected)
- `DELETE /api/cart/item/:itemId` - Remove item from cart (protected)

### Orders
- `POST /api/orders/create` - Create order from cart (protected)
- `POST /api/orders/verify-payment` - Verify Razorpay payment (protected)
- `GET /api/orders/my` - Get user's orders (protected)

### Coupons
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons` - Create coupon (admin only)
- `GET /api/coupons` - Get all coupons (admin only)
- `PUT /api/coupons/:id` - Update coupon (admin only)
- `DELETE /api/coupons/:id` - Delete coupon (admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `PATCH /api/admin/orders/:id` - Update order status (admin only)
- `GET /api/admin/low-stock` - Get low stock products (admin only)
- `POST /api/admin/low-stock/alerts` - Send low stock alerts (admin only)
- `GET /api/admin/users` - Get all users (admin only)

### Invoices
- `POST /api/invoice/generate/:orderId` - Generate invoice for order (protected)
- `GET /api/invoice/download/:fileName` - Download invoice (protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 📝 Example Requests

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Create Product (Admin)
```bash
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "NFC Card Pro",
  "description": "High-quality NFC card",
  "price": 299.99,
  "stock": 100,
  "category": "NFC_CARD",
  "model": "NFC-PRO-001",
  "specs": {
    "frequency": "13.56 MHz",
    "memory": "1KB"
  },
  "images": ["https://example.com/image1.jpg"]
}
```

### Create Order
```bash
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "couponCode": "SAVE10" // optional
}
```

## 🗄️ Database Models

- **User** - User accounts with roles
- **Product** - Product catalog
- **Cart** - Shopping cart
- **CartItem** - Cart items
- **Order** - Orders
- **OrderItem** - Order items
- **Coupon** - Discount coupons

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 📧 Email Configuration

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## 💳 Razorpay Setup

1. Create a Razorpay account
2. Get your Key ID and Key Secret from the dashboard
3. Add them to your `.env` file

## 🚨 Error Handling

All errors are returned in a consistent format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## 📄 License

ISC

## 👨‍💻 Development

The server runs on `http://localhost:3000` by default. Use `npm run dev` for development with auto-reload.

