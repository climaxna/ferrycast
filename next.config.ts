import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 포항 탭을 울릉도 탭으로 흡수(2026.08). 포항 페이지의 노선은 전부 울릉도행이었고,
  // 강릉·묵호를 더하면서 목적지 기준 탭으로 합쳤다.
  // /pohang 주소는 QR 코드·블로그·검색엔진에 이미 퍼져 있어 반드시 살려야 한다.
  // 301(permanent)로 보내야 검색엔진이 색인을 새 주소로 옮긴다.
  async redirects() {
    return [
      { source: "/pohang", destination: "/ulleung", permanent: true },
      { source: "/pohang/:path*", destination: "/ulleung/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
