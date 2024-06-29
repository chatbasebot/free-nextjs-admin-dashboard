class TransferData {
    bump: number = 0;

    lamports: number = 0;


    constructor(fields: {
        bump: number;

        lamports: number;


    } | undefined = undefined) {
        if (fields) {
            this.bump = fields.bump;

            this.lamports = fields.lamports;

        }
    }
}

const TransferDataSchema = new Map([
    [
        TransferData,
        {
            kind: "struct",
            fields: [

                ["bump", "u8"],
                ["lamports", "u64"],

            ],
        },
    ],
])


class InitPDA {

    bump: number = 0;

    constructor(fields: {

        bump: number;

    } | undefined = undefined) {
        if (fields) {

            this.bump = fields.bump;

        }
    }
}

const InitPDASchema = new Map([
    [
        InitPDA,
        {
            kind: "struct",
            fields: [

                ["bump", "u8"],

            ],
        },
    ],
])

export { InitPDA, InitPDASchema, TransferData, TransferDataSchema };
