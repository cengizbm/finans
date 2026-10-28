import {
  Banknote,
  BookOpen,
  Bus,
  Clapperboard,
  Coins,
  HeartPulse,
  Home,
  Laptop,
  Receipt,
  ShoppingBag,
  ShoppingBasket,
  TrendingUp,
  CircleDashed,
  type LucideIcon,
} from 'lucide-react'
import type { Category, TransactionType } from '../types'

interface CategoryMeta {
  color: string
  icon: LucideIcon
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  // Gelir
  Maaş: { color: '#1F6B4F', icon: Banknote },
  Freelance: { color: '#2A86A0', icon: Laptop },
  Yatırım: { color: '#7A5BB5', icon: TrendingUp },
  'Diğer Gelir': { color: '#8E8A2E', icon: Coins },
  // Gider
  Kira: { color: '#B2442B', icon: Home },
  Market: { color: '#D98A1F', icon: ShoppingBasket },
  Fatura: { color: '#2F4F9A', icon: Receipt },
  Ulaşım: { color: '#1E9A8A', icon: Bus },
  Eğlence: { color: '#C2559B', icon: Clapperboard },
  Sağlık: { color: '#6BA33C', icon: HeartPulse },
  Eğitim: { color: '#5E3FB0', icon: BookOpen },
  Alışveriş: { color: '#8A5A3C', icon: ShoppingBag },
  'Diğer Gider': { color: '#6F7780', icon: CircleDashed },
}

export const CATEGORIES_BY_TYPE: Record<TransactionType, Category[]> = {
  income: ['Maaş', 'Freelance', 'Yatırım', 'Diğer Gelir'],
  expense: [
    'Kira',
    'Market',
    'Fatura',
    'Ulaşım',
    'Eğlence',
    'Sağlık',
    'Eğitim',
    'Alışveriş',
    'Diğer Gider',
  ],
}

export const TYPE_LABEL: Record<TransactionType, string> = {
  income: 'Gelir',
  expense: 'Gider',
}

export function typeOfCategory(category: Category): TransactionType {
  return CATEGORIES_BY_TYPE.income.includes(category) ? 'income' : 'expense'
}
