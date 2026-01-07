// Crossmark wallet type definitions

interface CrossmarkSession {
  address?: string;
  account?: string;
  publicKey?: string;
  network?: string;
}

interface CrossmarkTransactionResponse {
  response?: {
    data?: {
      resp?: {
        result?: {
          hash?: string;
          tx_json?: {
            hash?: string;
          };
          meta?: {
            TransactionResult?: string;
          };
          engine_result?: string;
        };
        hash?: string;
        meta?: {
          TransactionResult?: string;
        };
      };
      hash?: string;
      tx_json?: {
        hash?: string;
      };
      meta?: {
        TransactionResult?: string;
      };
      engine_result?: string;
      error?: {
        message?: string;
      } | string;
    };
    error?: {
      message?: string;
    } | string;
    hash?: string;
    meta?: {
      TransactionResult?: string;
    };
    engine_result?: string;
  };
  hash?: string;
  id?: string;
  uuid?: string;
  tx_json?: {
    hash?: string;
  };
  result?: {
    hash?: string;
    tx_json?: {
      hash?: string;
    };
    meta?: {
      TransactionResult?: string;
    };
    engine_result?: string;
  };
  meta?: {
    TransactionResult?: string;
  };
  engine_result?: string;
  error?: {
    message?: string;
  } | string;
}

interface CrossmarkMethods {
  signAndSubmit?: (transaction: any) => Promise<CrossmarkTransactionResponse>;
  sign?: (transaction: any) => Promise<any>;
  signTransaction?: (transaction: any) => Promise<any>;
  [key: string]: any;
}

interface CrossmarkAPI {
  connect?: () => Promise<any>;
  signAndSubmit?: (transaction: any) => Promise<CrossmarkTransactionResponse>;
  signTransaction?: (transaction: any) => Promise<any>;
  sign?: (transaction: any) => Promise<any>;
  session?: CrossmarkSession;
  methods?: CrossmarkMethods;
  async?: CrossmarkMethods;
  api?: {
    v1?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

// Extend the Window interface to include crossmark
declare global {
  interface Window {
    crossmark?: CrossmarkAPI;
  }
}

export {};
