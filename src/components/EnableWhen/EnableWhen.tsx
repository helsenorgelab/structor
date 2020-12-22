import React, { useContext, useState } from 'react';
import { format, parse, parseISO, formatISO } from 'date-fns';
import { QuestionnaireItem, QuestionnaireItemEnableWhen, ValueSetComposeIncludeConcept } from '../../types/fhir';
import { IEnableWhen, IItemProperty, IOperator, IQuestionnaireItemType } from '../../types/IQuestionnareItemType';
import FormField from '../FormField/FormField';
import Select from '../Select/Select';
import { updateItemAction } from '../../store/treeStore/treeActions';
import { TreeContext } from '../../store/treeStore/treeStore';
import itemType, { operator } from '../../helpers/QuestionHelper';
import './EnableWhen.css';
import Infobox from './Infobox';
import Picker from '../DatePicker/DatePicker';
import DateTimePicker from '../DatePicker/DateTimePicker';
import { getSystem } from '../../helpers/answerOptionHelper';

type Props = {
    getItem: (linkId: string) => QuestionnaireItem;
    conditionalArray: {
        code: string;
        display: string;
    }[];
    linkId: string;
    enableWhen: QuestionnaireItemEnableWhen[];
};

const Conditional = ({ getItem, conditionalArray, linkId, enableWhen }: Props): JSX.Element => {
    const { dispatch } = useContext(TreeContext);
    const dispatchUpdateItemEnableWhen = (value: IEnableWhen[]) => {
        dispatch(updateItemAction(linkId, IItemProperty.enableWhen, value));
    };

    const [currentConditionItem, setCurrentConditionItem] = useState<QuestionnaireItem>();

    const getEnableWhenWidget = (conditionItem: QuestionnaireItem, itemEnableWhen: QuestionnaireItemEnableWhen) => {
        const param = conditionItem.type;

        switch (param) {
            case IQuestionnaireItemType.integer:
                return (
                    <>
                        <div className="horizontal equal">
                            <FormField label="Vis hvis svaret er:">
                                <Select
                                    placeholder="Velg en operator"
                                    options={operator}
                                    value={itemEnableWhen?.operator}
                                    onChange={(e) => {
                                        const copy = { ...itemEnableWhen, operator: e.currentTarget.value };
                                        dispatchUpdateItemEnableWhen([copy]);
                                    }}
                                />
                            </FormField>
                            <FormField label="Tall">
                                <input
                                    type="number"
                                    defaultValue={itemEnableWhen?.answerInteger}
                                    onChange={(e) => {
                                        const copy = {
                                            ...itemEnableWhen,
                                            answerInteger: parseInt(e.currentTarget.value),
                                        };
                                        dispatchUpdateItemEnableWhen([copy]);
                                    }}
                                />
                            </FormField>
                        </div>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong>{' '}
                                {operator.find((x) => x.code === itemEnableWhen?.operator)?.display.toLocaleLowerCase()}{' '}
                                <strong>{itemEnableWhen?.answerInteger}</strong>
                            </p>
                        </Infobox>
                    </>
                );
            case IQuestionnaireItemType.choice:
                const choices = (conditionItem.answerOption || []).map((x) => {
                    return { code: x.valueCoding.code || '', display: x.valueCoding.display };
                });

                return (
                    <>
                        <FormField label="Hvis hvis svaret er:">
                            <Select
                                placeholder="Velg et alternativ.."
                                options={choices}
                                value={itemEnableWhen?.answerCoding?.code}
                                onChange={(e) => {
                                    const copy = {
                                        ...itemEnableWhen,
                                        operator: IOperator.equal,
                                        answerCoding: {
                                            system: getSystem(conditionItem.linkId),
                                            code: e.target.value,
                                        },
                                    };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </FormField>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong>{' '}
                                {operator.find((x) => x.code === itemEnableWhen?.operator)?.display.toLocaleLowerCase()}{' '}
                                <strong>
                                    {choices.find((x) => x.code === itemEnableWhen?.answerCoding?.code)?.display}
                                </strong>
                            </p>
                        </Infobox>
                    </>
                );
            case IQuestionnaireItemType.boolean:
                const booleanChoices: ValueSetComposeIncludeConcept[] = [
                    { display: 'Avhuket', code: 'true' },
                    { display: 'Ikke avhuket', code: 'false' },
                ];

                const getAnswer = () => {
                    if (itemEnableWhen.answerBoolean === true) {
                        return 'true';
                    }
                    if (itemEnableWhen.answerBoolean === false) {
                        return 'false';
                    }

                    return '';
                };

                return (
                    <>
                        <FormField label="Hvis hvis svaret er:">
                            <Select
                                placeholder="Velg et alternativ.."
                                options={booleanChoices}
                                value={getAnswer()}
                                onChange={(e) => {
                                    const copy = {
                                        ...itemEnableWhen,
                                        operator: IOperator.equal,
                                        answerBoolean: e.target.value === 'true',
                                    };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </FormField>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong> er{' '}
                                <strong>
                                    {itemEnableWhen.answerBoolean === true && 'avhuket'}
                                    {itemEnableWhen.answerBoolean === false && 'ikke avhuket'}
                                </strong>
                            </p>
                        </Infobox>
                    </>
                );
            case IQuestionnaireItemType.date:
                const selectedDate = itemEnableWhen.answerDate
                    ? parse(itemEnableWhen.answerDate, 'yyyy-MM-dd', new Date())
                    : undefined;
                return (
                    <>
                        <FormField label="Vis hvis svaret er:">
                            <Select
                                placeholder="Velg en operator"
                                options={operator}
                                value={itemEnableWhen?.operator}
                                onChange={(e) => {
                                    const copy = { ...itemEnableWhen, operator: e.currentTarget.value };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                            <Picker
                                selected={selectedDate}
                                disabled={false}
                                withPortal
                                type="date"
                                callback={(date: Date) => {
                                    const copy = {
                                        ...itemEnableWhen,
                                        answerDate: format(date, 'yyyy-MM-dd'),
                                    };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </FormField>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong>{' '}
                                {operator.find((x) => x.code === itemEnableWhen?.operator)?.display.toLocaleLowerCase()}{' '}
                                <strong>{selectedDate && format(selectedDate, 'dd.MM.yyyy')}</strong>
                            </p>
                        </Infobox>
                    </>
                );
            case IQuestionnaireItemType.time:
                const selectedTime = itemEnableWhen.answerTime
                    ? parse(itemEnableWhen.answerTime, 'HH:mm:ss', new Date())
                    : undefined;

                return (
                    <>
                        <FormField label="Vis hvis svaret er:">
                            <Select
                                placeholder="Velg en operator"
                                options={operator}
                                value={itemEnableWhen?.operator}
                                onChange={(e) => {
                                    const copy = { ...itemEnableWhen, operator: e.currentTarget.value };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                            <Picker
                                selected={selectedTime}
                                type="time"
                                disabled={false}
                                withPortal
                                callback={(date: Date) => {
                                    const copy = {
                                        ...itemEnableWhen,
                                        answerTime: format(date, 'HH:mm:ss'),
                                    };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </FormField>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong>{' '}
                                {operator.find((x) => x.code === itemEnableWhen?.operator)?.display.toLocaleLowerCase()}{' '}
                                <strong>{itemEnableWhen.answerTime?.slice(0, 5)}</strong>
                            </p>
                        </Infobox>
                    </>
                );
            case IQuestionnaireItemType.dateTime:
                const selectedDateTime = itemEnableWhen.answerDateTime
                    ? parseISO(itemEnableWhen?.answerDateTime)
                    : undefined;

                return (
                    <>
                        <FormField label="Vis hvis svaret er:">
                            <Select
                                placeholder="Velg en operator"
                                options={operator}
                                value={itemEnableWhen?.operator}
                                onChange={(e) => {
                                    const copy = { ...itemEnableWhen, operator: e.currentTarget.value };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                            <DateTimePicker
                                selected={selectedDateTime}
                                disabled={false}
                                withPortal
                                callback={(date: Date) => {
                                    console.log(date);
                                    console.log(formatISO(date), 'formatted');
                                    const copy = {
                                        ...itemEnableWhen,
                                        answerDateTime: formatISO(date),
                                    };
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </FormField>
                        <Infobox title="Spørsmålet vil vises dersom svaret på:">
                            <p>
                                <strong>{conditionItem.text}</strong>{' '}
                                {operator.find((x) => x.code === itemEnableWhen?.operator)?.display.toLocaleLowerCase()}{' '}
                                <strong>{itemEnableWhen.answerTime?.slice(0, 5)}</strong>
                            </p>
                        </Infobox>
                    </>
                );
            default:
                return (
                    <p>
                        Skjemabyggeren supporterer ikke betinget visning av typen:{' '}
                        <strong>{itemType.find((x) => x.code === param)?.display || param}</strong>
                    </p>
                );
        }
    };

    return (
        <>
            <p>
                Hvis relevansen for dette spørsmålet er avhgengig av svaret på et tidligere spørsmål, velger dette her.
            </p>
            {enableWhen?.length == 0 && (
                <div className="form-field">
                    <label>Velg tidligere spørsmål</label>
                    <Select
                        placeholder="Velg spørsmål"
                        options={conditionalArray}
                        value={currentConditionItem?.linkId}
                        onChange={(event) => {
                            const copy = { question: event.target.value };
                            setCurrentConditionItem(getItem(event.target.value));
                            dispatchUpdateItemEnableWhen([copy]);
                        }}
                    />
                </div>
            )}

            {enableWhen.map((x, index) => {
                return (
                    <div key={index}>
                        <div className="form-field">
                            <label>Velg tidligere spørsmål</label>
                            <Select
                                placeholder="Velg spørsmål"
                                options={conditionalArray}
                                value={x.question}
                                onChange={(event) => {
                                    const copy = { question: event.target.value };
                                    setCurrentConditionItem(getItem(event.target.value));
                                    dispatchUpdateItemEnableWhen([copy]);
                                }}
                            />
                        </div>
                        {getEnableWhenWidget(getItem(x.question), x)}
                    </div>
                );
            })}
        </>
    );
};

export default Conditional;
