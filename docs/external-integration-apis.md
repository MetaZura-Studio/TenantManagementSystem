# External Integration APIs

## Error format

```json
{
  "error": { "code": "UNAUTHORIZED", "message": "Not authenticated" }
}
```

`error.code`: `BAD_REQUEST | UNAUTHORIZED | FORBIDDEN | NOT_FOUND`

## Token auth (recommended for external apps)

Send this header on every request after login:

```http
Authorization: Bearer <accessToken>
```

## External endpoints

### 1) Login (external)

`POST /api/external/auth/login`

Body:

```json
{ "email": "cutter@tenant.com", "password": "..." }
```

Success:

```json
{
  "accessToken": "eyJ...",
  "expiresIn": 28800,
  "user": { "id": "123", "name": "Cutter Name", "email": "cutter@tenant.com" }
}
```

### 2) Context (tenant + subscription + limits + role)

`GET /api/external/context`

Success:

```json
{
  "user": {
    "id": "123",
    "email": "cutter@tenant.com",
    "name": "Cutter Name",
    "status": "ACTIVE",
    "tenantId": "7",
    "branchId": "12",
    "roleId": "3",
    "roleName": "Cutter"
  },
  "tenant": {
    "id": "7",
    "tenantCode": "TEN-0007",
    "shopNameEn": "Dishdasha Store",
    "subscriptionStatus": "ACTIVE",
    "lockedAt": null
  },
  "subscription": {
    "id": "55",
    "status": "ACTIVE",
    "planId": "2",
    "planName": "Ultra Pro",
    "currentPeriodStart": "2026-03-01",
    "currentPeriodEnd": "2027-03-01"
  },
  "limits": { "maxBranches": 5, "maxUsers": 20 }
}
```

### 3) Logout (external)

`POST /api/external/auth/logout`

Success:

```json
{ "ok": true }
```

### 4) Authorization check (optional)

`POST /api/external/authorize`

Body:

```json
{ "permission": "INVOICES.CREATE" }
```

Success:

```json
{ "allowed": true }
```

