import type { RecurringItemRepositoryPort } from '../../domain/ports/recurring-item.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { TransactionEntity } from '../../domain/entities/transaction.entity';
import { RecurringItemEntity } from '../../domain/entities/recurring-item.entity';
import type {
  DetectRecurringCandidatesInput,
  RecurringCandidate,
} from '../dtos/recurring-item.input';

const LOOKBACK_MONTHS = 6;
const AMOUNT_TOLERANCE_RATIO = 0.15;
const MAX_DAY_SPREAD = 5;

export class DetectRecurringCandidatesUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
  ) {}

  async execute(
    input: DetectRecurringCandidatesInput,
  ): Promise<{ candidates: RecurringCandidate[] }> {
    const fromDate = new Date();
    fromDate.setUTCMonth(fromDate.getUTCMonth() - LOOKBACK_MONTHS);

    const [transactions, existingItems] = await Promise.all([
      this.transactionRepository.list({ userId: input.userId, fromDate }),
      this.recurringItemRepository.listByUserId(input.userId),
    ]);

    const groups = new Map<string, TransactionEntity[]>();
    for (const tx of transactions) {
      const key = `${tx.accountId}|${tx.categoryId}|${tx.kind}`;
      const group = groups.get(key);
      if (group) group.push(tx);
      else groups.set(key, [tx]);
    }

    const candidates: RecurringCandidate[] = [];
    for (const group of groups.values()) {
      for (const cluster of this.clusterByAmount(group)) {
        const candidate = this.toCandidate(cluster);
        if (candidate && !this.matchesExistingItem(candidate, existingItems)) {
          candidates.push(candidate);
        }
      }
    }

    candidates.sort(
      (a, b) =>
        b.occurrences - a.occurrences ||
        b.lastOccurredAt.localeCompare(a.lastOccurredAt),
    );
    return { candidates };
  }

  private clusterByAmount(
    transactions: TransactionEntity[],
  ): TransactionEntity[][] {
    const sorted = [...transactions].sort((a, b) => a.amount - b.amount);
    const clusters: TransactionEntity[][] = [];
    for (const tx of sorted) {
      const current = clusters.at(-1);
      const anchor = current?.[0];
      if (current && anchor && this.withinTolerance(tx.amount, anchor.amount)) {
        current.push(tx);
      } else {
        clusters.push([tx]);
      }
    }
    return clusters;
  }

  private withinTolerance(amount: number, anchor: number): boolean {
    return Math.abs(amount - anchor) <= anchor * AMOUNT_TOLERANCE_RATIO;
  }

  private toCandidate(cluster: TransactionEntity[]): RecurringCandidate | null {
    // Two occurrences is the minimum signal that can be called "recurring" —
    // a single charge is indistinguishable from a one-off expense.
    if (cluster.length < 2) return null;

    const days = cluster.map((tx) => tx.occurredAt.getUTCDate());
    if (Math.max(...days) - Math.min(...days) > MAX_DAY_SPREAD) return null;

    const latest = [...cluster].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    )[0];

    return {
      accountId: latest.accountId,
      categoryId: latest.categoryId,
      amount: latest.amount,
      kind: latest.kind,
      dayOfMonth: Math.min(28, Math.round(this.median(days))),
      occurrences: cluster.length,
      suggestedName: this.mostCommonDescription(cluster) ?? '',
      lastOccurredAt: latest.occurredAt.toISOString(),
    };
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private mostCommonDescription(cluster: TransactionEntity[]): string | null {
    const counts = new Map<string, number>();
    for (const tx of cluster) {
      const description = tx.description?.trim();
      if (!description) continue;
      counts.set(description, (counts.get(description) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const [description, count] of counts) {
      if (count > bestCount) {
        best = description;
        bestCount = count;
      }
    }
    return best;
  }

  private matchesExistingItem(
    candidate: RecurringCandidate,
    existingItems: RecurringItemEntity[],
  ): boolean {
    return existingItems.some(
      (item) =>
        item.accountId === candidate.accountId &&
        item.categoryId === candidate.categoryId &&
        item.kind === candidate.kind &&
        this.withinTolerance(candidate.amount, item.amount) &&
        Math.abs(item.dayOfMonth - candidate.dayOfMonth) <= MAX_DAY_SPREAD,
    );
  }
}
