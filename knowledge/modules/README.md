# Module Documentation Index

This directory contains detailed documentation for each major module in the WiseCat system.

## 📦 Available Modules

### Core Modules
- [**User Management**](./user-management.md) - Authentication, profiles, session handling
- [**Payment System**](./payment-system.md) - Credits, transactions, billing
- [**Task System**](./task-system.md) - Task lifecycle, queue management, retry logic

### Service Modules
- [**Phone Numbers**](./phone-numbers.md) - Twilio integration, number purchasing
- [**AI Services**](./ai-services.md) - Vapi.ai integration, call handling
- [**Mouthpiece Service**](./mouthpiece-service.md) - AI voice proxy calls
- [**Trial Service**](./trial-service.md) - Trial call service
- [**Reservation Service**](./reservation-service.md) - Restaurant booking

### Infrastructure Modules
- [**Frontend Components**](./frontend-components.md) - Reusable UI components
- [**Internationalization**](./i18n-system.md) - Multi-language support
- [**Security & Validation**](./security-validation.md) - Auth, Turnstile, input validation
- [**Database Structure**](./database-structure.md) - Firestore collections and rules

## 📝 Module Documentation Template

Each module follows this structure:

```markdown
# [Module Name]

## Overview
Brief description of what this module does

## Key Features
- Feature 1
- Feature 2

## Data Flow
[Mermaid diagram showing data flow]

## Components
### Frontend
- File locations
- Key functions

### Backend
- Cloud Functions
- API endpoints

## Database Schema
Firestore collections used

## API Contracts
Request/response formats

## Code Examples
Common usage patterns

## Related Modules
Links to dependent modules
```

## 🔍 Finding Information

### By Feature
- **User login** → See [User Management](./user-management.md)
- **Making a call** → See [Mouthpiece Service](./mouthpiece-service.md)
- **Booking restaurant** → See [Reservation Service](./reservation-service.md)
- **Buying credits** → See [Payment System](./payment-system.md)

### By Technology
- **Firestore** → See [Database Structure](./database-structure.md)
- **Twilio** → See [Phone Numbers](./phone-numbers.md)
- **Vapi.ai** → See [AI Services](./ai-services.md)
- **i18n** → See [Internationalization](./i18n-system.md)

## 🚀 Quick Start

New to the codebase? Read in this order:
1. [User Management](./user-management.md) - Understand auth flow
2. [Frontend Components](./frontend-components.md) - Learn UI structure
3. [Task System](./task-system.md) - Understand core workflow
4. [AI Services](./ai-services.md) - Learn how calls work
