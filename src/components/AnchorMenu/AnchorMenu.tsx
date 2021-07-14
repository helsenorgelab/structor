import './AnchorMenu.css';

import React from 'react';
import { ActionType, Items, OrderItem } from '../../store/treeStore/treeStore';
import { IQuestionnaireItemType } from '../../types/IQuestionnareItemType';
import {
    moveItemAction,
    newItemAction,
    reorderItemAction,
    updateMarkedLinkIdAction,
} from '../../store/treeStore/treeActions';
import { ValidationErrors } from '../../helpers/orphanValidation';
import SortableTree from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';
import { isIgnorableItem, isItemControlInline } from '../../helpers/itemControl';
import { generateItemButtons } from './ItemButtons/ItemButtons';

interface AnchorMenuProps {
    qOrder: OrderItem[];
    qItems: Items;
    validationErrors: ValidationErrors[];
    dispatch: React.Dispatch<ActionType>;
}

interface Node {
    title: string;
    hierarchy: string;
    children: Node[];
}

interface ExtendedNode {
    node: Node;
    path: string[];
}

interface NodeMoveEvent {
    treeData: Node[];
    nextParentNode: Node;
    node: Node;
    nextPath: string[];
    prevPath: string[];
}

interface NodeVisibilityToggleEvent {
    node: Node;
    expanded: boolean;
}

const AnchorMenu = (props: AnchorMenuProps): JSX.Element => {
    const [collapsedNodes, setCollapsedNodes] = React.useState<string[]>([]);

    const mapToTreeData = (item: OrderItem[], hierarchy: string, parentLinkId?: string): Node[] => {
        return item
            .filter((x) => {
                const parentItem = parentLinkId ? props.qItems[parentLinkId] : undefined;
                return !isIgnorableItem(props.qItems[x.linkId], parentItem);
            })
            .map((x, index) => {
                const newHierarchy = `${hierarchy}${index + 1}.`;
                return {
                    title: x.linkId,
                    hierarchy: newHierarchy,
                    children: mapToTreeData(x.items, newHierarchy, x.linkId),
                    expanded: collapsedNodes.indexOf(x.linkId) === -1,
                };
            });
    };

    const getNodeKey = (extendedNode: ExtendedNode): string => {
        return extendedNode.node.title;
    };

    const canCreateChild = (linkId: string): boolean => {
        const item = props.qItems[linkId];
        return item.type !== IQuestionnaireItemType.display && !isItemControlInline(item);
    };

    const treePathToOrderArray = (treePath: string[]): string[] => {
        const newPath = [...treePath];
        newPath.splice(-1);
        return newPath;
    };

    const hasValidationError = (linkId: string): boolean => {
        return props.validationErrors.some((error) => error.linkId === linkId);
    };

    const getRelevantIcon = (type: string) => {
        switch (type) {
            case IQuestionnaireItemType.group:
                return 'folder-icon';
            case IQuestionnaireItemType.display:
                return 'message-icon';
            default:
                return 'question-icon';
        }
    };

    const orderTreeData = mapToTreeData(props.qOrder, '');
    return (
        <div className="questionnaire-overview">
            {props.qOrder.length > 0 && (
                <SortableTree
                    treeData={orderTreeData}
                    onChange={() => {
                        /* dummy */
                    }}
                    getNodeKey={getNodeKey}
                    onMoveNode={({ treeData, nextParentNode, node, nextPath, prevPath }: NodeMoveEvent) => {
                        const newPath = treePathToOrderArray(nextPath);
                        const oldPath = treePathToOrderArray(prevPath);
                        // find parent node:
                        const moveIndex = nextParentNode
                            ? nextParentNode.children.findIndex((x: Node) => x.title === node.title)
                            : treeData.findIndex((x: Node) => x.title === node.title);

                        // reorder within same parent
                        if (JSON.stringify(newPath) === JSON.stringify(oldPath)) {
                            props.dispatch(reorderItemAction(node.title, newPath, moveIndex));
                        } else {
                            props.dispatch(moveItemAction(node.title, newPath, oldPath, moveIndex));
                        }
                    }}
                    onVisibilityToggle={({ node, expanded }: NodeVisibilityToggleEvent) => {
                        const filteredNodes = collapsedNodes.filter((x) => x !== node.title);
                        if (!expanded) {
                            filteredNodes.push(node.title);
                        }
                        setCollapsedNodes(filteredNodes);
                    }}
                    canNodeHaveChildren={(node: Node): boolean => {
                        return canCreateChild(node.title);
                    }}
                    generateNodeProps={(extendedNode: ExtendedNode) => ({
                        className: `anchor-menu__item ${
                            hasValidationError(extendedNode.node.title) ? 'validation-error' : ''
                        }`,
                        title: (
                            <span
                                className="anchor-menu__inneritem"
                                onClick={() => {
                                    props.dispatch(
                                        updateMarkedLinkIdAction(
                                            extendedNode.node.title,
                                            treePathToOrderArray(extendedNode.path),
                                        ),
                                    );
                                }}
                            >
                                <span className={getRelevantIcon(props.qItems[extendedNode.node.title].type)} />
                                <span className="anchor-menu__title">
                                    {extendedNode.node.hierarchy}
                                    {` `}
                                    {props.qItems[extendedNode.node.title].text}
                                </span>
                            </span>
                        ),
                        buttons: generateItemButtons(
                            props.qItems[extendedNode.node.title],
                            treePathToOrderArray(extendedNode.path),
                            false,
                            props.dispatch,
                        ),
                    })}
                />
            )}

            {props.qOrder.length === 0 && (
                <p className="center-text" style={{ padding: '0px 25px' }}>
                    Her vil du finne en oversikt over elementene i skjemaet.
                </p>
            )}
            <div className="floating-button">
                <button
                    className="new-item-button"
                    onClick={() => {
                        props.dispatch(newItemAction(IQuestionnaireItemType.group, []));
                    }}
                >
                    <i className="add-icon large" aria-label="add element" title="Opprett element" />
                    Legg til element på toppnivå
                </button>
            </div>
        </div>
    );
};

export default AnchorMenu;
