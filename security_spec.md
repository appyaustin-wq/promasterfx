# Security Specification & "Dirty Dozen" Hardening Plan

## 1. Data Invariants
- **User Roles**: The `role` property in user documents must only be modified by existing admins or upon first-time creation if the authenticated user email is exactly `admin@promasterfx.com`.
- **Identity Integrity**: All documents that represent user actions (watchlists, orders, positions, activities, depositRequests, withdrawalRequests, loanRequests, supportThreads, notifications) must have their `userId` or corresponding owner fields strictly match `request.auth.uid`. No user can create or modify documents belonging to another user.
- **Audit Trails**: `auditLogs` are immutable; they can only be created by verified admins and cannot be updated or deleted.
- **Support Communication**: Normal users can only write to `/supportThreads/{userId}` where `userId` matches their own UID. Admins can write to any support thread to reply.

---

## 2. The "Dirty Dozen" Threat Payloads

### Payload 1: Privilege Escalation (Self-promoting User)
- **Target Collection**: `/users/attacker_uid`
- **Attempt**: Register/update with `role: "admin"` as a normal user.
- **Result**: `PERMISSION_DENIED`

### Payload 2: Hostile Account Hijack (Impersonation)
- **Target Collection**: `/users/victim_uid`
- **Attempt**: Update victim user's email or password/metadata.
- **Result**: `PERMISSION_DENIED`

### Payload 3: Shadow Balance Injection (Free Money)
- **Target Collection**: `/users/attacker_uid`
- **Attempt**: User attempts to update their own `demoBalance` directly on the client.
- **Result**: `PERMISSION_DENIED`

### Payload 4: Orphaned Trade Generation (Decoupled User Order)
- **Target Collection**: `/orders/random_order_id`
- **Attempt**: Attacker creates an order for another user (`userId: "victim_uid"`).
- **Result**: `PERMISSION_DENIED`

### Payload 5: Trade Counterparty Impersonation (Position Tampering)
- **Target Collection**: `/positions/position_id`
- **Attempt**: Attacker updates or closes someone else's trading position.
- **Result**: `PERMISSION_DENIED`

### Payload 6: Audit Log Erasure/Manipulation
- **Target Collection**: `/auditLogs/log_id`
- **Attempt**: Update or delete an audit log document.
- **Result**: `PERMISSION_DENIED`

### Payload 7: Platform Sabotage (Platform Settings Override)
- **Target Collection**: `/platformSettings/config`
- **Attempt**: Normal user attempts to toggle `maintenanceMode` or alter `defaultDemoBalance`.
- **Result**: `PERMISSION_DENIED`

### Payload 8: Fake Payment Verification (Deposit Injector)
- **Target Collection**: `/depositRequests/dep_fake`
- **Attempt**: User attempts to self-approve a deposit request (`status: "approved"`).
- **Result**: `PERMISSION_DENIED`

### Payload 9: Unauthorized Funds Extraction (Withdrawal Injector)
- **Target Collection**: `/withdrawalRequests/with_fake`
- **Attempt**: User attempts to approve/process their own withdrawal request.
- **Result**: `PERMISSION_DENIED`

### Payload 10: Infinite Credit Application (Loan Self-Approver)
- **Target Collection**: `/loanRequests/loan_fake`
- **Attempt**: User attempts to set loan status to `Approved`.
- **Result**: `PERMISSION_DENIED`

### Payload 11: Support Eavesdropping (Spying on other Helpdesk chats)
- **Target Collection**: `/supportThreads/victim_uid`
- **Attempt**: User attempts to read support threads of another trader.
- **Result**: `PERMISSION_DENIED`

### Payload 12: Notification Hijack (Altering system signals)
- **Target Collection**: `/notifications/notif_fake`
- **Attempt**: User tries to create or modify an approved deposit/loan notification to credit themselves.
- **Result**: `PERMISSION_DENIED`
