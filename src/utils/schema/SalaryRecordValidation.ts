import Joi from "joi";

export class SalaryRecordValidation {
  public static createSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Name is required",
      "any.required": "Name field is mandatory",
    }),
    grossEarnings: Joi.number().positive().precision(2).required().messages({
      "number.base": "Gross earnings must be a valid number",
      "number.positive": "Gross earnings must be greater than 0",
    }),
    commissionRate: Joi.number().min(0).max(100).required().messages({
      "number.min": "Commission rate cannot be less than 0%",
      "number.max": "Commission rate cannot exceed 100%",
    }),
    recmats: Joi.string().trim().allow("", null).optional(),
    isClaimed: Joi.boolean().default(false).optional(),
    payoutPeriodId: Joi.string().uuid().required().messages({
      "string.uuid": "Invalid payout period ID format",
    }),
  });

  public static updateSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    grossEarnings: Joi.number().positive().precision(2).optional(),
    commissionRate: Joi.number().min(0).max(100).optional(),
    recmats: Joi.string().trim().allow("", null).optional(),
    isClaimed: Joi.boolean().optional(),
  });

  public static validateCreate(data: any) {
    return this.createSchema.validate(data, { abortEarly: false });
  }

  public static validateUpdate(data: any) {
    return this.updateSchema.validate(data, { abortEarly: false });
  }
}
