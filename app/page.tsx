import { auth } from '@/auth'       // <-- Từ file auth.ts bạn đã tạo
import { redirect } from 'next/navigation'

const HomePage = async () => {
  const session = await auth()

  // ❌ Nếu chưa đăng nhập → redirect sang /sign-in
  if (!session) {
    return redirect('/sign-in')
  }

  // ✅ Nếu đã login → hiển thị nội dung
  return <div>Latest Products</div>
}

export default HomePage
