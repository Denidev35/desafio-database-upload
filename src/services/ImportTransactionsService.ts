import path from 'path';
import csv from 'csvtojson';
import fs from 'fs';

import uploadConfig from '../config/uplaod';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionFilename: string;
}

interface Transaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ transactionFilename }: Request): Promise<Transaction[]> {
    const createTransactions = new CreateTransactionService();

    const transactionFilePath = path.join(
      uploadConfig.directory,
      transactionFilename,
    );

    const transactions: Transaction[] = await csv().fromFile(
      transactionFilePath,
    );

    for (const transaction of transactions) {
      const { title, value, type, category } = transaction;

      await createTransactions.execute({
        title,
        value,
        type,
        category,
      });
    }

    await fs.promises.unlink(transactionFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
