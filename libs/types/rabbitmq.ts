export interface IRequestMessage {
    account: string;
    task: Task;
}

export const Command = {
    Balance: "balance",
    Transactions: "transactions",
    Unspents: "unspents",
    All: "all"
};

interface IUnspent {
    Transaction: string;
    VoutIdx: number;
    ScriptPubKey: string;
    Amount: number;
    BlockTime: number;
}

export interface IResponseMessageAll {
    command: Task;
    account: string;
    data: {
        balance: number;
        transactions: string[];
        unspents: IUnspent[];
    };
}

export type Task =
    | typeof Command.Balance
    | typeof Command.Transactions
    | typeof Command.Unspents;
