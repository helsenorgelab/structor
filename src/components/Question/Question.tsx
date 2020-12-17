import React, { useContext } from 'react';
import { TreeContext } from '../../store/treeStore/treeStore';
import {
    newItemAction,
    deleteItemAction,
    updateItemAction,
    newValueSetCodeAction,
    updateValueSetCodeAction,
    deleteValueSetCodeAction,
    duplicateItemAction,
} from '../../store/treeStore/treeActions';
import { QuestionnaireItem, ValueSetComposeIncludeConcept } from '../../types/fhir';
import Trashcan from '../../images/icons/trash-outline.svg';
import PlusIcon from '../../images/icons/add-circle-outline.svg';
import CopyIcon from '../../images/icons/copy-outline.svg';
import itemType, { checkboxExtension } from '../../helpers/QuestionHelper';
import { IItemProperty, IQuestionnaireItemType } from '../../types/IQuestionnareItemType';
import Picker from '../DatePicker/DatePicker';
import './Question.css';
import SwitchBtn from '../SwitchBtn/SwitchBtn';
import Select from '../Select/Select';
import RadioBtn from '../RadioBtn/RadioBtn';
import Btn from '../Btn/Btn';
import Accordion from '../Accordion/Accordion';
import EnableWhen from '../EnableWhen/EnableWhen';

interface QuestionProps {
    item: QuestionnaireItem;
    parentArray: Array<string>;
    valueSet: (linkId: string) => ValueSetComposeIncludeConcept[];
    questionNumber: string;
    conditionalArray: {
        code: string;
        display: string;
    }[];
    getItem: (linkId: string) => QuestionnaireItem;
}

const Question = (props: QuestionProps): JSX.Element => {
    const { dispatch } = useContext(TreeContext);

    const dispatchNewItem = (type?: IQuestionnaireItemType) => {
        dispatch(newItemAction(type || IQuestionnaireItemType.group, [...props.parentArray, props.item.linkId]));
    };

    const dispatchDeleteItem = () => {
        dispatch(deleteItemAction(props.item.linkId, props.parentArray));
    };

    const dispatchDuplicateItem = () => {
        dispatch(duplicateItemAction(props.item.linkId, props.parentArray));
    };

    const dispatchUpdateItem = (name: IItemProperty, value: string | boolean) => {
        dispatch(updateItemAction(props.item.linkId, name, value));
    };

    const dispatchNewValueSetQuestion = (question: string) => {
        dispatch(newValueSetCodeAction(props.item.linkId, question));
    };

    const dispatchUpdateValueSet = (valueSet: ValueSetComposeIncludeConcept) => {
        dispatch(updateValueSetCodeAction(props.item.linkId, valueSet));
    };

    const dispatchExtentionUpdate = () => {
        if (props.item.extension && props.item.extension.length > 0) {
            dispatch(updateItemAction(props.item.linkId, IItemProperty.extension, []));
        } else {
            dispatch(updateItemAction(props.item.linkId, IItemProperty.extension, checkboxExtension));
        }
    };

    const dispatchDeleteValueSet = (code: string) => {
        dispatch(deleteValueSetCodeAction(props.item.linkId, code));
    };

    const respondType = (param: string) => {
        const valueSet = props.valueSet(props.item.linkId);

        switch (param) {
            case IQuestionnaireItemType.string:
                return (
                    <div className="form-field">
                        <label></label>
                        <input disabled value="Kortsvar" />
                    </div>
                );
            case IQuestionnaireItemType.text:
                return (
                    <div className="form-field">
                        <label></label>
                        <input disabled value="Langsvar" />
                    </div>
                );
            case IQuestionnaireItemType.date:
                return (
                    <div className="form-field">
                        <label></label>
                        <Picker />
                    </div>
                );
            case IQuestionnaireItemType.time:
                return (
                    <div className="form-field">
                        <label></label>
                        <Picker type="time" />
                    </div>
                );
            case IQuestionnaireItemType.dateTime:
                return (
                    <div className="form-field">
                        <label></label>
                        <div className="horizontal">
                            <Picker type="time" />
                            <Picker type="date" />
                        </div>
                    </div>
                );
            case IQuestionnaireItemType.boolean:
                return (
                    <div className="form-field">
                        <input type="checkbox" style={{ zoom: 1.5 }} disabled checked />
                    </div>
                );
            case IQuestionnaireItemType.choice:
                return (
                    <>
                        <div className="form-field">
                            <SwitchBtn
                                label="Checkbox"
                                onClick={() => dispatchExtentionUpdate()}
                                initial
                                value={props.item.extension !== undefined && props.item.extension.length > 0}
                            />
                            {valueSet?.map((set, index) => (
                                <>
                                    <RadioBtn
                                        key={index}
                                        showDelete={index > 1}
                                        valueSetID={props.item.linkId}
                                        value={set.display}
                                        onChange={(event) => {
                                            const clone = { ...set, display: event.target.value };
                                            dispatchUpdateValueSet(clone);
                                        }}
                                        deleteItem={() => dispatchDeleteValueSet(set.code)}
                                    />
                                </>
                            ))}
                        </div>
                        <Btn title="+ Legg til alternativ" onClick={() => dispatchNewValueSetQuestion('')} />
                    </>
                );
            case IQuestionnaireItemType.openChoice:
                return (
                    <>
                        <div className="form-field">
                            <SwitchBtn
                                label="Checkbox"
                                onClick={() => dispatchExtentionUpdate()}
                                initial
                                value={props.item.extension !== undefined && props.item.extension.length > 0}
                            />
                            {valueSet?.map((set, index) => (
                                <RadioBtn
                                    key={index}
                                    showDelete={index > 1}
                                    valueSetID={set.code + '-valueSet'}
                                    value={set.display}
                                    onChange={(event) => {
                                        const clone = { ...set, display: event.target.value };
                                        dispatchUpdateValueSet(clone);
                                    }}
                                    deleteItem={() => dispatchDeleteValueSet(set.code)}
                                />
                            ))}
                            <RadioBtn value="eget svaralternativ for bruker" />
                        </div>
                        <Btn title="+ Legg til alternativ" onClick={() => dispatchNewValueSetQuestion('')} />
                    </>
                );
            case IQuestionnaireItemType.integer:
                return (
                    <>
                        <div className="form-field">
                            <Select
                                options={[
                                    { display: 'ingen formatering', code: '1' },
                                    { display: 'kg', code: '2' },
                                    { display: 'år', code: '3' },
                                    { display: 'måneder', code: '4' },
                                    { display: 'dager', code: '5' },
                                ]}
                                onChange={() => {
                                    //TODO!
                                }}
                            />
                        </div>
                    </>
                );
            default:
                return '';
        }
    };

    return (
        <div className="question" style={{ marginLeft: props.parentArray.length * 32 }}>
            <div className="question-header">
                <h2>
                    Spørsmål <span>{props.questionNumber}</span>
                </h2>
                <button className="pull-right" onClick={dispatchDuplicateItem}>
                    <img src={CopyIcon} height="25" width="25" /> Dupliser
                </button>
                <button onClick={() => dispatchNewItem()}>
                    <img src={PlusIcon} height="25" width="25" /> Oppfølgingsspørsmål
                </button>
                <button onClick={dispatchDeleteItem}>
                    <img src={Trashcan} height="25" width="25" /> Slett
                </button>
            </div>
            <div className="question-form">
                <SwitchBtn
                    label="Obligatorisk"
                    value={props.item.required || false}
                    onClick={() => dispatchUpdateItem(IItemProperty.required, !props.item.required)}
                />
                <div className="form-field">
                    <label>Velg spørsmålstype</label>
                    <Select
                        value={props.item.type}
                        options={itemType}
                        onChange={(event: { target: { value: string | boolean } }) => {
                            dispatchUpdateItem(IItemProperty.type, event.target.value);
                        }}
                    />
                </div>
                <div className="form-field">
                    <label>Skriv spørsmål</label>
                    <input
                        value={props.item.text}
                        onChange={(e) => {
                            dispatchUpdateItem(IItemProperty.text, e.target.value);
                        }}
                    />
                </div>
                {/*<div className="form-field">
                    <label>Legg til beskrivelse (valgfritt)</label>
                    <input onChange={(e) => {
                        dispatchUpdateItem(IItemProperty.des, e.target.value);
                    }}
                    />
                </div>*/}
                {respondType(props.item.type)}
            </div>

            <div className="question-addons">
                <Accordion title="Legg til validering">
                    {/* CHECK FOR TYPE */}
                    {props.item.type === IQuestionnaireItemType.integer && (
                        <>
                            <div className="validating-help-title">
                                <p>Veiledende tekst</p>
                            </div>

                            <div className="allow-decimal">
                                <input
                                    type="checkbox"
                                    onChange={() => {
                                        // TODO
                                    }}
                                />
                                <span> Tillat desimaltall</span>
                            </div>

                            <div className="form-field half">
                                <label className="#">Svaret skal være:</label>
                                <Select
                                    options={[
                                        { display: 'Velg kriterie', code: '0' },
                                        { display: 'Større enn', code: '1' },
                                        { display: 'Mindre enn', code: '2' },
                                    ]}
                                    onChange={() => {
                                        //TODO!
                                    }}
                                ></Select>
                            </div>

                            {/* SHOW WHEN SELECED A VALUE */}
                            <div className="form-field half">
                                <label className="#">Skriv inn ett tall:</label>
                                <input
                                    type="input"
                                    placeholder="5"
                                    onChange={() => {
                                        //TODO
                                    }}
                                ></input>
                            </div>

                            <div className="form-field">
                                <a
                                    href="#"
                                    onClick={() => {
                                        //TODO
                                    }}
                                >
                                    + Legg til kriterie
                                </a>
                            </div>

                            <div className="form-field custom-input-error-message">
                                <label className="#">Legg til egendefinert feilmelding:</label>
                                <input
                                    type="input"
                                    placeholder="feilmelding"
                                    onChange={() => {
                                        //TODO
                                    }}
                                ></input>
                            </div>
                        </>
                    )}
                </Accordion>
                {props.parentArray.length > 0 && (
                    <Accordion title="Legg til betinget visning">
                        <div style={{ width: '66%', minHeight: '442px' }}>
                            <EnableWhen
                                getItem={props.getItem}
                                getValueSet={props.valueSet}
                                conditionalArray={props.conditionalArray}
                                linkId={props.item.linkId}
                                enableWhen={props.item.enableWhen || []}
                            />
                        </div>
                    </Accordion>
                )}
            </div>
        </div>
    );
};

export default Question;
