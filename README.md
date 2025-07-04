# Dishtalgia E-commerce

An e-commerce platform for Dishtalgia, built with Next.js, TypeScript, and MongoDB.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Environment Setup

1. Copy the example environment file and update with your values:
   `ash
   cp .env.example .env.local
   `

2. Update the environment variables in .env.local with your configuration:
   `env
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Authentication
   NEXTAUTH_SECRET=your-32-character-long-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Database
   MONGODB_URI=your-mongodb-connection-string
   MONGODB_DB=dishtalgia
   
   # Payment (optional)
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
   `

### Installation

1. Install dependencies:
   `ash
   npm install
   # or
   yarn
   `

2. Run the development server:
   `ash
   npm run dev
   # or
   yarn dev
   `

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

All required environment variables are validated on application startup. If any required variables are missing, the application will fail to start with a descriptive error message.

## Available Scripts

- dev - Start the development server
- uild - Build the application for production
- start - Start the production server
- lint - Run ESLint
- 	ype-check - Run TypeScript type checking

## Project Structure

- src/app - Next.js app directory with pages and API routes
- src/components - Reusable React components
- src/lib - Shared utilities and configurations
- src/models - TypeScript interfaces and type definitions
- src/styles - Global styles and theme configuration

## Deployment

The application is configured for deployment on Vercel. For other platforms, refer to the Next.js deployment documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# dishtalgiav25
