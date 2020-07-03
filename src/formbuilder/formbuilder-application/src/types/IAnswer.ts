export enum AnswerTypes {
    boolean = 'boolean',
    choice = 'choice',
    number = 'number',
    time = 'time',
    text = 'text',
}

export enum FhirAnswerTypes {
    boolean = 'boolean',
    decimal = 'decimal',
    integer = 'integer',
    date = 'date',
    dateTime = 'dateTime',
    time = 'time',
    choice = 'choice',
    openChoice = 'open-choice',
    string = 'string',
    number = 'number',
    text = 'text',
    radio = 'radio',
}

export interface IAnswer {
    id: string;
}

export interface IChoice extends IAnswer {
    isMultiple: boolean;
    isOpen: boolean;
    hasDefault: boolean;
    choices: Array<string>;
    hasDefaultValue: boolean;
    defaultValue?: number;
}

export interface INumber extends IAnswer {
    hasMax: boolean;
    hasMin: boolean;
    hasUnit: boolean;
    isDecimal: boolean;
    maxValue: number;
    minValue: number;
    hasDefaultValue: boolean;
    defaultValue?: number;
    unit?: string;
}

export interface IText extends IAnswer {
    isLong: boolean;
    maxLength: number;
}

export interface ITime extends IAnswer {
    isTime: boolean;
    isDate: boolean;
    hasDefaultTime: boolean;
    defaultTime?: string;
    startTime?: string;
    endTime?: string;
}

export interface IBoolean extends IAnswer {
    isChecked: boolean;
    label: string;
}
export default AnswerTypes;
