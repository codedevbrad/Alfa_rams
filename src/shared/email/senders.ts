export interface EmailSenderDto {
  id: number
  name: string
  email: string
}

export interface UpsertEmailSenderInput {
  id?: number
  name: string
  email: string
}
