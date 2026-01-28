import { z } from "zod";

export const buy_model_schema = z.object({
  license: z.enum(["PERSONAL_USE", "COMMERCIAL_USE"]),
});
