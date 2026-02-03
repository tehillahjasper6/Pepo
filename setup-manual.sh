#!/bin/bash

echo "🐝 PEPO Manual Setup (Without Docker)"
echo "====================================="
echo ""

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found"
    
    # Create database
    echo "📝 Creating database..."
    createdb pepo 2>/dev/null || echo "Database 'pepo' might already exist"
    
else
    echo "❌ PostgreSQL not found!"
    echo ""
    echo "Install PostgreSQL:"
    echo "  macOS: brew install postgresql@16"
    echo "  Ubuntu: sudo apt install postgresql"
    echo ""
    echo "Then run: brew services start postgresql@16  (macOS)"
    echo "      or: sudo systemctl start postgresql    (Ubuntu)"
    exit 1
fi

# Check if Redis is installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis found"
    
    # Start Redis if not running
    if ! pgrep -x "redis-server" > /dev/null; then
        echo "🚀 Starting Redis..."
        redis-server --daemonize yes
    else
        echo "✅ Redis already running"
    fi
else
    echo "❌ Redis not found!"
    echo ""
    echo "Install Redis:"
    echo "  macOS: brew install redis"
    echo "  Ubuntu: sudo apt install redis"
    echo ""
    echo "Then run: brew services start redis  (macOS)"
    echo "      or: sudo systemctl start redis (Ubuntu)"
    exit 1
fi

echo ""
echo "✅ Infrastructure ready!"
echo ""

# Create .env files
echo "📝 Creating .env files..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://$(whoami)@localhost:5432/pepo?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_FROM=noreply@pepo.app
EMAIL_API_KEY=your-email-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
ADMIN_URL=http://localhost:3001
NODE_ENV=development
PORT=4000
EOF

# Expand $USER in DATABASE_URL
USER=$(whoami)
sed -i '' "s/\$(whoami)/$USER/g" .env 2>/dev/null || sed -i "s/\$(whoami)/$USER/g" .env

cp .env backend/.env

cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3000
EOF

cat > apps/admin/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000/api
EOF

echo "✅ Environment files created!"
echo ""
echo "🚀 Next steps:"
echo "1. Generate Prisma: npm run db:generate"
echo "2. Run migrations: npm run db:migrate"
echo "3. Seed database: npm run db:seed"
echo "4. Start backend: npm run backend:dev"
echo ""
echo "🎉 Setup complete!"




