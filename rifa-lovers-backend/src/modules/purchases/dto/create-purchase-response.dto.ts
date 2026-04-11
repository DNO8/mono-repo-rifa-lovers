export class CreatePurchaseResponseDto {
  id: string
  raffleId: string
  raffleName: string
  totalAmount: number
  status: string
  createdAt: string

  // Datos para Flow
  flowOrderId?: string
  paymentUrl?: string

  // Resumen
  packName: string
  quantity: number
  unitPrice: number
}
