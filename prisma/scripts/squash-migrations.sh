#!/bin/bash

# Mặc định schema path
SCHEMA_PATH="prisma/schema.prisma"

# Lấy tham số --schema= nếu có truyền từ dòng lệnh
for i in "$@"
do
case $i in
    --schema=*)
    SCHEMA_PATH="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

# Lấy thư mục chứa schema.prisma rồi nối thêm /migrations
MIGRATIONS_DIR="$(dirname "$SCHEMA_PATH")/migrations"

echo "Using schema: $SCHEMA_PATH"
echo "Migrations dir: $MIGRATIONS_DIR"

# Lấy ngày giờ hiện tại theo timezone Asia/Ho_Chi_Minh (VN)
NEW_FOLDER="$(TZ='Asia/Ho_Chi_Minh' date +%d_%m_%Y_%H%M%S)_init"

# Xóa hết thư mục migration cũ (cẩn thận với lệnh này)
echo "Deleting old migrations..."
rm -rf "$MIGRATIONS_DIR"/*

# Tạo folder migration mới
mkdir -p "$MIGRATIONS_DIR/$NEW_FOLDER"

# Tạo migration.sql gộp tất cả dựa trên schema hiện tại
npx prisma migrate diff --from-empty --to-schema-datamodel="$SCHEMA_PATH" --script > "$MIGRATIONS_DIR/$NEW_FOLDER/migration.sql"

echo "Done! Old migrations removed, new migration created in $NEW_FOLDER"
