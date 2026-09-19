# How to Sync Policies into Shopify Admin (Settings → Policies)

Shopify checkout links (found in the checkout footer, e.g. `/policies/privacy-policy`, `/policies/terms-of-service`, `/policies/refund-policy`, `/policies/shipping-policy`) pull directly from Shopify's native database settings, rather than from theme Liquid templates.

Follow these quick steps to populate them in under 2 minutes:

---

### Step 1: Open Shopify Admin Policy Settings
1. Log in to your **Shopify Admin** (`admin.shopify.com` or `cx007b-b1.myshopify.com/admin`).
2. In the bottom-left corner, click **Settings** (gear icon ⚙️).
3. In the left navigation menu, click **Policies**.

---

### Step 2: Copy & Paste Each Policy
For each of the 4 policy boxes on that screen:

1. **Privacy Policy**:
   - Open [privacy-policy.html](privacy-policy.html).
   - In Shopify Admin under "Privacy policy", click the **`< >` (Show HTML)** button in the rich-text editor toolbar.
   - Paste the contents of `privacy-policy.html`.
   - Click **`< >`** again to toggle back to visual preview.

2. **Terms of Service**:
   - Open [terms-of-service.html](terms-of-service.html).
   - Under "Terms of service", click **`< >` (Show HTML)**.
   - Paste the contents of `terms-of-service.html`.

3. **Refund Policy**:
   - Open [refund-policy.html](refund-policy.html).
   - Under "Refund policy", click **`< >` (Show HTML)**.
   - Paste the contents of `refund-policy.html`.

4. **Shipping Policy**:
   - Open [shipping-policy.html](shipping-policy.html).
   - Under "Shipping policy", click **`< >` (Show HTML)**.
   - Paste the contents of `shipping-policy.html`.

---

### Step 3: Save
- Click **Save** in the top-right corner of the Shopify Admin screen.
- Your Shopify checkout footer links (`/policies/privacy-policy`, etc.) will now be live and matching your storefront policies!

---

### Replacing Business Placeholders
When you have your official business details, simply do a quick Find & Replace for:
- `[INSERT ACTUAL LEGAL BUSINESS NAME]` → Your registered legal entity name (e.g., *Digvolly Design Studio LLC*).
- `[INSERT ACTUAL PHYSICAL BUSINESS ADDRESS]` → Your registered physical or postal business address.
- `[INSERT COUNTRY/STATE OF INCORPORATION]` → Your legal state/country (e.g., *State of Delaware, United States*).
- `[INSERT GOVERNING STATE/COUNTRY, e.g., the State of Delaware, United States]` → Your governing law jurisdiction.
- `[INSERT COURT JURISDICTION, e.g., New Castle County, Delaware, United States]` → Your court venue.
