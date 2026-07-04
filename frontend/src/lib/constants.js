export const ORDER_STATUSES = {
  PENDING: { label: "Pending", color: "warning" },
  PLACED: { label: "Placed", color: "primary" },
  PROCESSING: { label: "Processing", color: "primary" },
  SHIPPED: { label: "Shipped", color: "primary" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "primary" },
  DELIVERED: { label: "Delivered", color: "success" },
  CANCELLED: { label: "Cancelled", color: "destructive" },
  RETURNED: { label: "Returned", color: "secondary" },
}

export const PAYMENT_STATUSES = {
  PENDING: { label: "Pending", color: "warning" },
  PAID: { label: "Paid", color: "success" },
  FAILED: { label: "Failed", color: "destructive" },
}

export const ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
}

export const ADDRESS_TYPES = ["HOME", "OFFICE", "OTHER"]

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]
