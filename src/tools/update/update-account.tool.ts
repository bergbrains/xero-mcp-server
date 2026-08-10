import { updateXeroAccount } from "../../handlers/update-xero-account.handler.js";
import { z } from "zod";
import { ensureError } from "../../helpers/ensure-error.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const UpdateAccountTool = CreateXeroTool(
  "update-account",
  "Updates properties of an existing Chart of Accounts entry.",
  {
    accountID: z.string().describe("The unique Xero GUID of the account to modify."),
    code: z.string().optional().describe("New or updated account code."),
    name: z.string().optional().describe("New or updated account name."),
    description: z.string().optional().describe("Updated account description."),
    taxType: z.string().optional().describe("Updated default tax code."),
    enablePaymentsToAccount: z.boolean().optional().describe("Enable or disable payments to this account."),
  },
  async ({ accountID, ...updateFields }) => {
    try {
      const response = await updateXeroAccount(accountID, updateFields);

      if (response.isError) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error updating account: ${response.error}`,
            },
          ],
        };
      }

      const account = response.result;

      return {
        content: [
          {
            type: "text" as const,
            text: `Account updated successfully: ${account.name} (${account.code})`,
          },
        ],
      };
    } catch (error) {
      const err = ensureError(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error updating account: ${err.message}`,
          },
        ],
      };
    }
  },
);

export default UpdateAccountTool;
