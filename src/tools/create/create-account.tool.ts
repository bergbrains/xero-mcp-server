import { createXeroAccount } from "../../handlers/create-xero-account.handler.js";
import { z } from "zod";
import { ensureError } from "../../helpers/ensure-error.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import { AccountType } from "xero-node";

const CreateAccountTool = CreateXeroTool(
  "create-account",
  "Creates a new account in the Xero Chart of Accounts.",
  {
    code: z.string().describe("Unique alphanumeric code for the account (e.g., '4000', '6100')."),
    name: z.string().describe("Full display name of the account."),
    type: z.nativeEnum(AccountType).describe("Xero Account Classification Type."),
    description: z.string().optional().describe("Optional detailed description of what should be coded here."),
    taxType: z.string().optional().describe("Default tax code (e.g., 'OUTPUT', 'INPUT', 'EXEMPT', 'NONE')."),
    enablePaymentsToAccount: z.boolean().optional().describe("Allow payments to be recorded against this account (e.g., bank/clearing accounts)."),
  },
  async (args) => {
    try {
      const response = await createXeroAccount(
        args.code,
        args.name,
        args.type,
        args.description,
        args.taxType,
        args.enablePaymentsToAccount,
      );

      if (response.isError) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating account: ${response.error}`,
            },
          ],
        };
      }

      const account = response.result;

      return {
        content: [
          {
            type: "text" as const,
            text: `Account created successfully: ${account.name} (${account.code}) with ID: ${account.accountID}`,
          },
        ],
      };
    } catch (error) {
      const err = ensureError(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating account: ${err.message}`,
          },
        ],
      };
    }
  },
);

export default CreateAccountTool;
