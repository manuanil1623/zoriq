# ZORIQ — Shop More. Live Better.
A modern, responsive e-commerce storefront with an interactive animatic showcase, merchant management portal, and full payment gateway supporting UPI & COD.

---

## 🌟 Key Features

### 1. 🛍️ Customer Storefront & Buying Menu
- **Browse & Filter**: Filter by categories (*Electronics*, *Smart Wearables*, *Fashion*, *Home & Living*, *Accessories*), sort by Price or Rating, and search in real-time.
- **Product Details Modal**: High-res image preview, stock indicators (*In Stock*, *Low Stock: Only X left*, *Sold Out*), specifications list, and customer ratings.
- **Interactive Cart Slide-over**:
  - Quantity controls (`+` / `-`).
  - Free shipping progress bar (e.g. *"Add ₹350 more for FREE shipping"*).
  - Discount promo code engine:
    - `WELCOME10`: 10% flat discount.
    - `UPI50`: ₹50 instant payment discount.
- **My Orders & Live Tracking**:
  - 5-step milestone tracking timeline (*Placed* ➔ *Confirmed* ➔ *Shipped* ➔ *Out for Delivery* ➔ *Delivered*).
  - Printable / downloadable GST Tax Invoice for every completed order.

---

### 2. 💳 Payment Gateway (UPI & COD)
- **Instant UPI Payment**:
  - **Dynamic UPI QR Code**: Uses standard `upi://pay` URI parameters (`pa`, `pn`, `am`, `cu`, `tn`) generated on-the-fly. Buyers can scan directly from their mobile camera or UPI apps (*Google Pay, PhonePe, Paytm, BHIM*).
  - **One-Click UPI App Simulator**: Simulate payment flows for Google Pay, PhonePe, Paytm, or BHIM.
  - **Manual UPI ID / VPA Entry**: Enter any custom VPA (e.g., `user@oksbi`) with automated verification.
  - **5:00-minute Countdown Timer**: Live session counter for payment security.
  - **Automatic UTR / Transaction ID**: Generates realistic UPI reference numbers (`UPI/2026/894...`).
- **Cash on Delivery (COD)**:
  - Anti-bot / phone verification security code (4-digit captcha).
  - ₹0 advance payment notice with delivery agent scanner option.

---

### 3. 🏪 Seller / Owner Admin Portal
- **Dashboard Overview**:
  - Real-time gross revenue metrics and order counts.
  - **UPI vs. COD Revenue Split** analytics.
  - Catalog inventory valuation and low-stock alerts.
- **Product Management & Editor**:
  - **Add New Products**: Set title, category, selling price, MSRP price, stock count, SKU, description, bullet point features, and badge (*Best Seller, Trending, etc.*).
  - **Image Selector**: Choose from preset high-res Unsplash product photos or provide a custom image URL.
  - **Stock Status Toggle**: Instant 1-click active / out-of-stock switcher.
  - **Edit & Delete**: Full edit control over any existing product.
- **Orders Dispatch Manager**:
  - Filter by status (*Placed, Confirmed, Shipped, Delivered, Cancelled*) or payment type (*UPI vs COD*).
  - View buyer details, delivery address, phone, and ordered line items.
  - Advance orders from *Placed* ➔ *Confirmed* ➔ *Shipped* ➔ *Delivered*.
- **Store & UPI Settings**:
  - Configure the merchant UPI ID (VPA, e.g. `nexmart.store@oksbi`).
  - Configure Store & Merchant Display Name.
  - Toggle Cash on Delivery on/off and set COD fees.
  - Configure Free Shipping threshold and standard shipping fees.
  - Factory Reset button to restore demo catalog data at any time.

---

## 🚀 How to Run Locally

```bash
# 1. Navigate to the project directory
cd "C:\Users\manua\.gemini\antigravity\scratch\nexmart-store"

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the development server
npm run dev
```

Open your browser at **[http://localhost:5173/](http://localhost:5173/)**.

---

## 🔄 Quick Role Switcher & Owner Access
- **Top Header Bar**: Use the top banner "Owner Access" button to open the PIN authentication modal to manage products, orders, and store settings.
- **Customer View**: Experience the buyer journey, add products to cart, and checkout with UPI or COD.
- **Seller View**: Review incoming orders, track revenue, restock inventory, and add/edit products with the Product Editor.
