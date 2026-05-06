# FFord Medical Logging Middleware

A reusable logging middleware package designed for FFord Medical applications with comprehensive logging capabilities and Express.js integration.

## Features

- **Reusable logging function** with structured parameters
- **Express middleware integration** for automatic request/response logging
- **Multiple log levels** (error, warn, info, debug)
- **Medical-specific logging scenarios**
- **Test condition validation logging**
- **Winston-based** with multiple transport options
- **TypeScript support** with full type definitions

## Installation

```bash
npm install @fford-medical/logging-middleware
```

## Basic Usage

### Simple Logging Function

```typescript
import log from '@fford-medical/logging-middleware';
import { LogLevel } from '@fford-medical/logging-middleware';

// Basic logging
log('backend', LogLevel.INFO, 'user-service', 'User created successfully', true);

// Error logging
log('backend', LogLevel.ERROR, 'database-handler', 'Connection failed', false);

// With metadata
log('backend', LogLevel.DEBUG, 'auth-middleware', 'Token validated', true, {
  userId: '12345',
  tokenExpiry: '2024-01-01T00:00:00Z'
});
```

### Function Parameters

The `log` function accepts the following parameters:

- **service** (string): Service name (e.g., "backend", "frontend", "api")
- **level** (LogLevel): Log level (ERROR, WARN, INFO, DEBUG)
- **handler** (string): Handler/function name where logging occurs
- **message** (string): Log message or received string
- **expected** (boolean, optional): Expected boolean value or condition
- **metadata** (object, optional): Additional metadata

## Express Integration

### Middleware Setup

```typescript
import express from 'express';
import { loggingMiddleware, errorLoggingMiddleware } from '@fford-medical/logging-middleware';

const app = express();

// Add logging middleware
app.use(loggingMiddleware);
app.use(errorLoggingMiddleware);

// Your routes here
app.get('/api/patients', (req, res) => {
  // Manual logging if needed
  log('backend', LogLevel.INFO, 'patient-controller', 'Fetching patients', true);
  res.json({ patients: [] });
});
```

### Custom Logger Instance

```typescript
import { FFordLogger, LogLevel } from '@fford-medical/logging-middleware';

const medicalLogger = new FFordLogger('patient-service');

medicalLogger.log(
  'backend',
  LogLevel.INFO,
  'patient-create',
  'Patient record created',
  true,
  { patientId: 'PAT-001', age: 45 }
);
```

## Medical-Specific Examples

### Prescription Logging

```typescript
log('backend', LogLevel.INFO, 'prescription-service', 'Prescription issued', true, {
  prescriptionId: 'RX-001',
  patientId: 'PAT-001',
  medication: 'Amoxicillin',
  dosage: '500mg',
  prescribedBy: 'Dr. Smith'
});
```

### Lab Results Logging

```typescript
log('backend', LogLevel.INFO, 'lab-service', 'Lab results processed', true, {
  testId: 'LAB-001',
  patientId: 'PAT-001',
  testType: 'Blood Count',
  result: 'Normal'
});
```

### Critical Alerts

```typescript
log('backend', LogLevel.ERROR, 'alert-service', 'Critical condition detected', false, {
  patientId: 'PAT-001',
  condition: 'Hypertension Crisis',
  bloodPressure: '180/120',
  timestamp: new Date().toISOString()
});
```

## Test Condition Logging

```typescript
// Pre-test setup
log('backend', LogLevel.INFO, 'test-setup', 'Pre-test environment setup initiated', true);

// Test condition validation
const testCondition = true;
log('backend', LogLevel.DEBUG, 'test-validator', 'Test condition validation', testCondition, {
  condition: 'Database connection available',
  expected: true,
  actual: testCondition
});

// Test result
log('backend', LogLevel.INFO, 'test-runner', 'Test execution completed', testCondition, {
  testName: 'Database Connection Test',
  passed: testCondition,
  executionTime: '150ms'
});
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set minimum log level (default: 'info')

### Log Files

The middleware creates log files in the `logs/` directory:
- `error.log`: Error-level logs only
- `combined.log`: All logs

### Custom Configuration

```typescript
import { FFordLogger } from '@fford-medical/logging-middleware';

const customLogger = new FFordLogger('my-service');
```

## Log Output Format

Each log entry includes:

```json
{
  "service": "backend",
  "level": "info",
  "handler": "user-service",
  "message": "User created successfully",
  "expected": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "metadata": {
    "userId": "12345"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## License

MIT License - FFord Medical Team
