import { Items, OrderItem } from '../store/treeStore/treeStore';
import { ValueSet } from '../types/fhir';
import { isRecipientList } from './QuestionHelper';

export interface ValidationErrors {
    linkId: string;
    index?: number;
    errorProperty: string;
}

export const validateOrphanedElements = (
    qOrder: OrderItem[],
    qItems: Items,
    qContained: ValueSet[],
): ValidationErrors[] => {
    const errors: ValidationErrors[] = [];

    qOrder.forEach((x) => validate(x, qItems, qContained, errors));
    console.log(errors);
    return errors;
};

const validate = (currentItem: OrderItem, qItems: Items, qContained: ValueSet[], errors: ValidationErrors[]): void => {
    const qItem = qItems[currentItem.linkId];

    // validate that this item has a unique linkId:
    const hasLinkIdCollision = Object.keys(qItems).filter((x) => x === qItem.linkId).length > 1;
    if (hasLinkIdCollision) {
        errors.push({ linkId: qItem.linkId, errorProperty: 'linkId' });
    }

    // validate initial:
    if (qItem.initial && qItem.initial[0].valueCoding) {
        if (qItem.answerOption) {
            const isMatch = qItem.answerOption.find(
                (x) =>
                    qItem.initial &&
                    qItem.initial[0] &&
                    qItem.initial[0].valueCoding?.code === x.valueCoding?.code &&
                    qItem.initial[0].valueCoding?.system === x.valueCoding?.system,
            );
            if (!isMatch) {
                errors.push({ linkId: qItem.linkId, errorProperty: 'initial' });
            }
        } else if (qItem.answerValueSet) {
            const valueSetToCheck = qContained.find((x) => `#${x.id}` === qItem.answerValueSet);
            if (valueSetToCheck) {
                const system = valueSetToCheck.compose?.include[0].system;
                const isMatch = valueSetToCheck.compose?.include[0].concept?.find(
                    (x) =>
                        qItem.initial &&
                        qItem.initial[0] &&
                        qItem.initial[0].valueCoding?.code === x.code &&
                        qItem.initial[0].valueCoding?.system === system,
                );
                if (!isMatch) {
                    errors.push({ linkId: qItem.linkId, errorProperty: 'initial' });
                }
            } else {
                // valueSet does not exist
                errors.push({ linkId: qItem.linkId, errorProperty: 'initial' });
            }
        }
    }

    // validate enableWhen
    qItem.enableWhen?.forEach((ew, index) => {
        // does the question exist?
        const itemExists = !!qItems[ew.question];
        if (!itemExists) {
            errors.push({
                linkId: qItem.linkId,
                index: index,
                errorProperty: 'enableWhen.question',
            });
        }

        // does the quantity system and code match?
        if (qItems[ew.question].type === 'quantity') {
            const quantityExtension = qItems[ew.question].extension?.find(
                (x) => x.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
            );

            const isMatch =
                quantityExtension &&
                ew.answerQuantity.system === quantityExtension.valueCoding?.system &&
                ew.answerQuantity.code === quantityExtension.valueCoding?.code;

            if (!isMatch) {
                errors.push({
                    linkId: qItem.linkId,
                    index: index,
                    errorProperty: 'enableWhen.answerQuantity',
                });
            }
        }

        // if choice, does the Coding exist (or reference if question item is mottaker)?
        if (itemExists && (qItems[ew.question].type === 'choice' || qItems[ew.question].type === 'open-choice')) {
            if (isRecipientList(qItems[ew.question])) {
                // does the reference exist?
                const isMatch = qItems[ew.question].extension?.find(
                    (x) => x.valueReference?.reference === ew.answerReference.reference,
                );
                if (!isMatch) {
                    errors.push({
                        linkId: qItem.linkId,
                        index: index,
                        errorProperty: 'enableWhen.answerReference',
                    });
                }
            } else if (qItems[ew.question].answerOption) {
                const isMatch = qItems[ew.question].answerOption?.find(
                    (x) =>
                        x.valueCoding?.system === ew.answerCoding.system &&
                        x.valueCoding?.code === ew.answerCoding.code,
                );
                if (!isMatch) {
                    errors.push({
                        linkId: qItem.linkId,
                        index: index,
                        errorProperty: 'enableWhen.answerCoding',
                    });
                }
            } else if (qItems[ew.question].answerValueSet) {
                // check contained valueSets
                const valueSetToCheck = qContained.find((x) => `#${x.id}` === qItems[ew.question].answerValueSet);
                if (valueSetToCheck) {
                    const system = valueSetToCheck.compose?.include[0].system;
                    const isMatch = valueSetToCheck.compose?.include[0].concept?.find(
                        (x) => x.code === ew.answerCoding.code && system === ew.answerCoding.system,
                    );
                    if (!isMatch) {
                        errors.push({
                            linkId: qItem.linkId,
                            index: index,
                            errorProperty: 'enableWhen.answerCoding',
                        });
                    }
                } else {
                    // valueSet does not exist
                    errors.push({
                        linkId: qItem.linkId,
                        index: index,
                        errorProperty: 'enableWhen.answerCoding',
                    });
                }
            }
        }
    });

    currentItem.items.forEach((x) => validate(x, qItems, qContained, errors));
};