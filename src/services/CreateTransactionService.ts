import { getRepository, getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Response {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Response> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (
      !(await categoryRepository.findOne({
        where: { title: category },
      }))
    ) {
      const categoryTab = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryTab);
    }

    const categoryTitle = await categoryRepository.findOne({
      where: { title: category },
    });

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('value exceeded the total');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryTitle?.id,
    });

    await transactionRepository.save(transaction);

    return {
      id: transaction.id,
      title,
      value,
      type,
      category,
    };
  }
}

export default CreateTransactionService;
