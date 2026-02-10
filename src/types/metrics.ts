export type TrendDirection = 'up' | 'down' | 'stable';

export type ChangeType = 'weight' | 'muscle' | 'fat';

export interface ChangeResult {
  value: number;
  direction: TrendDirection;
}
