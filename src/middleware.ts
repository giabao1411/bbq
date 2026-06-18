import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) { request.cookies.set({ name, value, ...options }) },
        remove(name: string, options: any) { request.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  // Lấy thông tin user hiện tại từ Cookie
  const { data: { user } } = await supabase.auth.getUser()

  // Nếu truy cập vào các trang /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Kiểm tra quyền 'role' trong bảng profiles xem có phải admin không
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      // Nếu không phải admin, trả về trang chủ công cộng
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*'],
}