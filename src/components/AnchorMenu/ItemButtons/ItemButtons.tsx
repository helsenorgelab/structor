import React, { MouseEvent } from 'react';

import { ActionType } from '../../../store/treeStore/treeStore';
import { QuestionnaireItem } from '../../../types/fhir';

import './ItemButtons.css';
import { deleteItemAction, duplicateItemAction, newItemAction } from '../../../store/treeStore/treeActions';
import { IQuestionnaireItemType } from '../../../types/IQuestionnareItemType';
import { isItemControlInline } from '../../../helpers/itemControl';

export enum ItemButtonType {
    addChild = 'addChild',
    copy = 'copy',
    delete = 'delete',
}

type ItemButtonsProps = {
    item: QuestionnaireItem;
    parentArray: Array<string>;
    dispatch: React.Dispatch<ActionType>;
    buttons?: Array<ItemButtonType>;
};

const ItemButtons = (props: ItemButtonsProps): JSX.Element => {
    const dispatchDeleteItem = (event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        props.dispatch(deleteItemAction(props.item.linkId, props.parentArray));
    };

    const dispatchAddChildItem = (event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        props.dispatch(newItemAction(IQuestionnaireItemType.group, [...props.parentArray, props.item.linkId]));
    };

    const dispatchDuplicateItem = (event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        props.dispatch(duplicateItemAction(props.item.linkId, props.parentArray));
    };

    const canCreateChild = props.item.type !== IQuestionnaireItemType.display && !isItemControlInline(props.item);
    const displayAddButton = !props.buttons || props.buttons.includes(ItemButtonType.addChild);
    const displayCopyButton = !props.buttons || props.buttons.includes(ItemButtonType.copy);
    const displayDeleteButton = !props.buttons || props.buttons.includes(ItemButtonType.delete);

    return (
        <div className="item-buttons">
            {displayAddButton && canCreateChild && (
                <button className="item-button" onClick={dispatchAddChildItem}>
                    <i className="add-icon" aria-label="Add child element" title="Oppfølgingsspørsmål" />
                </button>
            )}
            {displayCopyButton && (
                <button className="item-button" onClick={dispatchDuplicateItem}>
                    <i className="duplicate-icon" aria-label="Duplicate element" title="Dupliser" />
                </button>
            )}
            {displayDeleteButton && (
                <button className="item-button" onClick={dispatchDeleteItem}>
                    <i className="trash-icon" aria-label="Delete element" title="Slett" />
                </button>
            )}
        </div>
    );
};

export default ItemButtons;
