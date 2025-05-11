import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '数据统计可视化',
  description: '数据统计可视化工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
} 