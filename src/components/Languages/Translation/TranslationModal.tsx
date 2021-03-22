import React, { useContext, useEffect, useState } from 'react';
import Modal from '../../Modal/Modal';
import { OrderItem, TreeContext } from '../../../store/treeStore/treeStore';
import { updateItemTranslationAction } from '../../../store/treeStore/treeActions';
import './TranslationModal.css';
import TranslateItemRow from './TranslateItemRow';
import { getItemPropertyTranslation, getLanguageFromCode } from '../../../helpers/LanguageHelper';
import { QuestionnaireItem } from '../../../types/fhir';
import TranslateMetaData from './TranslateMetaData';
import TranslateContainedValueSets from './TranslateContainedValueSets';
import { getHelpText, isIgnorableItem, isItemControlHelp, isItemControlSidebar } from '../../../helpers/itemControl';
import TranslateSidebar from './TranslateSidebar';
import FormField from '../../FormField/FormField';
import MarkdownEditor from '../../MarkdownEditor/MarkdownEditor';
import { TranslatableItemProperty } from '../../../types/LanguageTypes';
import { IExtentionType } from '../../../types/IQuestionnareItemType';

type TranslationModalProps = {
    close: () => void;
    targetLanguage: string;
};

interface FlattOrderTranslation {
    linkId: string;
    path: string;
    helpItemLinkId?: string;
}

const TranslationModal = (props: TranslationModalProps): JSX.Element => {
    const { state, dispatch } = useContext(TreeContext);
    const { qItems, qOrder, qAdditionalLanguages, qMetadata, qContained } = state;
    const [flattOrder, setFlattOrder] = useState<FlattOrderTranslation[]>([]);
    const [count, setLimit] = useState(20);

    const handleChild = (items: OrderItem[], path: string, tempHierarchy: FlattOrderTranslation[]) => {
        let index = 1;
        items
            .filter((x) => !isItemControlSidebar(qItems[x.linkId]))
            .forEach((item) => {
                const itemHasHelpChild = item.items.find((child) => isItemControlHelp(qItems[child.linkId]));
                const childPath = `${path}${index}`;
                const tempItem = { linkId: item.linkId, path: childPath } as FlattOrderTranslation;
                if (itemHasHelpChild) {
                    tempItem.helpItemLinkId = itemHasHelpChild.linkId;
                }
                if (!isItemControlHelp(qItems[item.linkId])) {
                    tempHierarchy.push(tempItem);
                    index++;
                }
                if (item.items) {
                    handleChild(item.items, childPath, tempHierarchy);
                }
            });
    };

    const flattenOrder = () => {
        const temp = [] as FlattOrderTranslation[];
        qOrder
            .filter((x) => !isIgnorableItem(qItems[x.linkId]))
            .forEach((item, index) => {
                const itemPath = `${index + 1}.`;
                const tempItem = { linkId: item.linkId, path: itemPath } as FlattOrderTranslation;
                const helpItem = item.items.find((child) => isItemControlHelp(qItems[child.linkId]));
                if (helpItem) {
                    tempItem.helpItemLinkId = helpItem.linkId;
                }
                temp.push(tempItem);
                if (item.items) {
                    handleChild(item.items, itemPath, temp);
                }
            });
        setFlattOrder([...temp]);
    };

    const isTranslatableItem = (item: QuestionnaireItem): boolean =>
        // Hidden items
        !item.extension?.some((ext) => ext.url === IExtentionType.hidden && ext.valueBoolean) &&
        !isItemControlSidebar(item);

    const translatableItems = Object.values(qItems).filter((question) => {
        return isTranslatableItem(question);
    });

    const getHeader = (): JSX.Element => (
        <div className="sticky-header">
            {qMetadata.language && (
                <div className="horizontal equal">
                    <div>
                        <label>{getLanguageFromCode(qMetadata.language)?.display}</label>
                    </div>
                    <div>
                        <label>{getLanguageFromCode(props.targetLanguage)?.display}</label>
                    </div>
                </div>
            )}
        </div>
    );

    const renderHelpText = (linkId: string): JSX.Element | null => {
        if (!qAdditionalLanguages) {
            return null;
        }
        const helpText = getHelpText(qItems[linkId]);
        const translatedHelpText = getItemPropertyTranslation(
            props.targetLanguage,
            qAdditionalLanguages,
            linkId,
            TranslatableItemProperty.text,
        );
        return (
            <>
                <div className="translation-group-header">Hjelpetekst</div>
                <div className="translation-row">
                    <FormField>
                        <MarkdownEditor data={helpText} disabled={true} />
                    </FormField>
                    <FormField>
                        <MarkdownEditor
                            data={translatedHelpText}
                            onBlur={(value) =>
                                dispatch(
                                    updateItemTranslationAction(
                                        props.targetLanguage,
                                        linkId,
                                        TranslatableItemProperty.text,
                                        value,
                                    ),
                                )
                            }
                        />
                    </FormField>
                </div>
            </>
        );
    };

    useEffect(() => {
        flattenOrder();
        const options = {
            root: document.getElementById('translation-modal'),
            rootMargin: '63px 0px 0px 0px',
            threshold: [0, 0.5, 1],
        };

        const observed = (elements: IntersectionObserverEntry[]) => {
            if (elements[0].intersectionRatio === 1) {
                setLimit((prevState) => prevState + 25);
            }
        };

        const myObserver = new IntersectionObserver(observed, options);

        const myEl = document.getElementById('bottom-translation-modal');

        if (myEl) {
            myObserver.observe(myEl);
        }

        return function cleanup() {
            myObserver.disconnect();
        };
    }, []);

    const renderItems = (orderItems: FlattOrderTranslation[]): Array<JSX.Element | null> => {
        if (translatableItems && qAdditionalLanguages) {
            return orderItems.map((orderItem) => {
                const item = translatableItems.find((i) => i.linkId === orderItem.linkId);
                if (item) {
                    return (
                        <div key={`${props.targetLanguage}-${item.linkId}`}>
                            <div className="translation-item">
                                <TranslateItemRow
                                    item={item}
                                    targetLanguage={props.targetLanguage}
                                    itemHeading={`Element ${orderItem.path}`}
                                />
                                {orderItem.helpItemLinkId && renderHelpText(orderItem.helpItemLinkId)}
                            </div>
                        </div>
                    );
                }
                return null;
            });
        }
        return [];
    };

    return (
        <div className="translation-modal">
            <Modal close={props.close} title="Oversett skjema" id="translation-modal" bottomCloseText="Lukk">
                {getHeader()}
                <div style={{ position: 'relative' }}>
                    <>
                        {qAdditionalLanguages && (
                            <>
                                <TranslateMetaData
                                    state={state}
                                    targetLanguage={props.targetLanguage}
                                    dispatch={dispatch}
                                />
                                <TranslateSidebar
                                    targetLanguage={props.targetLanguage}
                                    translations={qAdditionalLanguages}
                                    items={qItems}
                                    dispatch={dispatch}
                                />
                                {!!qContained && qContained?.length > 0 && (
                                    <TranslateContainedValueSets
                                        qContained={qContained}
                                        targetLanguage={props.targetLanguage}
                                        translations={qAdditionalLanguages}
                                        dispatch={dispatch}
                                    />
                                )}
                                <div>
                                    <div className="translation-section-header">Elementer</div>
                                    {renderItems(flattOrder.filter((val, i) => i <= count))}
                                </div>
                                <div
                                    id="bottom-translation-modal"
                                    style={{ height: 1, position: 'absolute', bottom: 500 }}
                                />
                            </>
                        )}
                    </>
                </div>
            </Modal>
        </div>
    );
};

export default TranslationModal;
