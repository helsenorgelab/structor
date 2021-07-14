import React, { createContext, Dispatch, useEffect, useReducer } from 'react';
import produce from 'immer';

import { Extension, QuestionnaireItem, ValueSet } from '../../types/fhir';
import {
    ADD_ITEM_CODE_ACTION,
    ADD_QUESTIONNAIRE_LANGUAGE_ACTION,
    AddItemCodeAction,
    AddQuestionnaireLanguageAction,
    DELETE_CHILD_ITEMS_ACTION,
    DELETE_ITEM_ACTION,
    DELETE_ITEM_CODE_ACTION,
    DeleteChildItemsAction,
    DeleteItemAction,
    DeleteItemCodeAction,
    DUPLICATE_ITEM_ACTION,
    DuplicateItemAction,
    IMPORT_VALUESET_ACTION,
    ImportValueSetAction,
    MOVE_ITEM_ACTION,
    MoveItemAction,
    NEW_ITEM_ACTION,
    NewItemAction,
    REMOVE_ITEM_ATTRIBUTE_ACTION,
    REMOVE_QUESTIONNAIRE_LANGUAGE_ACTION,
    RemoveItemAttributeAction,
    RemoveQuestionnaireLanguageAction,
    REORDER_ITEM_ACTION,
    ReorderItemAction,
    RESET_QUESTIONNAIRE_ACTION,
    ResetQuestionnaireAction,
    SAVE_ACTION,
    SaveAction,
    UPDATE_CONTAINED_VALUESET_TRANSLATION_ACTION,
    UPDATE_ITEM_ACTION,
    UPDATE_ITEM_CODE_PROPERTY_ACTION,
    UPDATE_ITEM_OPTION_TRANSLATION_ACTION,
    UPDATE_ITEM_TRANSLATION_ACTION,
    UPDATE_LINK_ID_ACTION,
    UPDATE_MARKED_LINK_ID,
    UPDATE_METADATA_TRANSLATION_ACTION,
    UPDATE_QUESTIONNAIRE_METADATA_ACTION,
    UPDATE_SIDEBAR_TRANSLATION_ACTION,
    UPDATE_VALUESET_ACTION,
    UpdateContainedValueSetTranslationAction,
    UpdateItemAction,
    UpdateItemCodePropertyAction,
    UpdateItemOptionTranslationAction,
    UpdateItemTranslationAction,
    UpdateLinkIdAction,
    UpdateMarkedLinkId,
    UpdateMetadataTranslationAction,
    UpdateQuestionnaireMetadataAction,
    UpdateSidebarTranslationAction,
    UpdateValueSetAction,
} from './treeActions';
import { IQuestionnaireMetadata, IQuestionnaireMetadataType } from '../../types/IQuestionnaireMetadataType';
import createUUID from '../../helpers/CreateUUID';
import { IItemProperty } from '../../types/IQuestionnareItemType';
import { createNewAnswerOption } from '../../helpers/answerOptionHelper';
import { INITIAL_LANGUAGE } from '../../helpers/LanguageHelper';
import { isIgnorableItem, isTqqcOptionReferenceItem } from '../../helpers/itemControl';
import { createOptionReferenceExtensions } from '../../helpers/extensionHelper';
import { initPredefinedValueSet } from '../../helpers/initPredefinedValueSet';
import { createSystemUUID } from '../../helpers/systemHelper';
import { saveStateToDb } from './indexedDbHelper';

export type ActionType =
    | AddItemCodeAction
    | AddQuestionnaireLanguageAction
    | DeleteItemCodeAction
    | ImportValueSetAction
    | RemoveQuestionnaireLanguageAction
    | UpdateItemCodePropertyAction
    | UpdateItemTranslationAction
    | UpdateItemOptionTranslationAction
    | ResetQuestionnaireAction
    | UpdateQuestionnaireMetadataAction
    | NewItemAction
    | DeleteItemAction
    | DeleteChildItemsAction
    | UpdateItemAction
    | DuplicateItemAction
    | ReorderItemAction
    | MoveItemAction
    | UpdateContainedValueSetTranslationAction
    | UpdateLinkIdAction
    | UpdateMetadataTranslationAction
    | UpdateSidebarTranslationAction
    | UpdateValueSetAction
    | RemoveItemAttributeAction
    | SaveAction
    | UpdateMarkedLinkId;

export interface Items {
    [key: string]: QuestionnaireItem;
}

export interface CodeStringValue {
    [code: string]: string;
}

export interface ItemTranslation {
    answerOptions?: CodeStringValue;
    entryFormatText?: string;
    initial?: string;
    text?: string;
    markdownText?: string;
    validationText?: string;
    sublabel?: string;
    repeatsText?: string;
}

export interface ContainedTranslation {
    concepts: CodeStringValue;
}

export interface ContainedTranslations {
    [id: string]: ContainedTranslation;
}

export interface ItemTranslations {
    [key: string]: ItemTranslation;
}

export interface MetadataTranslations {
    [key: string]: string;
}

export interface SidebarItemTranslation {
    markdown: string;
}

export interface SidebarItemTranslations {
    [linkId: string]: SidebarItemTranslation;
}

export interface Translation {
    items: ItemTranslations;
    sidebarItems: SidebarItemTranslations;
    metaData: MetadataTranslations;
    contained: ContainedTranslations;
}

export interface Languages {
    [key: string]: Translation;
}

export interface OrderItem {
    linkId: string;
    items: Array<OrderItem>;
}

export interface MarkedItem {
    linkId: string;
    parentArray: Array<string>;
}

export interface TreeState {
    isDirty: boolean;
    qItems: Items;
    qOrder: OrderItem[];
    qMetadata: IQuestionnaireMetadata;
    qContained?: ValueSet[];
    qCurrentItem?: MarkedItem;
    qAdditionalLanguages?: Languages;
}

export const initialState: TreeState = {
    isDirty: false,
    qItems: {},
    qOrder: [],
    qMetadata: {
        title: '',
        description: '',
        resourceType: 'Questionnaire',
        language: INITIAL_LANGUAGE.code,
        name: '',
        status: 'draft',
        publisher: 'NHN',
        meta: {
            profile: ['http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire'],
            tag: [
                {
                    system: 'urn:ietf:bcp:47',
                    code: INITIAL_LANGUAGE.code,
                    display: INITIAL_LANGUAGE.display,
                },
            ],
        },
        useContext: [
            {
                code: {
                    system: 'uri', // TODO
                    code: 'focus',
                    display: 'Clinical focus',
                },
                valueCodeableConcept: {
                    coding: [
                        {
                            system: 'uri', // TODO
                            code: '29',
                            display: '',
                        },
                    ],
                },
            },
        ],
        contact: [
            {
                name: 'http://www.nhn.no',
            },
        ],
        subjectType: ['Patient'],
        extension: [],
    },
    qContained: initPredefinedValueSet,
    qCurrentItem: undefined,
    qAdditionalLanguages: {},
};

function buildTranslationBase(): Translation {
    return { items: {}, sidebarItems: {}, metaData: {}, contained: {} };
}

function addLanguage(draft: TreeState, action: AddQuestionnaireLanguageAction) {
    if (!draft.qAdditionalLanguages) {
        draft.qAdditionalLanguages = {};
    }
    draft.qAdditionalLanguages[action.additionalLanguageCode] = buildTranslationBase();
}

function removeLanguage(draft: TreeState, action: RemoveQuestionnaireLanguageAction) {
    if (!draft.qAdditionalLanguages) {
        draft.qAdditionalLanguages = {};
    }
    delete draft.qAdditionalLanguages[action.languageCode];
}

function findTreeArray(searchPath: Array<string>, searchItems: Array<OrderItem>): Array<OrderItem> {
    if (searchPath.length === 0) {
        return searchItems;
    }
    // finn neste i searchPath:
    const searchIndex = searchItems.findIndex((x) => x.linkId === searchPath[0]);
    return findTreeArray(searchPath.slice(1), searchItems[searchIndex].items);
}

function getLinkIdOfAllSubItems(items: Array<OrderItem>, linkIds: Array<string>): Array<string> {
    items.forEach((x) => {
        linkIds.push(x.linkId);
        getLinkIdOfAllSubItems(x.items, linkIds);
    });
    return linkIds;
}

function updateMarkedItemId(draft: TreeState, action: UpdateMarkedLinkId): void {
    if (action.linkId) {
        draft.qCurrentItem = { linkId: action.linkId, parentArray: action.parentArray || [] };
    } else {
        draft.qCurrentItem = undefined;
    }
}

function createNewItem(draft: TreeState, action: NewItemAction): void {
    const itemToAdd = action.item;
    draft.qItems[itemToAdd.linkId] = itemToAdd;
    // find the correct place to add the new item
    const arrayToAddItemTo = findTreeArray(action.order, draft.qOrder);
    arrayToAddItemTo.push({ linkId: itemToAdd.linkId, items: [] });

    const parentItem = draft.qItems[action.order[action.order.length - 1]];
    if (!isIgnorableItem(itemToAdd, parentItem)) {
        draft.qCurrentItem = { linkId: itemToAdd.linkId, parentArray: action.order };
    }
}

function moveItem(draft: TreeState, action: MoveItemAction): void {
    const arrayToDeleteItemFrom = findTreeArray(action.oldOrder, draft.qOrder);
    const indexToDelete = arrayToDeleteItemFrom.findIndex((x) => x.linkId === action.linkId);
    const subTree = arrayToDeleteItemFrom[indexToDelete].items;

    // find the correct place to move the item
    const arrayToAddItemTo = findTreeArray(action.newOrder, draft.qOrder);
    if (!action.index && action.index !== 0) {
        arrayToAddItemTo.push({ linkId: action.linkId, items: subTree });
    } else {
        arrayToAddItemTo.splice(action.index, 0, { linkId: action.linkId, items: subTree });
    }

    // delete node from qOrder
    arrayToDeleteItemFrom.splice(indexToDelete, 1);

    // update currentItem
    if (draft.qCurrentItem) {
        draft.qCurrentItem = { ...draft.qCurrentItem, parentArray: action.newOrder };
    }
}

function deleteItemTranslations(linkIdToDelete: string, languages?: Languages) {
    if (!languages) {
        return;
    }
    Object.values(languages).forEach((translation) => {
        delete translation.items[linkIdToDelete];
    });
}

function deleteChildItems(draft: TreeState, action: DeleteChildItemsAction): void {
    const itemToDeleteChildrenFrom = findTreeArray(action.order, draft.qOrder).find(
        (item) => item.linkId === action.linkId,
    );
    if (!itemToDeleteChildrenFrom) {
        return;
    }
    const itemsToDelete = getLinkIdOfAllSubItems(itemToDeleteChildrenFrom.items, []);
    itemsToDelete.forEach((linkIdToDelete: string) => {
        delete draft.qItems[linkIdToDelete];
        deleteItemTranslations(linkIdToDelete, draft.qAdditionalLanguages);
    });
    // delete node from qOrder
    itemToDeleteChildrenFrom.items = [];
}

function deleteItem(draft: TreeState, action: DeleteItemAction): void {
    const arrayToDeleteItemFrom = findTreeArray(action.order, draft.qOrder);
    const indexToDelete = arrayToDeleteItemFrom.findIndex((x) => x.linkId === action.linkId);

    // find all child items in the tree below this node and delete from qItems
    const itemsToDelete = [action.linkId, ...getLinkIdOfAllSubItems(arrayToDeleteItemFrom[indexToDelete].items, [])];
    itemsToDelete.forEach((linkIdToDelete: string) => {
        delete draft.qItems[linkIdToDelete];
        deleteItemTranslations(linkIdToDelete, draft.qAdditionalLanguages);
    });

    // delete node from qOrder
    arrayToDeleteItemFrom.splice(indexToDelete, 1);

    // set no item selected if the selected item was deleted
    if (draft.qCurrentItem?.linkId === action.linkId) {
        draft.qCurrentItem = undefined;
    }
}

function updateItem(draft: TreeState, action: UpdateItemAction): void {
    const isEmptyArray = (): boolean => {
        const { itemProperty, itemValue } = action;
        if (itemProperty === IItemProperty.extension && (itemValue as Array<Extension>).length === 0) {
            return true;
        }
        return false;
    };

    if (!action.itemValue || isEmptyArray()) {
        delete draft.qItems[action.linkId][action.itemProperty];
        return;
    }

    draft.qItems[action.linkId] = {
        ...draft.qItems[action.linkId],
        [action.itemProperty]: action.itemValue,
    };

    if (action.itemValue === 'choice' && isTqqcOptionReferenceItem(draft.qItems[action.linkId])) {
        //handle dropdown!
        draft.qItems[action.linkId].extension = [
            ...(draft.qItems[action.linkId].extension || []),
            ...createOptionReferenceExtensions,
        ];
    } else if (
        // add two empty options for choice and open-choice
        action.itemProperty === IItemProperty.type &&
        (action.itemValue === 'choice' || action.itemValue === 'open-choice') &&
        !draft.qItems[action.linkId].answerOption
    ) {
        const system = createSystemUUID();
        draft.qItems[action.linkId] = {
            ...draft.qItems[action.linkId],
            answerOption: [createNewAnswerOption(system), createNewAnswerOption(system)],
        };
    } else if (
        action.itemProperty === IItemProperty.type &&
        action.itemValue !== 'choice' &&
        action.itemValue !== 'open-choice' &&
        draft.qItems[action.linkId].answerOption
    ) {
        draft.qItems[action.linkId].answerOption = undefined;
    }
}

function addItemCode(draft: TreeState, action: AddItemCodeAction): void {
    if (!draft.qItems[action.linkId]) {
        console.error('Trying to add "code" to non-extistent item');
        return;
    }
    if (!draft.qItems[action.linkId].code) {
        draft.qItems[action.linkId].code = [];
    }
    draft.qItems[action.linkId].code?.push(action.code);
}

function deleteItemCode(draft: TreeState, action: DeleteItemCodeAction): void {
    if (!draft.qItems[action.linkId]) {
        console.error('Trying to delete "code" from non-extistent item');
        return;
    }
    const { code } = draft.qItems[action.linkId];
    if (code && code.length > 1) {
        draft.qItems[action.linkId].code?.splice(action.index, 1);
    } else {
        delete draft.qItems[action.linkId].code;
    }
}

function updateItemCodeProperty(draft: TreeState, action: UpdateItemCodePropertyAction): void {
    const code = draft.qItems[action.linkId].code;
    if (!code) {
        console.error('Trying to update "code" from non-extistent item or code');
        return;
    }

    if (code && code[action.index]) {
        code[action.index][action.property] = action.value;
    }
}

function updateItemTranslation(draft: TreeState, action: UpdateItemTranslationAction) {
    if (draft.qAdditionalLanguages) {
        if (!draft.qAdditionalLanguages[action.languageCode].items[action.linkId]) {
            draft.qAdditionalLanguages[action.languageCode].items[action.linkId] = {};
        }
        draft.qAdditionalLanguages[action.languageCode].items[action.linkId][action.propertyName] = action.value;
    }
}

function updateItemOptionTranslation(draft: TreeState, action: UpdateItemOptionTranslationAction) {
    if (draft.qAdditionalLanguages) {
        const item = draft.qAdditionalLanguages[action.languageCode].items[action.linkId];
        if (!item.answerOptions) {
            item.answerOptions = {};
        }
        item.answerOptions[action.optionCode] = action.text;
    }
}

function updateMetadataTranslation(draft: TreeState, action: UpdateMetadataTranslationAction) {
    if (draft.qAdditionalLanguages) {
        draft.qAdditionalLanguages[action.languageCode].metaData[action.propertyName] = action.translation;
    }
}

function updateContainedValueSetTranslation(draft: TreeState, action: UpdateContainedValueSetTranslationAction) {
    if (draft.qAdditionalLanguages) {
        const contained = draft.qAdditionalLanguages[action.languageCode].contained;
        if (!contained[action.valueSetId]) {
            contained[action.valueSetId] = { concepts: {} };
        }
        contained[action.valueSetId].concepts[action.conceptId] = action.translation;
    }
}

function updateSidebarTranslation(draft: TreeState, action: UpdateSidebarTranslationAction) {
    if (draft.qAdditionalLanguages) {
        const sidebarItems = draft.qAdditionalLanguages[action.languageCode].sidebarItems;
        if (!sidebarItems[action.linkId]) {
            sidebarItems[action.linkId] = { markdown: '' };
        }
        sidebarItems[action.linkId].markdown = action.value;
    }
}

function updateQuestionnaireMetadataProperty(draft: TreeState, { propName, value }: UpdateQuestionnaireMetadataAction) {
    draft.qMetadata = {
        ...draft.qMetadata,
        [propName]: value,
    };

    if (IQuestionnaireMetadataType.title === propName) {
        const useContext = draft.qMetadata.useContext;
        if (useContext !== undefined && useContext.length > 0) {
            const codings = useContext[0].valueCodeableConcept?.coding;
            if (codings !== undefined && codings.length > 0) {
                codings[0].display = value as string;
            }
        }
    }
}

function resetQuestionnaire(draft: TreeState, action: ResetQuestionnaireAction): void {
    const newState: TreeState = action.newState || initialState;
    draft.isDirty = newState.isDirty;
    draft.qOrder = newState.qOrder;
    draft.qItems = newState.qItems;
    draft.qMetadata = newState.qMetadata;
    draft.qContained = newState?.qContained;
    draft.qAdditionalLanguages = newState.qAdditionalLanguages;
    draft.qCurrentItem = newState.qCurrentItem;
}

function duplicateItemAction(draft: TreeState, action: DuplicateItemAction): void {
    // find index of item to duplicate
    const arrayToDuplicateInto = findTreeArray(action.order, draft.qOrder);
    const indexToDuplicate = arrayToDuplicateInto.findIndex((x) => x.linkId === action.linkId);

    const copyItemTranslations = (linkIdToCopyFrom: string, newLinkId: string) => {
        if (draft.qAdditionalLanguages) {
            Object.values(draft.qAdditionalLanguages).forEach((translation) => {
                const translationItemToCopyFrom = translation.items[linkIdToCopyFrom];
                if (translationItemToCopyFrom) {
                    translation.items[newLinkId] = translationItemToCopyFrom;
                }
            });
        }
    };

    const copyItemWithSubtrees = (itemToCopyFrom: OrderItem, parentMap: { [key: string]: string }): OrderItem => {
        const copyItem: QuestionnaireItem = JSON.parse(JSON.stringify(draft.qItems[itemToCopyFrom.linkId]));
        const newId = createUUID();
        parentMap[copyItem.linkId] = newId;
        copyItem.linkId = newId;

        // update enableWhen if condition is a copied parent
        if (copyItem.enableWhen) {
            copyItem.enableWhen = copyItem.enableWhen.map((x) => {
                return { ...x, question: parentMap[x.question] || x.question };
            });
        }

        // add new item
        draft.qItems[copyItem.linkId] = copyItem;

        copyItemTranslations(itemToCopyFrom.linkId, newId);

        // add item to tree and generate subtrees
        return {
            linkId: copyItem.linkId,
            items: itemToCopyFrom.items.map((item) => copyItemWithSubtrees(item, parentMap)),
        };
    };

    const duplictedItem = copyItemWithSubtrees(arrayToDuplicateInto[indexToDuplicate], {});

    // insert duplicated item below item that was copied from
    arrayToDuplicateInto.splice(indexToDuplicate + 1, 0, duplictedItem);

    draft.qCurrentItem = { linkId: duplictedItem.linkId, parentArray: action.order };
}

function reorderItem(draft: TreeState, action: ReorderItemAction): void {
    const arrayToReorderFrom = findTreeArray(action.order, draft.qOrder);
    const indexToMove = arrayToReorderFrom.findIndex((x) => x.linkId === action.linkId);
    if (indexToMove === -1) {
        throw new Error('Could not find item to move');
    }
    const movedOrderItem = arrayToReorderFrom.splice(indexToMove, 1);
    arrayToReorderFrom.splice(action.newIndex, 0, movedOrderItem[0]);
}

function updateValueSet(draft: TreeState, action: UpdateValueSetAction): void {
    const indexToUpdate = draft?.qContained?.findIndex((x) => x.id === action.item.id);
    if (draft.qContained && indexToUpdate && indexToUpdate >= 0) {
        draft.qContained[indexToUpdate] = action.item;
    } else {
        draft.qContained = [...(draft?.qContained || []), action.item];
    }
}

function importValueSet(draft: TreeState, action: ImportValueSetAction): void {
    draft.qContained = [...(draft?.qContained || []), ...action.items];
}

function updateLinkId(draft: TreeState, action: UpdateLinkIdAction): void {
    const { qItems, qOrder, qAdditionalLanguages } = draft;
    const { oldLinkId, newLinkId, parentArray } = action;

    // Replace in qItems
    const oldItem = qItems[oldLinkId];
    const newItem = {
        ...oldItem,
        linkId: newLinkId,
    };
    qItems[newLinkId] = newItem;
    delete qItems[oldLinkId];

    // Replace in qOrder
    const arrayToUpdateIn = findTreeArray(parentArray, qOrder);
    const itemToUpdate = arrayToUpdateIn.find((item) => item.linkId === oldLinkId);
    if (!itemToUpdate) {
        throw new Error(`Trying to update linkId that doesn't exist`);
    }
    itemToUpdate.linkId = newLinkId;

    // Replace enableWhen(s)
    Object.values(qItems).forEach((item) => {
        if (!item.enableWhen) {
            return;
        }
        item.enableWhen.forEach((enableWhen) => {
            if (enableWhen.question === oldLinkId) {
                enableWhen.question = newLinkId;
            }
        });
    });

    if (qAdditionalLanguages) {
        Object.values(qAdditionalLanguages).forEach((translation) => {
            const oldItemTranslation = translation.items[oldLinkId];
            translation.items[newLinkId] = oldItemTranslation;
            delete translation.items[oldLinkId];
        });
    }

    // Update currentItem
    if (draft.qCurrentItem) {
        draft.qCurrentItem = { ...draft.qCurrentItem, linkId: newLinkId };
    }
}

function removeAttributeFromItem(draft: TreeState, action: RemoveItemAttributeAction): void {
    if (draft.qItems[action.linkId] && draft.qItems[action.linkId][action.itemProperty]) {
        delete draft.qItems[action.linkId][action.itemProperty];
    }
}

const reducer = produce((draft: TreeState, action: ActionType) => {
    // Flag as dirty on all changes except reset, save and "scroll"
    if (
        action.type !== RESET_QUESTIONNAIRE_ACTION &&
        action.type !== SAVE_ACTION &&
        action.type !== UPDATE_MARKED_LINK_ID
    ) {
        draft.isDirty = true;
    }
    switch (action.type) {
        case ADD_ITEM_CODE_ACTION:
            addItemCode(draft, action);
            break;
        case DELETE_ITEM_CODE_ACTION:
            deleteItemCode(draft, action);
            break;
        case UPDATE_ITEM_CODE_PROPERTY_ACTION:
            updateItemCodeProperty(draft, action);
            break;
        case ADD_QUESTIONNAIRE_LANGUAGE_ACTION:
            addLanguage(draft, action);
            break;
        case REMOVE_QUESTIONNAIRE_LANGUAGE_ACTION:
            removeLanguage(draft, action);
            break;
        case RESET_QUESTIONNAIRE_ACTION:
            resetQuestionnaire(draft, action);
            break;
        case SAVE_ACTION:
            draft.isDirty = false;
            break;
        case UPDATE_QUESTIONNAIRE_METADATA_ACTION:
            updateQuestionnaireMetadataProperty(draft, action);
            break;
        case NEW_ITEM_ACTION:
            createNewItem(draft, action);
            break;
        case DELETE_ITEM_ACTION:
            deleteItem(draft, action);
            break;
        case DELETE_CHILD_ITEMS_ACTION:
            deleteChildItems(draft, action);
            break;
        case UPDATE_ITEM_ACTION:
            updateItem(draft, action);
            break;
        case UPDATE_ITEM_TRANSLATION_ACTION:
            updateItemTranslation(draft, action);
            break;
        case UPDATE_ITEM_OPTION_TRANSLATION_ACTION:
            updateItemOptionTranslation(draft, action);
            break;
        case UPDATE_CONTAINED_VALUESET_TRANSLATION_ACTION:
            updateContainedValueSetTranslation(draft, action);
            break;
        case UPDATE_METADATA_TRANSLATION_ACTION:
            updateMetadataTranslation(draft, action);
            break;
        case UPDATE_SIDEBAR_TRANSLATION_ACTION:
            updateSidebarTranslation(draft, action);
            break;
        case DUPLICATE_ITEM_ACTION:
            duplicateItemAction(draft, action);
            break;
        case REORDER_ITEM_ACTION:
            reorderItem(draft, action);
            break;
        case MOVE_ITEM_ACTION:
            moveItem(draft, action);
            break;
        case UPDATE_VALUESET_ACTION:
            updateValueSet(draft, action);
            break;
        case IMPORT_VALUESET_ACTION:
            importValueSet(draft, action);
            break;
        case UPDATE_LINK_ID_ACTION:
            updateLinkId(draft, action);
            break;
        case REMOVE_ITEM_ATTRIBUTE_ACTION:
            removeAttributeFromItem(draft, action);
            break;
        case UPDATE_MARKED_LINK_ID:
            updateMarkedItemId(draft, action);
            break;
    }
});

export const TreeContext = createContext<{
    state: TreeState;
    dispatch: Dispatch<ActionType>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const TreeContextProvider = (props: { children: JSX.Element }): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const startTime = performance.now();
        const save = async () => {
            await saveStateToDb(JSON.parse(JSON.stringify(state)));
        };
        save();
        console.debug(`State saved in ${Math.round(performance.now() - startTime)}ms`);
    }, [state]);

    return (
        // eslint-disable-next-line
        // @ts-ignore
        <TreeContext.Provider value={{ state, dispatch }}>{props.children}</TreeContext.Provider>
    );
};
