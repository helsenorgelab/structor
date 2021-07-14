import CreateUUID from '../../helpers/CreateUUID';
import {
    ICodingProperty,
    IEnableWhen,
    IExtentionType,
    IItemProperty,
    IQuestionnaireItemType,
    IValueSetSystem,
} from '../../types/IQuestionnareItemType';
import {
    QuestionnaireItem,
    Extension,
    QuestionnaireItemAnswerOption,
    QuestionnaireItemInitial,
    Element,
    ValueSet,
    Meta,
    Coding,
    ContactDetail,
} from '../../types/fhir';
import { IQuestionnaireMetadataType } from '../../types/IQuestionnaireMetadataType';
import { TranslatableItemProperty } from '../../types/LanguageTypes';
import { TreeState } from './treeStore';
import { ItemControlType } from '../../helpers/itemControl';

export const ADD_ITEM_CODE_ACTION = 'addItemCode';
export const ADD_QUESTIONNAIRE_LANGUAGE_ACTION = 'addQuestionnaireLanguage';
export const DELETE_ITEM_CODE_ACTION = 'deleteItemCode';
export const UPDATE_ITEM_CODE_PROPERTY_ACTION = 'updateItemCodeProperty';
export const REMOVE_QUESTIONNAIRE_LANGUAGE_ACTION = 'removeQuestionnaireLanguage';
export const UPDATE_ITEM_TRANSLATION_ACTION = 'updateItemTranslation';
export const UPDATE_ITEM_OPTION_TRANSLATION_ACTION = 'updateItemOptionTranslation';
export const UPDATE_METADATA_TRANSLATION_ACTION = 'updateMetadataTranslation';
export const UPDATE_CONTAINED_VALUESET_TRANSLATION_ACTION = 'updateContainedValueSetTranslation';
export const UPDATE_SIDEBAR_TRANSLATION_ACTION = 'updateSidebarTranslation';
export const UPDATE_QUESTIONNAIRE_METADATA_ACTION = 'updateQuestionnaireMetadata';
export const NEW_ITEM_ACTION = 'newItem';
export const REMOVE_ITEM_ATTRIBUTE_ACTION = 'removeItemAttribute';
export const DELETE_ITEM_ACTION = 'deleteItem';
export const DELETE_CHILD_ITEMS_ACTION = 'deleteChildItems';
export const UPDATE_ITEM_ACTION = 'updateItem';
export const DUPLICATE_ITEM_ACTION = 'duplicateItem';
export const RESET_QUESTIONNAIRE_ACTION = 'resetQuestionnaire';
export const REORDER_ITEM_ACTION = 'reorderItem';
export const MOVE_ITEM_ACTION = 'moveItem';
export const APPEND_VALUESET_ACTION = 'appendValueSet';
export const UPDATE_LINK_ID_ACTION = 'updateLinkId';
export const UPDATE_MARKED_LINK_ID = 'updateMarkedLinkId';
export const UPDATE_VALUESET_ACTION = 'UPDATE_VALUESET';
export const IMPORT_VALUESET_ACTION = 'IMPORT_VALUESET';
export const SAVE_ACTION = 'save';

type ItemValueType =
    | string
    | boolean
    | Extension[]
    | IEnableWhen[]
    | number
    | QuestionnaireItemAnswerOption[]
    | Element
    | QuestionnaireItemInitial[]
    | Coding[]
    | undefined; // TODO: legg på alle lovlige verdier

export interface AddItemCodeAction {
    type: typeof ADD_ITEM_CODE_ACTION;
    linkId: string;
    code: Coding;
}

export interface DeleteItemCodeAction {
    type: typeof DELETE_ITEM_CODE_ACTION;
    linkId: string;
    index: number;
}

export interface UpdateItemCodePropertyAction {
    type: typeof UPDATE_ITEM_CODE_PROPERTY_ACTION;
    linkId: string;
    index: number;
    property: ICodingProperty;
    value: string;
}

export interface UpdateMarkedLinkId {
    type: typeof UPDATE_MARKED_LINK_ID;
    linkId?: string;
    parentArray?: Array<string>;
}
export interface AddQuestionnaireLanguageAction {
    type: typeof ADD_QUESTIONNAIRE_LANGUAGE_ACTION;
    additionalLanguageCode: string;
}

export interface RemoveQuestionnaireLanguageAction {
    type: typeof REMOVE_QUESTIONNAIRE_LANGUAGE_ACTION;
    languageCode: string;
}

export interface UpdateItemTranslationAction {
    type: typeof UPDATE_ITEM_TRANSLATION_ACTION;
    languageCode: string;
    linkId: string;
    propertyName: TranslatableItemProperty;
    value: string;
}

export interface UpdateItemOptionTranslationAction {
    type: typeof UPDATE_ITEM_OPTION_TRANSLATION_ACTION;
    languageCode: string;
    linkId: string;
    text: string;
    optionCode: string;
}

export interface UpdateMetadataTranslationAction {
    type: typeof UPDATE_METADATA_TRANSLATION_ACTION;
    languageCode: string;
    propertyName: string;
    translation: string;
}

export interface UpdateContainedValueSetTranslationAction {
    type: typeof UPDATE_CONTAINED_VALUESET_TRANSLATION_ACTION;
    languageCode: string;
    valueSetId: string;
    conceptId: string;
    translation: string;
}

export interface UpdateSidebarTranslationAction {
    type: typeof UPDATE_SIDEBAR_TRANSLATION_ACTION;
    languageCode: string;
    linkId: string;
    value: string;
}

export interface UpdateLinkIdAction {
    type: typeof UPDATE_LINK_ID_ACTION;
    oldLinkId: string;
    newLinkId: string;
    parentArray: Array<string>;
}

export interface UpdateQuestionnaireMetadataAction {
    type: typeof UPDATE_QUESTIONNAIRE_METADATA_ACTION;
    propName: IQuestionnaireMetadataType;
    value: string | Meta | Extension[] | ContactDetail[];
}

export interface NewItemAction {
    type: typeof NEW_ITEM_ACTION;
    item: QuestionnaireItem;
    order: Array<string>;
}

export interface DeleteItemAction {
    type: typeof DELETE_ITEM_ACTION;
    linkId: string;
    order: Array<string>;
}

export interface DeleteChildItemsAction {
    type: typeof DELETE_CHILD_ITEMS_ACTION;
    linkId: string;
    order: Array<string>;
}

export interface UpdateItemAction {
    type: typeof UPDATE_ITEM_ACTION;
    linkId: string;
    itemProperty: IItemProperty;
    itemValue: ItemValueType;
}

export interface RemoveItemAttributeAction {
    type: typeof REMOVE_ITEM_ATTRIBUTE_ACTION;
    linkId: string;
    itemProperty: IItemProperty;
}

export interface DuplicateItemAction {
    type: typeof DUPLICATE_ITEM_ACTION;
    linkId: string;
    order: Array<string>;
}

export interface ResetQuestionnaireAction {
    type: typeof RESET_QUESTIONNAIRE_ACTION;
    newState?: TreeState;
}

export interface ReorderItemAction {
    type: typeof REORDER_ITEM_ACTION;
    linkId: string;
    order: Array<string>;
    newIndex: number;
}

export interface MoveItemAction {
    type: typeof MOVE_ITEM_ACTION;
    linkId: string;
    oldOrder: string[];
    newOrder: string[];
    index?: number;
}

export interface UpdateValueSetAction {
    type: typeof UPDATE_VALUESET_ACTION;
    item: ValueSet;
}

export interface ImportValueSetAction {
    type: typeof IMPORT_VALUESET_ACTION;
    items: ValueSet[];
}

export interface SaveAction {
    type: typeof SAVE_ACTION;
}

export const updateMarkedLinkIdAction = (markedLinkId?: string, parentArray?: Array<string>): UpdateMarkedLinkId => {
    return {
        type: UPDATE_MARKED_LINK_ID,
        linkId: markedLinkId,
        parentArray,
    };
};

export const addItemCodeAction = (linkId: string, code: Coding): AddItemCodeAction => {
    return {
        type: ADD_ITEM_CODE_ACTION,
        linkId,
        code,
    };
};

export const deleteItemCodeAction = (linkId: string, index: number): DeleteItemCodeAction => {
    return {
        type: DELETE_ITEM_CODE_ACTION,
        linkId,
        index,
    };
};

export const updateItemCodePropertyAction = (
    linkId: string,
    index: number,
    property: ICodingProperty,
    value: string,
): UpdateItemCodePropertyAction => {
    return {
        type: UPDATE_ITEM_CODE_PROPERTY_ACTION,
        linkId,
        index,
        property,
        value,
    };
};

export const addQuestionnaireLanguageAction = (additionalLanguageCode: string): AddQuestionnaireLanguageAction => {
    return {
        type: ADD_QUESTIONNAIRE_LANGUAGE_ACTION,
        additionalLanguageCode,
    };
};

export const removeQuestionnaireLanguageAction = (languageCode: string): RemoveQuestionnaireLanguageAction => {
    return {
        type: REMOVE_QUESTIONNAIRE_LANGUAGE_ACTION,
        languageCode,
    };
};

export const updateItemTranslationAction = (
    languageCode: string,
    linkId: string,
    propertyName: TranslatableItemProperty,
    value: string,
): UpdateItemTranslationAction => {
    return {
        type: UPDATE_ITEM_TRANSLATION_ACTION,
        languageCode,
        linkId,
        propertyName,
        value,
    };
};

export const updateItemOptionTranslationAction = (
    languageCode: string,
    linkId: string,
    text: string,
    optionCode: string,
): UpdateItemOptionTranslationAction => {
    return {
        type: UPDATE_ITEM_OPTION_TRANSLATION_ACTION,
        languageCode,
        linkId,
        text,
        optionCode,
    };
};

export const updateMetadataTranslationAction = (
    languageCode: string,
    propertyName: string,
    translation: string,
): UpdateMetadataTranslationAction => {
    return {
        type: UPDATE_METADATA_TRANSLATION_ACTION,
        languageCode,
        propertyName,
        translation,
    };
};

export const updateContainedValueSetTranslationAction = (
    languageCode: string,
    valueSetId: string,
    conceptId: string,
    translation: string,
): UpdateContainedValueSetTranslationAction => {
    return {
        type: UPDATE_CONTAINED_VALUESET_TRANSLATION_ACTION,
        languageCode,
        valueSetId,
        conceptId,
        translation,
    };
};

export const updateSidebarTranslationAction = (
    languageCode: string,
    linkId: string,
    value: string,
): UpdateSidebarTranslationAction => {
    return {
        type: UPDATE_SIDEBAR_TRANSLATION_ACTION,
        languageCode,
        linkId,
        value,
    };
};

export const updateLinkIdAction = (
    oldLinkId: string,
    newLinkId: string,
    parentArray: Array<string>,
): UpdateLinkIdAction => {
    return {
        type: UPDATE_LINK_ID_ACTION,
        oldLinkId,
        newLinkId,
        parentArray,
    };
};

export const updateQuestionnaireMetadataAction = (
    propName: IQuestionnaireMetadataType,
    value: string | Meta | Extension[] | ContactDetail[],
): UpdateQuestionnaireMetadataAction => {
    return {
        type: UPDATE_QUESTIONNAIRE_METADATA_ACTION,
        propName,
        value,
    };
};

export const newItemAction = (type: IQuestionnaireItemType, order: Array<string>): NewItemAction => {
    const newQuestionnaireItem = {
        linkId: CreateUUID(),
        type: type,
        text: '',
        extension: [],
        required: false,
    } as QuestionnaireItem;
    return {
        type: NEW_ITEM_ACTION,
        item: newQuestionnaireItem,
        order,
    };
};

export const newItemSidebar = (order: Array<string>): NewItemAction => {
    const sidebar = {
        extension: [
            {
                url: IExtentionType.itemControl,
                valueCodeableConcept: {
                    coding: [
                        {
                            system: IValueSetSystem.itemControlValueSet,
                            code: ItemControlType.sidebar,
                        },
                    ],
                },
            },
        ],
        linkId: CreateUUID(),
        code: [
            {
                system: IValueSetSystem.sotHeader,
                code: '',
                display: '',
            },
        ],
        _text: {
            extension: [
                {
                    url: IExtentionType.markdown,
                    valueMarkdown: '',
                },
            ],
        },
        type: IQuestionnaireItemType.text,
        required: false,
        repeats: false,
        readOnly: false,
    } as QuestionnaireItem;
    return {
        type: NEW_ITEM_ACTION,
        item: sidebar,
        order,
    };
};

export const newItemHelpIconAction = (order: Array<string>): NewItemAction => {
    const newQuestionnaireItem = {
        linkId: CreateUUID(),
        type: IQuestionnaireItemType.text,
        required: false,
        repeats: false,
        readOnly: true,
        maxLength: 250,
        _text: {
            extension: [
                {
                    url: IExtentionType.markdown,
                    valueMarkdown: '',
                },
            ],
        },
        extension: [
            {
                url: IExtentionType.itemControl,
                valueCodeableConcept: {
                    coding: [
                        {
                            system: IValueSetSystem.itemControlValueSet,
                            code: ItemControlType.help,
                        },
                    ],
                },
            },
        ],
    } as QuestionnaireItem;
    return {
        type: NEW_ITEM_ACTION,
        item: newQuestionnaireItem,
        order,
    };
};

export const deleteItemAction = (linkId: string, order: Array<string>): DeleteItemAction => {
    return {
        type: DELETE_ITEM_ACTION,
        linkId,
        order,
    };
};

export const deleteChildItemsAction = (linkId: string, order: Array<string>): DeleteChildItemsAction => {
    return {
        type: DELETE_CHILD_ITEMS_ACTION,
        linkId,
        order,
    };
};

export const updateItemAction = (
    linkId: string,
    itemProperty: IItemProperty,
    itemValue: ItemValueType,
): UpdateItemAction => {
    return {
        type: UPDATE_ITEM_ACTION,
        linkId,
        itemProperty,
        itemValue,
    };
};

export const removeItemAttributeAction = (linkId: string, itemProperty: IItemProperty): RemoveItemAttributeAction => {
    return {
        type: REMOVE_ITEM_ATTRIBUTE_ACTION,
        linkId,
        itemProperty,
    };
};

export const duplicateItemAction = (linkId: string, order: Array<string>): DuplicateItemAction => {
    return {
        type: DUPLICATE_ITEM_ACTION,
        linkId,
        order,
    };
};

export const resetQuestionnaireAction = (newState?: TreeState | undefined): ResetQuestionnaireAction => {
    return {
        type: RESET_QUESTIONNAIRE_ACTION,
        newState,
    };
};

export const reorderItemAction = (linkId: string, order: Array<string>, newIndex: number): ReorderItemAction => {
    return {
        type: REORDER_ITEM_ACTION,
        linkId,
        order,
        newIndex,
    };
};

export const moveItemAction = (
    linkId: string,
    newOrder: string[],
    oldOrder: string[],
    index?: number,
): MoveItemAction => {
    return {
        type: MOVE_ITEM_ACTION,
        linkId,
        newOrder,
        oldOrder,
        index,
    };
};

export const updateValueSetAction = (item: ValueSet): UpdateValueSetAction => {
    return {
        type: UPDATE_VALUESET_ACTION,
        item,
    };
};

export const importValueSetAction = (items: ValueSet[]): ImportValueSetAction => {
    return {
        type: IMPORT_VALUESET_ACTION,
        items,
    };
};

export const saveAction = (): SaveAction => {
    return { type: SAVE_ACTION };
};
