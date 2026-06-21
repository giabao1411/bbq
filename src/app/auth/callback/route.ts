import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Sau khi đăng nhập xong, hướng người dùng về trang đặt bàn
  const next = searchParams.get('next') || '/'

  if (code) {
    // SỬA TẠI ĐÂY: Thêm await trước cookies() vì cookies() bây giờ là một Promise
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set({ name, value, ...options })
              )
            } catch (error) {
              // Có thể bỏ qua lỗi này nếu chạy trong Server Component/Route handler
            }
          }
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next,origin))
    }
  }

  // Nếu lỗi, trả về trang login kèm thông báo
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}