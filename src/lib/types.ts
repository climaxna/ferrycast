export type FerryStatus = "on-time" | "delayed" | "boarding" | "departed" | "cancelled"

export type Ferry = {
  id: string
  name: string
  route: {
    from: string
    to: string
  }
  departure: string
  arrival: string
  status: FerryStatus
  capacity: number
  boarded: number
  platform: string
}
