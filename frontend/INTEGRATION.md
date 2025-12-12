# Backend Integration Guide

This document outlines how the Next.js frontend integrates with your Express + Prisma backend.

## API Configuration

The frontend uses an axios instance configured in `api/axios.js`:
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api`)
- Automatically attaches JWT token from `localStorage` in Authorization header
- Handles 401 errors by redirecting to login
- Shows toast notifications for errors

## Authentication Flow

1. **Login/Signup**: 
   - POST `/api/auth/login` or `/api/auth/signup`
   - Backend returns `{ token, user }`
   - Token stored in `localStorage`
   - User data stored in `localStorage` and AuthContext

2. **Token Expiration**:
   - Axios interceptor catches 401 responses
   - Clears token and user data
   - Redirects to `/login`

3. **Protected Routes**:
   - `/checkout` - Requires authentication (handled by layout)
   - `/orders` - Requires authentication (handled by layout)
   - `/admin/*` - Requires `user.role === 'admin'` (handled by admin layout)

## Cart Integration

The cart syncs with the backend when a user is logged in:

- **GET `/api/cart`** - Fetch user's cart
- **PUT `/api/cart`** - Update cart items
- **DELETE `/api/cart`** - Clear cart

For guest users, cart is stored in `localStorage` only.

Cart items structure:
```javascript
{
  product: productId, // or full product object
  quantity: number,
  price: number,
  name: string,
  image: string
}
```

## Product APIs

### List Products
- **GET `/api/products`**
  - Query params: `page`, `limit`, `search`, `category`, `type`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`
  - Response: `{ products: [], total: number, totalPages: number }`

### Get Product Details
- **GET `/api/products/:id`**
  - Response: Product object with full details

## Checkout Flow (Razorpay)

1. **Create Razorpay Order**:
   - POST `/api/orders/create-razorpay-order`
   - Body: `{ shippingAddress: {...}, couponCode?: string }`
   - Response: `{ orderId, razorpayOrderId, amount }`

2. **Open Razorpay Checkout**:
   - Frontend initializes Razorpay with `razorpayOrderId` and `amount`
   - User completes payment

3. **Verify Payment**:
   - POST `/api/orders/verify-payment`
   - Body: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`
   - Backend verifies signature and creates order

4. **Success Redirect**:
   - Redirects to `/checkout/success?orderId={orderId}`

## Orders

### Get User Orders
- **GET `/api/orders`**
  - Returns array of user's orders

### Get Order Details
- **GET `/api/orders/:id`**
  - Returns order with items and shipping address

### Download Invoice
- **GET `/api/orders/:id/invoice`**
  - Returns PDF blob
  - Frontend triggers download

## Coupons

### Validate Coupon
- **POST `/api/coupons/validate`**
  - Body: `{ code: string, amount: number }`
  - Response: `{ valid: boolean, discount: number, message?: string }`

## Admin APIs

### Dashboard Stats
- **GET `/api/admin/stats`**
  - Response: `{ totalRevenue, totalOrders, totalUsers, totalProducts, lowStockProducts, pendingOrders }`

### Products Management
- **GET `/api/admin/products`** - List all products (query: `?lowStock=true`)
- **POST `/api/admin/products`** - Create product
- **PUT `/api/admin/products/:id`** - Update product
- **DELETE `/api/admin/products/:id`** - Delete product

### Orders Management
- **GET `/api/admin/orders`** - List all orders (query: `?status=pending`)
- **PATCH `/api/admin/orders/:id`** - Update order status
  - Body: `{ status: 'pending' | 'shipped' | 'delivered' | 'cancelled' }`

### Users Management
- **GET `/api/admin/users`** - List all users

### Coupons Management
- **GET `/api/admin/coupons`** - List all coupons
- **POST `/api/admin/coupons`** - Create coupon
- **DELETE `/api/admin/coupons/:id`** - Delete coupon

### Analytics
- **GET `/api/admin/analytics`**
  - Response: `{ revenueData: [{month, revenue}], ordersData: [{month, orders}], lowStockProducts: [{name, stock}] }`

## Response Format Handling

The frontend handles multiple response formats:
- `res.data.products` or `res.data.data` or `res.data` for arrays
- `res.data.product` or `res.data` for single objects
- Flexible field names (e.g., `totalRevenue` or `revenue`)

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Error Handling

- Network errors show toast notification
- 401 errors redirect to login
- 403 errors show permission denied message
- 404 errors show "not found" message
- 500+ errors show server error message
- All errors are logged to console for debugging

## Loading States

All pages show loading states while fetching data:
- Skeleton loaders or "Loading..." messages
- Disabled buttons during async operations
- Loading indicators in cart context

