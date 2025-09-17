export const RANGE_POOL_QUERIES_ABI = [
  {
    inputs: [
      {
        internalType: "contract IVault",
        name: "vault",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "factBalances",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amountsOut",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "bptTotalSupply",
        type: "uint256",
      },
    ],
    name: "calcBptInGivenExactTokensOut",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "factBalances",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amountsIn",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "bptTotalSupply",
        type: "uint256",
      },
    ],
    name: "calcBptOutGivenExactTokensIn",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "virtualBalanceIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "virtualBalanceOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "calcInGivenOut",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "virtualBalanceIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "virtualBalanceOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "factBalance",
        type: "uint256",
      },
    ],
    name: "calcOutGivenIn",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "factBalances",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "calcRatioMin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "assetIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetOut",
        type: "address",
      },
    ],
    name: "getAmountIn",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "assetIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetOut",
        type: "address",
      },
    ],
    name: "getAmountOut",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "assetIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetOut",
        type: "address",
      },
    ],
    name: "getSwapInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountInAfterFees",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "virtualBalanceIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "virtualBalanceOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "swapFeePercentage",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
