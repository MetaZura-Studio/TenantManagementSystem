# Database Structure (TiDB / MySQL)

This is the current database structure used by the Tenant Management System (as reflected in `prisma/schema.prisma`).

## Tables

### `tenants`

- `id` (PK, int, auto-increment)
- `tenant_code` (unique)
- `slug` (unique)
- `shop_name_en`, `shop_name_ar`
- `owner_name`, `owner_email` (unique), `owner_mobile`
- `tenant_type`
- `contact_person`
- Address: `address`, `city`, `state`, `zip_code`, `country`
- Branding: `invoice_prefix`, `logo_url`
- `remarks`
- `status`
- Subscription fields: `subscription_status`, `subscription_start_date`, `subscription_end_date`, `locked_at`, `suspension_reason`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Soft delete: `deleted_at`

### `branches`

- `id` (PK)
- `tenant_id` (FK → `tenants.id`)
- `branch_code`
- `name_en`, `name_ar`
- Address: `address`, `city`, `state`, `zip_code`, `country`
- Contact: `phone`, `email`, `contact_name`
- `remarks`
- `status`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Unique: (`tenant_id`, `branch_code`)

### `users`

- `id` (PK)
- `user_code` (unique)
- `tenant_id` (FK → `tenants.id`)
- `branch_id` (FK → `branches.id`)
- `role_id` (FK → `roles.id`)
- `full_name_en`, `full_name_ar`
- `username`, `email`
- `mobile`
- `password_hash`
- Address: `address`, `city`, `state`, `zip_code`, `country`
- `status`
- `last_login_at`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Unique per tenant:
  - (`tenant_id`, `email`)
  - (`tenant_id`, `username`)

### `roles`

- `id` (PK)
- `tenant_id` (nullable; roles can be tenant-specific or global)
- `name_en`, `name_ar`
- `description`
- `status`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `permissions`

- `id` (PK)
- `module_key`, `action_key`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Unique: (`module_key`, `action_key`)

### `role_permissions`

- `id` (PK)
- `role_id` (FK → `roles.id`)
- `permission_id` (FK → `permissions.id`)
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Unique: (`role_id`, `permission_id`)

### `plans`

- `id` (PK)
- `plan_code` (unique)
- `name_en`, `name_ar`
- `description`
- `billing_cycle`
- `currency_code` (FK-like → `currencies.code`)
- Prices: `price`, `monthly_price`, `yearly_price`
- Limits: `max_branches`, `max_users`
- `features_json`
- `is_active`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `tenant_subscriptions`

- `id` (PK)
- `subscription_code` (unique)
- `tenant_id` (FK → `tenants.id`)
- `plan_id` (FK → `plans.id`)
- `status`
- Dates: `start_date`, `end_date`, `current_period_start`, `current_period_end`, `auto_lock_date`
- Billing: `billing_currency_code` (FK-like → `currencies.code`), `unit_price`
- Flags: `auto_renew`, `cancel_at_period_end`
- `canceled_at`
- Overrides: `overridden_by_admin`, `override_notes`
- `notes`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `invoices`

- `id` (PK)
- `invoice_code` (unique)
- `invoice_number` (unique)
- `tenant_id` (FK → `tenants.id`)
- `subscription_id` (FK → `tenant_subscriptions.id`)
- Period: `period_start`, `period_end`
- `issue_date`, `due_date`
- `currency_code` (FK-like → `currencies.code`)
- Amounts: `tax`, `total_amount`, `paid_amount`, `amount_due`
- `status`
- `notes`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `invoice_lines`

- `id` (PK)
- `invoice_id` (FK → `invoices.id`)
- `line_type`
- `description`
- `qty`
- `unit_price`, `line_amount`
- `sort_order`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `payments`

- `id` (PK)
- `payment_code` (unique)
- `payment_reference` (unique)
- `transaction_id` (unique, nullable)
- `tenant_id` (FK → `tenants.id`)
- `invoice_id` (nullable FK → `invoices.id`)
- `subscription_id` (nullable FK → `tenant_subscriptions.id`)
- `provider`
- `payment_method`
- `currency_code` (FK-like → `currencies.code`)
- `amount`
- `status`
- Dates: `transaction_date`, `paid_at`
- `failure_reason`
- Billing details: `billing_name`, `billing_email`, `billing_address`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `currencies`

- `code` (PK, varchar)
- `name_en`, `name_ar`
- `exchange_rate` (decimal(18,6))
- `last_updated`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `audit_logs`

- `id` (PK)
- Actor: `actor_type`, `actor_super_admin_id`, `actor_user_id`
- `tenant_id`
- `action`, `entity_type`, `entity_id`
- `old_value_json`, `new_value_json`
- `ip_address`, `user_agent`
- `created_at`

### `feature_flags`

- `id` (PK)
- `feature_name`
- `tenant_id` (nullable)
- `is_enabled`
- `notes`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`
- Unique: (`feature_name`, `tenant_id`)

### `broadcast_messages`

- `id` (PK)
- `title`, `message`
- Targeting: `target_type`, `target_plan_id`, `target_tenant_id`
- Delivery: `delivery_type`
- `status`, `sent_at`
- Audit: `created_at`, `created_by`, `updated_at`, `updated_by`

### `super_admin_users`

- `id` (PK)
- `full_name`
- `email` (unique)
- `mobile`
- `password_hash`
- `status`
- `last_login_at`

## High-level relationships

- `tenants` 1→many `branches`
- `tenants` 1→many `users`
- `tenants` 1→many `tenant_subscriptions`
- `plans` 1→many `tenant_subscriptions`
- `tenant_subscriptions` 1→many `invoices`
- `invoices` 1→many `invoice_lines`
- `invoices` 0→many `payments` (via `payments.invoice_id`)
- `roles` 1→many `users`
- `roles` many↔many `permissions` (via `role_permissions`)
- `currencies` referenced by: `plans.currency_code`, `tenant_subscriptions.billing_currency_code`, `invoices.currency_code`, `payments.currency_code`

