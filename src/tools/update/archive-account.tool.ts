import { archiveXeroAccount } from "../../handlers/archive-xero-account.handler.js";
import { z } from "zod";
import { ensureError } from "../../helpers/ensure-error.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ArchiveAccountTool = CreateXeroTool(
  "archive-account",
  "Archives (soft-deletes) an existing account in Xero.",
  {
    accountID: z.string().describe("The unique Xero GUID of the account to archive."),
  },
  async ({ accountID }) => {
    try {
      const response = await archiveXeroAccount(accountID);

      if (response.isError) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error archiving account: ${response.error}`,
            },
          ],
        };
      }

      const account = response.result;

      return {
        content: [
          {
            type: "text" as const,
            text: `Account archived successfully: ${account.name} (${account.code})`,
          },
        ],
      };
    } catch (error) {
      const err = ensureError(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error archiving account: ${err.message}`,
          },
        ],
      };
    }
  },
);

export default ArchiveAccountTool;
