const API_BASE_URL = "http://localhost:4000";

export interface SwapRequest {
  amountBtc: string;
  amountEth: string;
  ethAddress: `0x${string}`;
}

export interface SwapResponse {
  lightningNetworkInvoice: `lnbc${string}`;
}

export interface SwapDetails {
  amountBtc: string;
  amountEth: string;
  ethAddress: `0x${string}`;
  btcLightningNetInvoice: `lnbc${string}`;
  txId?: string;
  status: "waiting_btc_payment" | "waiting_eth_payment" | "processing" | "completed" | "expired";
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createSwap(data: SwapRequest): Promise<SwapResponse> {
    // return {
    //   lightningNetworkInvoice: "lnbc1p5guh9mpp595cvfk0w2ukvqcv5zx42ueavdsf9upwyludagx3t8d4ewa56ukescqzyssp538lm5f087tcl3cucvkduj4ddpl6pakf6qps5wyjwsnw5hcxdvkwq9q7sqqqqqqqqqqqqqqqqqqqsqqqqqysgqdqqmqz9gxqyjw5qrzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcll7nnxyg55elr5qqqqlgqqqqqeqqjqyyagtvgpurspzvtucumgke6fhdlku02j75ataxlh2f05ze9ewrzxfadjzth99t4g56azz0uvjngpxhzeuueaqhl6m086vm29h94ak7spdq7yap",
    // };
    try {
      const response = await fetch(`${this.baseUrl}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating swap:", error);
      throw error;
    }
  }

  async getSwap(id: string): Promise<SwapDetails> {
    // return {
    //   amountBtc: "0.0001",
    //   amountEth: "0.0033037431354917452",
    //   ethAddress: "0x8538B9F22FE51bD16Fa6Eab6a840FA8bf12dd227",
    //   btcLightningNetInvoice: "lnbc100u1p5guy6ypp5eeyft8ntelam75uvpnz8lcx46qpp5aa6a4rrvc2qtc74qaz8776scqzyssp5us7lxaq6xny2e85sjfxa6dttua7v0ag32q2huzue5m67czzj5nes9q7sqqqqqqqqqqqqqqqqqqqsqqqqqysgqdqqmqz9gxqyjw5qrzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcllmqlf20lk5u3sqqqqlgqqqqqeqqjqr4dqnmedj6pz9jvh2ufw0v0grfa27khg7tfwvun8u9fcxg952ua5zed68d2naa6whng33z7qnvt8x5x07lzf6lchegvr70xsrjmk8uqpsjef9k",
    //   status: "completed",
    // };
    try {
      const response = await fetch(`${this.baseUrl}/swap/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting swap:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };
