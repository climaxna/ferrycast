import { ferries } from "@/lib/ferry-data"

export async function GET() {
  return Response.json(ferries)
}
