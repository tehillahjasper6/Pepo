#!/bin/bash

echo "🐝 PEPO Setup Script"
echo "===================="

# Create .env file in root
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pepo?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_FROM=noreply@pepo.app
EMAIL_API_KEY=your-email-api-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
ADMIN_URL=http://localhost:3001

# Node
NODE_ENV=development
PORT=4000
EOF

# Create .env for backend
cp .env backend/.env

# Create .env.local for web
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3000
EOF

# Create .env.local for admin
cat > apps/admin/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000/api
EOF

echo "✅ Environment files created!"
echo ""
echo "🚀 Next steps:"
echo "1. Start Docker: docker-compose up -d"
echo "2. Generate Prisma: npm run db:generate"
echo "3. Run migrations: npm run db:migrate"
echo "4. Seed database: npm run db:seed"
echo "5. Start backend: npm run backend:dev"
echo ""
echo "🎉 Setup complete!"



