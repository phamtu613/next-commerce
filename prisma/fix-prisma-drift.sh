set -e

echo "🔧 Bắt đầu fix Prisma drift..."
echo ""

# Bước 0: Xóa migration history trong database
echo "🗑️  Xóa migration history trong database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$executeRawUnsafe('DELETE FROM \"_prisma_migrations\";')
  .then(() => console.log('✅ Đã xóa migration history'))
  .catch(err => console.log('⚠️  Lỗi hoặc bảng không tồn tại:', err.message))
  .finally(() => prisma.\$disconnect());
"
echo ""

# Bước 1: Backup migrations cũ (nếu có)
if [ -d "prisma/migrations" ]; then
    echo "📦 Backup migrations cũ..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    mv prisma/migrations "prisma/migrations_backup_$timestamp"
    echo "✅ Đã backup vào: prisma/migrations_backup_$timestamp"
else
    echo "ℹ️  Không có migrations cũ để backup"
fi
echo ""

# Bước 2: Pull schema từ database
echo "📥 Pull schema từ database..."
npx prisma db pull
echo "✅ Schema đã được cập nhật"
echo ""

# Bước 3: Generate Prisma Client
echo "⚙️  Generate Prisma Client..."
npx prisma generate
echo "✅ Prisma Client đã được generate"
echo ""

# Bước 4: Tạo folder migration mới
echo "📁 Tạo migration baseline..."
mkdir -p prisma/migrations/0_init
echo ""

# Bước 5: Tạo migration SQL
echo "📝 Tạo migration SQL từ schema hiện tại..."
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

if [ -s prisma/migrations/0_init/migration.sql ]; then
    echo "✅ Migration SQL đã được tạo"
else
    echo "⚠️  Warning: Migration SQL trống"
fi
echo ""

# Bước 6: Đánh dấu migration đã apply
echo "✓ Đánh dấu migration đã được apply..."
npx prisma migrate resolve --applied 0_init
echo "✅ Migration đã được đánh dấu"
echo ""

# Bước 7: Verify status
echo "🔍 Kiểm tra status..."
npx prisma migrate status
echo ""

echo "🎉 Hoàn thành! Database đã sync với schema."
echo ""
echo "📌 Từ giờ có thể dùng: npx prisma migrate dev --name <tên_migration>"
echo ""
echo "💡 Nếu cần restore migrations cũ, check folder: prisma/migrations_backup_*"