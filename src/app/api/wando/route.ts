import { wandoFerries } from "@/lib/ferry-data"

export async function GET() {
  return Response.json(wandoFerries)
}
