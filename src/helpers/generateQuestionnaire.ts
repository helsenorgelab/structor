import { CodeStringValue, Items, Languages, OrderItem, Translation, TreeState } from '../store/treeStore/treeStore';
import {
    Bundle,
    Extension,
    Questionnaire,
    QuestionnaireItem,
    QuestionnaireItemAnswerOption,
    ValueSet,
} from '../types/fhir';
import { IExtentionType, IQuestionnaireItemType } from '../types/IQuestionnareItemType';
import { IQuestionnaireMetadata } from '../types/IQuestionnaireMetadataType';
import { getLanguageFromCode, translatableMetadata } from './LanguageHelper';
import { isItemControlHighlight, isItemControlSidebar } from './itemControl';
import { emptyPropertyReplacer } from './emptyPropertyReplacer';

const getExtension = (extensions: Extension[] | undefined, extensionType: IExtentionType): Extension | undefined => {
    return extensions?.find((ext) => ext.url === extensionType);
};

const updateTranslatedExtension = (
    extensions: Extension[] | undefined,
    translatedExtension: Extension,
): Extension[] => {
    if (!extensions) {
        return [translatedExtension];
    }
    const translatedExtensions = [...extensions];
    const replaceIndex = translatedExtensions.findIndex((ext) => ext.url === translatedExtension.url);
    if (replaceIndex > -1) {
        translatedExtensions.splice(replaceIndex, 1, translatedExtension);
    }
    return translatedExtensions;
};

const getTranslatedAnswerOptions = (
    answerOptions: QuestionnaireItemAnswerOption[] | undefined,
    optionTranslations: CodeStringValue | undefined,
): QuestionnaireItemAnswerOption[] | undefined => {
    if (!answerOptions) {
        return undefined;
    }

    return answerOptions.map((answerOption) => {
        const code = answerOption.valueCoding?.code;
        const display = code && optionTranslations ? optionTranslations[code] || '' : '';
        return {
            valueCoding: { ...answerOption.valueCoding, display },
        };
    });
};

const getTranslatedContained = (qContained: Array<ValueSet> | undefined, translation: Translation) => {
    if (!qContained || qContained.length < 1) {
        return [];
    }

    return qContained.map((valueSet) => {
        if (!valueSet.compose?.include || !valueSet.compose.include[0].concept) {
            return valueSet;
        }

        const concept = valueSet.compose.include[0].concept.map((c) => {
            const translatedValue =
                valueSet.id && translation.contained[valueSet.id]
                    ? translation.contained[valueSet.id].concepts[c.code]
                    : '';
            return { ...c, display: translatedValue };
        });

        return {
            ...valueSet,
            compose: { ...valueSet.compose, include: [{ ...valueSet.compose.include[0], concept }] },
        };
    });
};

const getTranslatedSidebarItem = (translation: Translation, currentItem: QuestionnaireItem) => {
    const sidebarItemTranslation = translation?.sidebarItems[currentItem.linkId];
    let _text = undefined;
    const translatedText = sidebarItemTranslation.markdown;
    const markdownExtension = getExtension(currentItem._text?.extension, IExtentionType.markdown);
    if (markdownExtension) {
        const translatedMarkdownExtension = { ...markdownExtension, valueMarkdown: translatedText };
        _text = { extension: updateTranslatedExtension(currentItem._text?.extension, translatedMarkdownExtension) };
    }
    return { ...currentItem, _text };
};

const getTranslatedItem = (languageCode: string, orderItem: OrderItem, items: Items, languages: Languages) => {
    const currentItem = items[orderItem.linkId];
    if (isItemControlSidebar(currentItem)) {
        return getTranslatedSidebarItem(languages[languageCode], currentItem);
    }

    const itemTranslation = languages[languageCode].items[orderItem.linkId];

    // item.text
    let _text = undefined;
    const translatedText = itemTranslation?.text;
    const markdownExtension = getExtension(currentItem._text?.extension, IExtentionType.markdown);
    if (markdownExtension) {
        const translatedMarkdownExtension = { ...markdownExtension, valueMarkdown: translatedText };
        _text = { extension: updateTranslatedExtension(currentItem._text?.extension, translatedMarkdownExtension) };
    }

    let extension = undefined;
    if (currentItem.extension) {
        extension = [...currentItem.extension];
    }

    // ValidationMessage
    const validationTextExtension = getExtension(extension, IExtentionType.validationtext);
    if (validationTextExtension) {
        const translatedValidationTextExtension = {
            ...validationTextExtension,
            valueString: itemTranslation?.validationText,
        };
        extension = updateTranslatedExtension(extension, translatedValidationTextExtension);
    }

    // Placeholder
    const entryFormatExtension = getExtension(extension, IExtentionType.entryFormat);
    if (entryFormatExtension) {
        const translatedEntryFormatExtension = {
            ...entryFormatExtension,
            valueString: itemTranslation?.entryFormatText,
        };
        extension = updateTranslatedExtension(extension, translatedEntryFormatExtension);
    }

    // Sublabel
    const sublabelExtension = getExtension(extension, IExtentionType.sublabel);
    if (sublabelExtension) {
        const translatedSublabelExtension = {
            ...sublabelExtension,
            valueMarkdown: itemTranslation?.sublabel,
        };
        extension = updateTranslatedExtension(extension, translatedSublabelExtension);
    }

    // Repeatstext
    const repeatsTextExtension = getExtension(extension, IExtentionType.repeatstext);
    if (repeatsTextExtension) {
        const translatedRepeatsTextExtension = {
            ...repeatsTextExtension,
            valueString: itemTranslation?.repeatsText,
        };
        extension = updateTranslatedExtension(extension, translatedRepeatsTextExtension);
    }

    const answerOption = getTranslatedAnswerOptions(currentItem.answerOption, itemTranslation?.answerOptions);
    const initial =
        (currentItem.type === IQuestionnaireItemType.text || currentItem.type === IQuestionnaireItemType.string) &&
        itemTranslation?.initial
            ? [{ valueString: itemTranslation?.initial }]
            : currentItem.initial;

    return { ...currentItem, text: translatedText, _text, extension, answerOption, initial };
};

const getTranslatedMetadata = (qMetadata: IQuestionnaireMetadata, translation: Translation): IQuestionnaireMetadata => {
    const translatedMetadata: IQuestionnaireMetadata = {};
    translatableMetadata.forEach((metadataProperty) => {
        translatedMetadata[metadataProperty.propertyName] = translation.metaData[metadataProperty.propertyName];
    });
    return { ...qMetadata, ...translatedMetadata };
};

function getLanguageData(qMetadata: IQuestionnaireMetadata, languageCode: string) {
    const tag = qMetadata.meta?.tag;
    if (!tag || !tag[0]) {
        return { language: languageCode };
    }
    return {
        language: languageCode,
        meta: {
            ...qMetadata.meta,
            tag: [{ ...tag[0], code: languageCode, display: getLanguageFromCode(languageCode)?.localDisplay }],
        },
    };
}

const generateTree = (order: Array<OrderItem>, items: Items): Array<QuestionnaireItem> => {
    return order.map((x) => {
        return {
            ...items[x.linkId],
            type: isItemControlHighlight(items[x.linkId]) ? 'text' : items[x.linkId].type, // TODO: remove after highlight is moved to display
            item: generateTree(x.items, items),
        };
    });
};

const generateTreeWithTranslations = (
    order: Array<OrderItem>,
    items: Items,
    languageCode: string,
    languages: Languages,
): Array<QuestionnaireItem> => {
    return order.map((x) => {
        return {
            ...items[x.linkId],
            ...getTranslatedItem(languageCode, x, items, languages),
            type: isItemControlHighlight(items[x.linkId]) ? 'text' : items[x.linkId].type, // TODO: remove after highlight is moved to display
            item: generateTreeWithTranslations(x.items, items, languageCode, languages),
        };
    });
};

const generateMainQuestionnaire = (state: TreeState, usedValueSet: string[]): Questionnaire => ({
    ...state.qMetadata,
    contained: state.qContained?.filter((x) => x.id && usedValueSet?.includes(x.id) && x) as ValueSet[],
    resourceType: 'Questionnaire',
    status: state.qMetadata.status || 'draft',
    item: generateTree(state.qOrder, state.qItems),
});

const generateTranslatedQuestionnaire = (
    state: TreeState,
    languageCode: string,
    languages: Languages,
    usedValueSet: string[],
): Questionnaire => ({
    ...getTranslatedMetadata(state.qMetadata, languages[languageCode]),
    ...getLanguageData(state.qMetadata, languageCode),
    contained: getTranslatedContained(state.qContained, languages[languageCode]).filter(
        (x) => x.id && usedValueSet?.includes(x.id),
    ),
    resourceType: 'Questionnaire',
    status: state.qMetadata.status || 'draft',
    item: generateTreeWithTranslations(state.qOrder, state.qItems, languageCode, languages),
});

function getUsedValueSet(state: TreeState) {
    const allValueSets = [] as string[];
    Object.keys(state.qItems).forEach(function (linkId) {
        const item = state.qItems[linkId];
        if (item.type && item.answerValueSet) {
            allValueSets.push(item.answerValueSet?.slice(1));
        }
    });

    return Array.from(new Set(allValueSets));
}

export const generateQuestionnaire = (state: TreeState): string => {
    const usedValueSet = getUsedValueSet(state);
    function translateQuestionnaires(): Questionnaire[] {
        const questionnaires: Questionnaire[] = [];

        const { qAdditionalLanguages } = state;
        if (qAdditionalLanguages) {
            Object.keys(qAdditionalLanguages).forEach((languageCode) =>
                questionnaires.push(
                    generateTranslatedQuestionnaire(state, languageCode, qAdditionalLanguages, usedValueSet),
                ),
            );
        }
        return questionnaires;
    }

    // Return bundle if translations exist
    if (state.qAdditionalLanguages && Object.keys(state.qAdditionalLanguages).length > 0) {
        const bundle: Bundle = {
            resourceType: 'Bundle',
            type: 'searchset',
            total: Object.keys(state.qAdditionalLanguages).length + 1,
            entry: [generateMainQuestionnaire(state, usedValueSet), ...translateQuestionnaires()],
        };

        return JSON.stringify(bundle, emptyPropertyReplacer);
    }

    return JSON.stringify(generateMainQuestionnaire(state, usedValueSet), emptyPropertyReplacer);
};

export const generateQuestionnaireForPreview = (state: TreeState, language?: string): string => {
    const usedValueSet = getUsedValueSet(state);
    const { qAdditionalLanguages } = state;
    if (language && qAdditionalLanguages && qAdditionalLanguages[language]) {
        return JSON.stringify(
            generateTranslatedQuestionnaire(state, language, qAdditionalLanguages, usedValueSet),
            emptyPropertyReplacer,
        );
    }
    return JSON.stringify(generateMainQuestionnaire(state, usedValueSet), emptyPropertyReplacer);
};
