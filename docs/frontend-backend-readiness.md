# Linery frontend – backend handoff readiness

## Current frontend scope

The frontend currently covers these user-facing flows:

- Home page with three book collections: `NEW & UPCOMING`, `LINERY PRESS`, `LINERY PICKS`.
- All-books and collection listing pages with category checkboxes, writer/publisher multi-select filters, sorting, pagination, and product cards.
- Search by title, author, category, and publisher.
- Product detail with gallery, classification links, quantity, cart, buy-now, reviews, and product metadata.
- Cart drawer, cart page, checkout form, payment method selection, bank-transfer instructions, and payment status screens.
- Login, registration, password recovery, author directory, author detail, news listing, and news detail.

## Frontend-only/demo parts to replace with backend data

- `products` in `src/App.tsx` is static demo data.
- Collection membership is currently represented by the three home modules but all modules use the same demo product source.
- Cart state is currently in React memory and is not persisted across a full reload.
- Login, registration, password reset, reviews, wishlist, payment confirmation, and order history are UI demos; no server authentication or transaction is performed.
- Payment providers and bank details are demo values and must come from secure server configuration.
- Product ISBN, pages, language, format, stock, descriptions, reviews, and images need real backend/media records.

## Recommended product response shape

```ts
type Product = {
  id: string
  slug: string
  title: string
  authorId: string
  publisherId: string
  collectionIds: string[]
  categoryIds: string[]
  coverImage: string
  galleryImages: string[]
  price: number
  currency: string
  stockQuantity: number
  status: 'draft' | 'active' | 'out_of_stock' | 'archived'
  publicationYear?: number
  isbn?: string
  pages?: number
  language?: string
  format?: string
  description?: string
}
```

The frontend should receive normalized IDs and display labels separately. Do not use title strings as cart keys or database identifiers.

## Recommended API areas

- `GET /api/products` with `q`, `categoryIds`, `publisherIds`, `authorIds`, `collectionId`, `sort`, `page`, and `pageSize`.
- `GET /api/products/:slug` for product detail.
- `GET /api/collections` and `GET /api/collections/:slug/products`.
- `GET /api/categories`, `GET /api/publishers`, `GET /api/authors` for filter options.
- `POST /api/cart/items`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`.
- `POST /api/orders`, `GET /api/orders/:id`, and authenticated order history endpoints.
- `POST /api/auth/login`, `/register`, `/forgot-password`, `/reset-password`.
- `POST /api/reviews` with moderation and authenticated ownership checks.
- Payment intent/redirect/webhook endpoints owned by the backend; never confirm payment from the browser alone.

## Backend rules needed by the UI

- Stock must be checked server-side when adding to cart and again when creating an order.
- Price, discount, delivery fee, and total must be recalculated server-side.
- Order creation must snapshot product title, SKU/ISBN, price, quantity, and publisher at purchase time.
- Payment status must be updated only from a trusted provider callback or verified bank-transfer reconciliation.
- Cart and order endpoints must be authenticated or tied to a signed guest-cart token.
- Product, publisher, author, category, and collection filters should use IDs, not display text.

## Frontend data contract notes

The current filter UI is data-driven: category groups stay checkbox-based, while writers and publishers use multi-select controls. Replace the demo option arrays with API responses without changing the component contract. Tailwind should be the base styling system for new backend-connected components; existing semantic hooks should remain stable during the migration.

## Acceptance checklist before production integration

- Product list, detail, collection, search, cart, checkout, auth, review, and order API contracts are versioned.
- Loading, empty, error, out-of-stock, and pagination states are mapped for every API-backed view.
- Authentication/session expiry and authorization rules are tested.
- Payment webhooks are idempotent and signature-verified.
- Product image URLs, responsive sizes, cache headers, and missing-image fallback are defined.
- Desktop, tablet, and mobile QA is repeated against real API data.
