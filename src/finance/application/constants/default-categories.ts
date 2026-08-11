import { CategoryKind } from '../../domain/entities/category.entity';

export type DefaultCategory = {
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
};

/** Seeded once per user, the first time their category list is empty. */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Comida',
    kind: CategoryKind.EXPENSE,
    icon: 'utensils',
    color: '#f97316',
  },
  {
    name: 'Transporte',
    kind: CategoryKind.EXPENSE,
    icon: 'car',
    color: '#3b82f6',
  },
  {
    name: 'Vivienda',
    kind: CategoryKind.EXPENSE,
    icon: 'home',
    color: '#a855f7',
  },
  {
    name: 'Salud',
    kind: CategoryKind.EXPENSE,
    icon: 'heart_pulse',
    color: '#ef4444',
  },
  {
    name: 'Entretenimiento',
    kind: CategoryKind.EXPENSE,
    icon: 'film',
    color: '#ec4899',
  },
  {
    name: 'Compras',
    kind: CategoryKind.EXPENSE,
    icon: 'shopping_bag',
    color: '#eab308',
  },
  {
    name: 'Servicios',
    kind: CategoryKind.EXPENSE,
    icon: 'receipt',
    color: '#06b6d4',
  },
  {
    name: 'Educación',
    kind: CategoryKind.EXPENSE,
    icon: 'book_open',
    color: '#6366f1',
  },
  {
    name: 'Sueldo',
    kind: CategoryKind.INCOME,
    icon: 'payments',
    color: '#22c55e',
  },
  {
    name: 'Otros ingresos',
    kind: CategoryKind.INCOME,
    icon: 'trending_up',
    color: '#14b8a6',
  },
  {
    name: 'Deudas',
    kind: CategoryKind.EXPENSE,
    icon: 'landmark',
    color: '#7c2d12',
  },
];
