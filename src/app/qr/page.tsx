import type { Metadata } from "next"
import QrClient from "./QrClient"

export const metadata: Metadata = {
  title: "FerryCast QR 코드",
  description: "FerryCast 앱 QR 코드",
}

export default function QrPage() {
  return <QrClient />
}
