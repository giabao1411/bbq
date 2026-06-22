import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Tạo một bản sao của request headers
  const requestHeaders = new Headers(request.headers);
  
  // Đính kèm URL hiện tại vào header 'x-url' để Layout trên Server có thể đọc được
  requestHeaders.set("x-url", request.nextUrl.pathname);
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )
  // await supabase.auth.getSession()
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
  // Nếu CHƯA đăng nhập mà vào đặt bàn -> đá sang /login kèm parameter ?next=/booking
  // Sửa đoạn này trong middleware.ts
  if (request.nextUrl.pathname.startsWith('/booking')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      // Đảm bảo truyền chính xác URL hiện tại vào làm tham số
      loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
  }
  if (user && request.nextUrl.pathname.startsWith("/login")) {

    const nextTarget = request.nextUrl.searchParams.get('next') || '/'
    return NextResponse.redirect(new URL(nextTarget, request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*', '/login',"/((?!api|_next/static|_next/image|favicon.ico).*)"],
}