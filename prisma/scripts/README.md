# Prisma Migration Squash Script

## Mục đích

Script này giúp bạn **gom tất cả các migration cũ của Prisma** thành **1 migration duy nhất** nằm trong thư mục mới có tên theo ngày giờ hiện tại tại Việt Nam.

---

## Cách sử dụng

1. Đặt script `squash-migrations.sh` trong thư mục phù hợp (ví dụ: `scripts/` hoặc `apps/sso-service/prisma/scripts/`).

2. Cấp quyền thực thi cho script:

```bash
chmod +x scripts/squash-migrations.sh
