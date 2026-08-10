import { describe, it, expect, vi, beforeEach } from "vitest";
import { createXeroAccount } from "../src/handlers/create-xero-account.handler.js";
import { updateXeroAccount } from "../src/handlers/update-xero-account.handler.js";
import { archiveXeroAccount } from "../src/handlers/archive-xero-account.handler.js";
import { xeroClient } from "../src/clients/xero-client.js";
import { AccountType, Account } from "xero-node";

// Mock xero-node and xeroClient
vi.mock("../src/clients/xero-client.js", () => ({
  xeroClient: {
    authenticate: vi.fn().mockResolvedValue(undefined),
    tenantId: "test-tenant-id",
    accountingApi: {
      createAccount: vi.fn(),
      updateAccount: vi.fn(),
    },
  },
}));

describe("Accounts Write Tools Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createXeroAccount", () => {
    it("successfully creates an account", async () => {
      const mockAccount: Account = {
        accountID: "new-account-id",
        name: "Test Account",
        code: "4000",
        type: AccountType.REVENUE,
      };

      (xeroClient.accountingApi.createAccount as any).mockResolvedValue({
        body: { accounts: [mockAccount] },
      });

      const result = await createXeroAccount(
        "4000",
        "Test Account",
        AccountType.REVENUE,
      );

      expect(xeroClient.authenticate).toHaveBeenCalled();
      expect(xeroClient.accountingApi.createAccount).toHaveBeenCalledWith(
        "test-tenant-id",
        expect.objectContaining({
          code: "4000",
          name: "Test Account",
          type: AccountType.REVENUE,
        }),
        undefined,
        expect.anything()
      );
      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccount);
    });

    it("handles errors during creation", async () => {
      (xeroClient.accountingApi.createAccount as any).mockRejectedValue(new Error("API Error"));

      const result = await createXeroAccount(
        "4000",
        "Test Account",
        AccountType.REVENUE,
      );

      expect(result.isError).toBe(true);
      expect(result.error).toBe("API Error");
    });
  });

  describe("updateXeroAccount", () => {
    it("successfully updates an account", async () => {
      const mockAccount: Account = {
        accountID: "existing-id",
        name: "Updated Name",
        code: "4000",
      };

      (xeroClient.accountingApi.updateAccount as any).mockResolvedValue({
        body: { accounts: [mockAccount] },
      });

      const result = await updateXeroAccount("existing-id", { name: "Updated Name" });

      expect(xeroClient.authenticate).toHaveBeenCalled();
      expect(xeroClient.accountingApi.updateAccount).toHaveBeenCalledWith(
        "test-tenant-id",
        "existing-id",
        { accounts: [{ name: "Updated Name" }] },
        undefined,
        expect.anything()
      );
      expect(result.isError).toBe(false);
      expect(result.result).toEqual(mockAccount);
    });
  });

  describe("archiveXeroAccount", () => {
    it("successfully archives an account", async () => {
      const mockAccount: Account = {
        accountID: "existing-id",
        name: "Test Account",
        code: "4000",
        status: Account.StatusEnum.ARCHIVED,
      };

      (xeroClient.accountingApi.updateAccount as any).mockResolvedValue({
        body: { accounts: [mockAccount] },
      });

      const result = await archiveXeroAccount("existing-id");

      expect(xeroClient.authenticate).toHaveBeenCalled();
      expect(xeroClient.accountingApi.updateAccount).toHaveBeenCalledWith(
        "test-tenant-id",
        "existing-id",
        { accounts: [{ status: Account.StatusEnum.ARCHIVED }] },
        undefined,
        expect.anything()
      );
      expect(result.isError).toBe(false);
      expect(result.result?.status).toBe(Account.StatusEnum.ARCHIVED);
    });
  });
});
