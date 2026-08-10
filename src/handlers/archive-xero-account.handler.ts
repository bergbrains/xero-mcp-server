import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Account, Accounts } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function archiveAccount(accountID: string): Promise<Account | undefined> {
  await xeroClient.authenticate();

  const archivePayload: Accounts = {
    accounts: [
      {
        status: Account.StatusEnum.ARCHIVED,
      },
    ],
  };

  const response = await xeroClient.accountingApi.updateAccount(
    xeroClient.tenantId,
    accountID,
    archivePayload,
    undefined, // idempotencyKey
    getClientHeaders(),
  );

  return response.body.accounts?.[0];
}

/**
 * Archive an existing account in Xero
 */
export async function archiveXeroAccount(
  accountID: string,
): Promise<XeroClientResponse<Account>> {
  try {
    const archivedAccount = await archiveAccount(accountID);

    if (!archivedAccount) {
      throw new Error("Account archival failed.");
    }

    return {
      result: archivedAccount,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
