import { themeColor6, themeColor7, themeColor10, themeColor11 } from '../theme/Color';
import { toAmount } from './Common';

// Transaction types from /technician/transactions.
export const TRANSACTION_TYPE = {
  DEPOSIT: 1,
  WITHDRAWAL: 2,
  FINE: 3,
};

// Withdrawals and fines reduce the wallet even if the API sends a positive price.
export const isDebitTransaction = (item) => {
  const type = Number(item?.type);
  return (
    type === TRANSACTION_TYPE.WITHDRAWAL ||
    type === TRANSACTION_TYPE.FINE ||
    (toAmount(item?.price) ?? 0) < 0
  );
};

export const transactionVisual = (item) => {
  switch (Number(item?.type)) {
    case TRANSACTION_TYPE.DEPOSIT:
      return { icon: 'arrow-down', color: themeColor7.bgColor(1), tint: themeColor7.bgColor(0.15) };
    case TRANSACTION_TYPE.WITHDRAWAL:
      return { icon: 'arrow-up', color: themeColor6.bgColor(1), tint: themeColor6.bgColor(0.12) };
    case TRANSACTION_TYPE.FINE:
      return { icon: 'warning', color: themeColor11.bgColor(1), tint: themeColor11.bgColor(0.15) };
    default:
      return { icon: 'swap-vertical', color: themeColor10.bgColor(0.5), tint: themeColor10.bgColor(0.08) };
  }
};
