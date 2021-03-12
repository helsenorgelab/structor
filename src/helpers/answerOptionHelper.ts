import { QuestionnaireItemAnswerOption } from '../types/fhir';
import createUUID from './CreateUUID';

export const createNewSystem = (): string => {
    return `${createUUID()}-system`;
};

export const createNewAnswerOption = (system?: string): QuestionnaireItemAnswerOption => {
    return {
        valueCoding: {
            code: createUUID(),
            system: system,
            display: '',
        },
    } as QuestionnaireItemAnswerOption;
};

export const addEmptyOptionToAnswerOptionArray = (
    values: QuestionnaireItemAnswerOption[],
): QuestionnaireItemAnswerOption[] => {
    // find existing system, if any. Otherwise generate new system
    const system = values.length > 0 ? values[0].valueCoding?.system : createNewSystem();

    // create new answerOption to add
    const newValueCoding = createNewAnswerOption(system);
    return [...values, newValueCoding];
};

export const updateAnswerOption = (
    values: QuestionnaireItemAnswerOption[],
    targetCode: string,
    displayValue: string,
): QuestionnaireItemAnswerOption[] => {
    return values.map((x) => {
        return x.valueCoding?.code === targetCode
            ? ({
                  valueCoding: {
                      ...x.valueCoding,
                      display: displayValue,
                  },
              } as QuestionnaireItemAnswerOption)
            : x;
    });
};

export const updateAnswerOptionCode = (
    values: QuestionnaireItemAnswerOption[],
    index: number,
    code: string,
): QuestionnaireItemAnswerOption[] => {
    return values.map((x, currentIndex) => {
        //TODO: validate unique code!
        return currentIndex === index
            ? ({
                  valueCoding: {
                      ...x.valueCoding,
                      code,
                  },
              } as QuestionnaireItemAnswerOption)
            : x;
    });
};

export const removeOptionFromAnswerOptionArray = (
    values: QuestionnaireItemAnswerOption[],
    targetCode: string,
): QuestionnaireItemAnswerOption[] => {
    return values.filter((x) => x.valueCoding?.code !== targetCode);
};

export const swapPositions = (
    list: QuestionnaireItemAnswerOption[],
    to: number,
    from: number,
): QuestionnaireItemAnswerOption[] => {
    [list[to], list[from]] = [list[from], list[to]];
    return list;
};
