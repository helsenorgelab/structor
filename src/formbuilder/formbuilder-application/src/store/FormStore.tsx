import React, { useReducer, createContext, Dispatch } from 'react';
import ISection from '../types/ISection';
import IQuestion from '../types/IQuestion';
import SectionList from '../types/SectionList';
import QuestionList from '../types/QuestionList';
import { generateID } from '../helpers/IDGenerator';
import produce from 'immer';

const initSectionId = generateID();
const initSection: ISection = {
    id: initSectionId,
    questionOrder: [],
    title: '',
};
const initSections: SectionList = {};
initSections[initSectionId] = initSection;

export const initialState: State = {
    sections: initSections,
    questions: {},
    sectionOrder: [initSectionId],
};

export enum ActionTypes {
    ADD_SECTION = 'ADD_SECTION',
    ADD_NEW_SECTION = 'ADD_NEW_SECTION',
    REMOVE_SECTION = 'REMOVE_SECTION',
    ADD_QUESTION = 'ADD_QUESTION',
    ADD_NEW_QUESTION = 'ADD_NEW_QUESTION',
    REMOVE_QUESTION = 'REMOVE_QUESTION',
}

export enum SwapActionTypes {
    SWAP_SECTION = 'SWAP_SECTION',
    SWAP_QUESTION = 'SWAP_QUESTION',
}

export enum DuplicateActionTypes {
    DUPLICATE_SECTION = 'DUPLICATE_SECTION',
    DUPLICATE_QUESTION = 'DUPLICATE_QUESTION',
}

export interface Action {
    type: ActionTypes;
    sectionIndex?: number;
    sectionId?: string;
    questionId?: string;
    questionIndex?: number;
    section?: ISection;
    question?: IQuestion;
}

export interface SwapAction {
    type: SwapActionTypes;
    sectionId?: string;
    oldSectionIndex?: number;
    newSectionIndex?: number;
    oldSectionId?: string;
    newSectionId?: string;
    oldQuestionIndex?: number;
    newQuestionIndex?: number;
}

export interface DuplicateAction {
    type: DuplicateActionTypes;
    sectionId?: string;
    sectionIndex?: number;
    newSectionIndex?: number;
    newSectionId?: string;
    questionIndex?: number;
    questionId?: string;
    newQuestionIndex?: number;
    newQuestionId?: string;
}

export interface State {
    sections: SectionList;
    questions: QuestionList;
    sectionOrder: Array<string>;
}

export function addSection(sectionIndex: number, section: ISection): Action {
    return {
        type: ActionTypes.ADD_SECTION,
        sectionIndex: sectionIndex,
        section: section,
    };
}

export function addNewSection(): Action {
    const sectionId = generateID();
    const newSection: ISection = {
        id: sectionId,
        questionOrder: [],
        title: '',
    };
    return {
        type: ActionTypes.ADD_NEW_SECTION,
        section: newSection,
    };
}

export function duplicateSection(
    sectionIndex: number,
    sectionId: string,
): DuplicateAction {
    const newSectionId = generateID();
    const newSectionIndex = sectionIndex + 1;
    return {
        type: DuplicateActionTypes.DUPLICATE_SECTION,
        sectionIndex: sectionIndex,
        sectionId: sectionId,
        newSectionIndex: newSectionIndex,
        newSectionId: newSectionId,
    };
}

export function removeSection(sectionIndex: number): Action {
    return {
        type: ActionTypes.REMOVE_SECTION,
        sectionIndex: sectionIndex,
    };
}

export function swapSection(
    oldSectionIndex: number,
    newSectionIndex: number,
): SwapAction {
    return {
        type: SwapActionTypes.SWAP_SECTION,
        oldSectionIndex: oldSectionIndex,
        newSectionIndex: newSectionIndex,
    };
}

// export function addQuestion(
//     sectionIndex: number,
//     questionIndex: number,
//     question: IQuestion,
// ): Action {
//     return {
//         type: ActionTypes.ADD_QUESTION,
//         sectionIndex: sectionIndex,
//         questionIndex: questionIndex,
//         question: question,
//     };
// }

export function addNewQuestion(sectionId: string): Action {
    const questionId = generateID();
    const newQuestion: IQuestion = {
        id: questionId,
        sectionId: sectionId,
        questionText: '',
    };
    return {
        type: ActionTypes.ADD_NEW_QUESTION,
        question: newQuestion,
    };
}

export function duplicateQuestion(
    sectionId: string,
    questionIndex: number,
    questionId: string,
): DuplicateAction {
    const newQuestionId = generateID();
    const newQuestionIndex = questionIndex + 1;
    return {
        type: DuplicateActionTypes.DUPLICATE_QUESTION,
        sectionId: sectionId,
        questionId: questionId,
        newQuestionIndex: newQuestionIndex,
        newQuestionId: newQuestionId,
    };
}

export function removeQuestion(
    questionIndex: number,
    sectionId: string,
): Action {
    return {
        type: ActionTypes.REMOVE_QUESTION,
        questionIndex: questionIndex,
        sectionId: sectionId,
    };
}

export function swapQuestion(
    oldSectionId: string,
    oldQuestionIndex: number,
    newSectionId: string,
    newQuestionIndex: number,
): SwapAction {
    return {
        type: SwapActionTypes.SWAP_QUESTION,
        oldQuestionIndex: oldQuestionIndex,
        newQuestionIndex: newQuestionIndex,
        oldSectionId: oldSectionId,
        newSectionId: newSectionId,
    };
}

const reducer = produce(
    (draft: State, action: Action | SwapAction | DuplicateAction) => {
        switch (action.type) {
            // case ActionTypes.ADD_SECTION:
            //     if (action.section)
            //         draft.sections[action.sectionIndex] = action.section;
            //     break;
            case ActionTypes.ADD_NEW_SECTION:
                if (action.section) {
                    draft.sections[action.section.id] = action.section;
                    draft.sectionOrder.push(action.section.id);
                }
                break;
            case DuplicateActionTypes.DUPLICATE_SECTION:
                if (
                    action.sectionId !== undefined &&
                    action.newSectionId !== undefined &&
                    action.sectionIndex !== undefined &&
                    action.newSectionIndex !== undefined
                ) {
                    const sectionCopy = { ...draft.sections[action.sectionId] };
                    sectionCopy.title += ' - Kopi';
                    sectionCopy.id = action.newSectionId;
                    const newQuestionsOrder = new Array<string>();
                    sectionCopy.questionOrder.forEach((questionId: string) => {
                        const tmpQuestion = { ...draft.questions[questionId] };
                        tmpQuestion.id = generateID();
                        tmpQuestion.questionText += ' - Kopi';
                        draft.questions[tmpQuestion.id] = tmpQuestion;
                        newQuestionsOrder.push(tmpQuestion.id);
                    });
                    sectionCopy.questionOrder = newQuestionsOrder;
                    draft.sections[sectionCopy.id] = sectionCopy;
                    draft.sectionOrder.splice(
                        action.newSectionIndex,
                        0,
                        sectionCopy.id,
                    );
                    break;
                }
            case ActionTypes.REMOVE_SECTION:
                if (action.sectionIndex !== undefined) {
                    const sectionId = draft.sectionOrder[action.sectionIndex];
                    draft.sectionOrder.splice(action.sectionIndex, 1);
                    const section = draft.sections[sectionId];
                    section.questionOrder.forEach((questionId) => {
                        delete draft.questions[questionId];
                    });
                    delete draft.sections[sectionId];
                }
                break;
            case SwapActionTypes.SWAP_SECTION:
                if (
                    action.oldSectionIndex !== undefined &&
                    action.newSectionIndex !== undefined
                ) {
                    const oldId = draft.sectionOrder[action.oldSectionIndex];
                    draft.sectionOrder[action.oldSectionIndex] =
                        draft.sectionOrder[action.newSectionIndex];
                    draft.sectionOrder[action.newSectionIndex] = oldId;
                }
                break;
            // case ActionTypes.ADD_QUESTION:
            //     if (action.question && action.questionIndex)
            //         draft.sections[action.sectionIndex].questions[
            //             action.questionIndex
            //         ] = action.question;
            //     break;
            case ActionTypes.ADD_NEW_QUESTION:
                if (action.question) {
                    draft.sections[
                        action.question.sectionId
                    ].questionOrder.push(action.question.id);
                    draft.questions[action.question.id] = action.question;
                }
                break;
            case DuplicateActionTypes.DUPLICATE_QUESTION:
                if (
                    action.sectionId !== undefined &&
                    action.questionId !== undefined &&
                    action.newQuestionId !== undefined &&
                    action.newQuestionIndex !== undefined
                ) {
                    const questionCopy = {
                        ...draft.questions[action.questionId],
                    };
                    questionCopy.questionText += ' - Kopi';
                    questionCopy.id = action.newQuestionId;

                    draft.questions[questionCopy.id] = questionCopy;
                    draft.sections[action.sectionId].questionOrder.splice(
                        action.newQuestionIndex,
                        0,
                        questionCopy.id,
                    );
                    break;
                }
            case ActionTypes.REMOVE_QUESTION:
                if (
                    action.questionIndex !== undefined &&
                    action.sectionId !== undefined
                ) {
                    const questionId =
                        draft.sections[action.sectionId].questionOrder[
                            action.questionIndex
                        ];
                    draft.sections[action.sectionId].questionOrder.splice(
                        action.questionIndex,
                        1,
                    );
                    delete draft.questions[questionId];
                }
                break;
            case SwapActionTypes.SWAP_QUESTION:
                if (
                    action.oldQuestionIndex !== undefined &&
                    action.newQuestionIndex !== undefined &&
                    action.oldSectionId !== undefined &&
                    action.newSectionId !== undefined
                ) {
                    const sourceId =
                        draft.sections[action.oldSectionId].questionOrder[
                            action.oldQuestionIndex
                        ];
                    if (action.oldSectionId !== action.newSectionId) {
                        draft.questions[sourceId].sectionId =
                            action.newSectionId;
                    }
                    draft.sections[action.oldSectionId].questionOrder.splice(
                        action.oldQuestionIndex,
                        1,
                    );
                    draft.sections[action.newSectionId].questionOrder.splice(
                        action.newQuestionIndex,
                        0,
                        sourceId,
                    );
                }
                break;
        }
    },
);

export const FormContext = createContext<{
    state: State;
    dispatch: Dispatch<Action | SwapAction | DuplicateAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const FormContextProvider = (props: {
    children: JSX.Element;
}): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        // eslint-disable-next-line
        // @ts-ignore
        <FormContext.Provider value={{ state, dispatch }}>
            {props.children}
        </FormContext.Provider>
    );
};