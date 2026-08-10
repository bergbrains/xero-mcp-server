import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Account, Accounts } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function updateAccount(
  accountID: string,
  updateFields: Partial<Account>,
): Promise<Account | undefined> {
  await xeroClient.authenticate();

  const accountsPayload: Accounts = {
    accounts: [
      {
        ...updateFields,
      },
    ],
  };

  const response = await xeroClient.accountingApi.updateAccount(
    xeroClient.tenantId,
    accountID,
    accountsPayload,
    undefined, // idempotencyKey
    getClientHeaders(),
  );

  return response.body.accounts?.[0];
}

/**
 * Update an existing account in Xero
 */
export async function updateXeroAccount(
  accountID: string,
  updateFields: Partial<Account>,
): Promise<XeroClientResponse<Account>> {
  try {
    const updatedAccount = await updateAccount(accountID, updateFields);

    if (!updatedAccount) {
      throw new Error("Account update failed.");
    }

    return {
      result: updatedAccount,
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
