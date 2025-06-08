export interface IUser {
  _id: string
  name: string
  email: string
  phone: string
  password?: string
  identityNumber?: string
  isAvailable?: boolean
  preferredLang?: string
  region?: string
  timeFormat: '12' | '24'
  image?: string
  role: 'customer' | 'admin' | 'worker' | 'manager' | 'supervisor'
  createdAt: string
  updatedAt: string
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface IRegisterData {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  preferredLang?: string
  region?: string
  timeFormat?: '12' | '24'
}

export interface IAuthResponse {
  user: IUser
  token: string
}

export interface IUserUpdateData {
  name?: string
  email?: string
  phone?: string
  address?: string
  password?: string
  preferredLang?: string
  region?: string
  timeFormat?: '12' | '24'
} 