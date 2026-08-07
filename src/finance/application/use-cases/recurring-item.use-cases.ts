import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { RecurringItemRepositoryPort } from '../../domain/ports/recurring-item.repository.port';
import {
  AccountNotFoundError,
  CategoryNotFoundError,
  RecurringItemNotFoundError,
} from '../../domain/exceptions/finance.errors';
import { RecurringItemEntity } from '../../domain/entities/recurring-item.entity';
import type {
  CreateRecurringItemInput,
  DeleteRecurringItemInput,
  UpdateRecurringItemInput,
} from '../dtos/recurring-item.input';

function toResponse(item: RecurringItemEntity) {
  return {
    recurringItemId: item.id,
    userId: item.userId,
    name: item.name,
    amount: item.amount,
    kind: item.kind,
    accountId: item.accountId,
    categoryId: item.categoryId,
    dayOfMonth: item.dayOfMonth,
    mode: item.mode,
    active: item.active,
  };
}

export class CreateRecurringItemUseCase {
  constructor(
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: CreateRecurringItemInput) {
    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    const item = await this.recurringItemRepository.create({
      userId: input.userId,
      name: input.name,
      amount: input.amount,
      kind: input.kind,
      accountId: input.accountId,
      categoryId: input.categoryId,
      dayOfMonth: input.dayOfMonth,
      mode: input.mode,
    });

    return toResponse(item);
  }
}

export class UpdateRecurringItemUseCase {
  constructor(
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: UpdateRecurringItemInput) {
    const item = await this.recurringItemRepository.findByIdAndUserId(
      input.recurringItemId,
      input.userId,
    );
    if (!item) throw new RecurringItemNotFoundError(input.recurringItemId);

    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    item.updateMetadata({
      name: input.name,
      amount: input.amount,
      kind: input.kind,
      accountId: input.accountId,
      categoryId: input.categoryId,
      dayOfMonth: input.dayOfMonth,
      mode: input.mode,
      active: input.active,
    });

    const updated = await this.recurringItemRepository.update(item.id, {
      name: item.name,
      amount: item.amount,
      kind: item.kind,
      accountId: item.accountId,
      categoryId: item.categoryId,
      dayOfMonth: item.dayOfMonth,
      mode: item.mode,
      active: item.active,
    });

    return toResponse(updated);
  }
}

export class DeleteRecurringItemUseCase {
  constructor(
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
  ) {}

  async execute(input: DeleteRecurringItemInput) {
    const item = await this.recurringItemRepository.findByIdAndUserId(
      input.recurringItemId,
      input.userId,
    );
    if (!item) throw new RecurringItemNotFoundError(input.recurringItemId);

    await this.recurringItemRepository.deactivate(item.id);
    return { deleted: true };
  }
}

export class ListRecurringItemsUseCase {
  constructor(
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
  ) {}

  async execute(userId: string) {
    const items = await this.recurringItemRepository.listByUserId(userId);
    return { items: items.map(toResponse) };
  }
}

export { toResponse as mapRecurringItemToResponse };
