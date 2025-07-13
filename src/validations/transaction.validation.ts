
import Joi from 'joi';

interface ITransferRequest {
  amount: number;
  recipientAccountNumber: string;
  recipientBankCode: string;
  recipientName: string;
  narration?: string;
}

export const transferSchema = Joi.object<ITransferRequest>({
  amount: Joi.number().positive().required(),
  recipientAccountNumber: Joi.string().required(),
  recipientBankCode: Joi.string().required(),
  recipientName: Joi.string().required(),
  narration: Joi.string().optional(),
});