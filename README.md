# Email Checker

Email Validator is a full-stack email verification application with unparalleled accuracy. It features a Ruby backend deployed on Fly.io using the Email library for comprehensive email validation, and a Next.js frontend deployed on Wasmer Edge for fast, global access.

## 🌐 Live Application

- **Frontend**: [https://email-checker.wasmer.app](https://email-checker.wasmer.app)

## Features

- **Bulk Email Processing**: Upload files or paste email lists for batch validation
- **Real-time Results**: Instant validation feedback with detailed analytics
- **Modern UI**: Responsive Next.js interface with Tailwind CSS styling
- **Secure Authentication**: Bearer token authentication for API access
- **Production Deployment**: Ruby backend on Fly.io, Next.js frontend on Wasmer Edge
- **CORS Support**: Cross-origin requests properly configured
- **Environment Variables**: Secure credential management

## Architecture

### Backend (Ruby + Fly.io)
- **Framework**: Rack-based Ruby application
- **Validation Library**: Email for comprehensive email verification
- **Deployment**: Fly.io with environment-based configuration
- **Authentication**: Bearer token and X-Auth-Token headers
- **CORS**: Configured for cross-origin frontend requests

### Frontend (Next.js + Wasmer Edge)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Deployment**: Wasmer Edge for global CDN distribution
- **Build**: Static export optimized for edge deployment
- **Environment**: Secure token management via environment variables

## Development Setup

### Prerequisites
- **Node.js 18+**: For frontend development
- **Ruby 3+**: For backend development
- **Fly CLI**: For backend deployment (`flyctl`)
- **Wasmer CLI**: For frontend deployment (`wasmer`)

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/samukbg/email-checker.git
   cd email-checker
   ```

2. **Backend Setup**:
   ```bash
   # Install Ruby dependencies
   bundle install
   
   # Set environment variables
   export VERIFIER_EMAIL="your-email@domain.com"
   export VERIFIER_DOMAIN="domain.com"
   export API_TOKEN="your-secure-token"
   export SMTP_SAFE_CHECK="true"
   
   # Start backend server
   rackup -p 9292
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Create environment file
   echo "NEXT_PUBLIC_API_TOKEN=your-secure-token" > .env.local
   
   # Start development server
   npm run dev
   ```

## Production Deployment

### Backend Deployment (Fly.io)
```bash
# Deploy to Fly.io
fly deploy

# Set production secrets
fly secrets set API_TOKEN="production-token"
fly secrets set TRUEMAIL_TOKEN="production-token"
fly secrets set VERIFIER_EMAIL="your-email@domain.com"
fly secrets set VERIFIER_DOMAIN="domain.com"
fly secrets set SMTP_SAFE_CHECK="true"
```

### Frontend Deployment (Wasmer Edge)
```bash
cd frontend

# Build for production
npm run build

# Deploy to Wasmer
wasmer deploy
```

## API Documentation

### Authentication
All requests require authentication via Bearer token:
```bash
# Header-based authentication
Authorization: Bearer <token>
# OR
X-Auth-Token: <token>
```

### Endpoints

#### POST /validate
Validate email addresses from uploaded file.

**Request**:
```bash
curl -X POST https://your-server.fly.dev/validate \
  -H "Authorization: Bearer <token>" \
  -F "file=@emails.txt"
```

**Response**:
```json
[
  {
    "email": "test@example.com",
    "success": true,
    "configuration": {
      "validation_type_by_domain": "smtp"
    }
  }
]
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the MIT License.

